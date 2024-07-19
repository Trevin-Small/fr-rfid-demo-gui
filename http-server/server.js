const fs = require('fs');
const redis = require('redis');
const ntp = require('ntp-client');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

// Enable CORS for any origin
app.use(cors());

// Middleware to parse JSON bodies
app.use(bodyParser.json({limit: '50mb'}));

// parse application/vnd.api+json as json
app.use(bodyParser.json({ type: 'application/vnd.api+json' }))

// Make new redis client with hostname redis port 6379
const redisClient = redis.createClient({url: 'redis://redis:6379'});

// Blocking wait for connection to redis
(async () => {
  redisClient.on('error', err => console.log(err));
	await redisClient.connect();
  console.log('Connected to redis server!');
})();

// Parse tag list from json file
const tag_list = JSON.parse(fs.readFileSync('tag_list.json', 'utf8'));

// Initial inventory state
const empty_inventory = {
  "snickers": 0,
  "acai": 0, 
  "chocolate": 0,
  "cotton": 0,
  "mint": 0,
  "oreo": 0,
  "pb": 0,
  "straw": 0,
  "vanilla": 0,
  "mango": 0,
  "mystery": 0,
  "total": 0
};

const FREQ_EXP = 1.45;
const EXPIRATION_CONST = 6;
const READ_COUNT_NUMERATOR = 3;
const DEFAULT_FREQ = 30;

// Server test route - return data under key 'hello'
app.get('/server-test', async (req, res) => {
	let data = await redisClient.get('hello');
	res.status(200).json({ data });
});

app.get('/inventory', async (req, res) => {

  ntp.getNetworkTime("pool.ntp.org", 123, async (err, date) => {
    if (err) {
      console.log("ntp time error: ", err);
      return err;
    }

    let curr_time = (date.getTime() / 1000);

    console.log("\ncurrent time: ", curr_time);

    // Make deep copy of empty_inventory object
    const inventory = { ...empty_inventory };
    let total_inventory = 0;

    console.log("Expired tags:");

    // Iterate through tag list
    for (let i in tag_list.tags) {
      let tag_id = String(tag_list.tags[i]);

      // Get tag event from redis, parse into json
      let tag_data = await redisClient.get(tag_id);

      // If no data exists for this tag id, continue
      if (!tag_data) continue;

      tag_data = JSON.parse(tag_data);

      let freq = get_read_freq(tag_data);
      let avg_reads = get_avg_reads(tag_data);
      let expiration_time = Math.pow(freq, FREQ_EXP) + (READ_COUNT_NUMERATOR / avg_reads) + EXPIRATION_CONST;

      let time_diff = (curr_time - tag_data.timestamps.slice(-1)[0]);

      console.log(tag_id, " exp data: ", freq, expiration_time - time_diff);

      // If it has been less than average_read_freq * FREQ_COEF time since seeing tag, it is in stock
      if (time_diff < expiration_time) {
        inventory[tag_data.flavor]++;
        total_inventory++;
      } else {
      // console.log(tag_id + " Expired!");
      }
    }

    inventory.total = total_inventory;

    // Return status 200 with new_inventory state
    res.status(200).json({ inventory });

  });
});


// Start the server
app.listen(8000, () => {
  console.log(`Server is running on port 8000`);
});

function get_read_freq(tag_data) {
	if (tag_data.timestamps.length < 2) return DEFAULT_FREQ;
	let range = (tag_data.timestamps.slice(-1)[0] - tag_data.timestamps[0]);
	let read_freq = range / (tag_data.timestamps.length - 1);
	return read_freq;
}

function get_avg_reads(tag_data) {
	console.log(tag_data.read_arr);
	if (tag_data.read_arr.length == 1) return tag_data.read_arr[0];
	let total = 0;
	for (let read in tag_data.read_arr) {
		total += read;
	}
	return total / tag_data.read_arr.length;
}
