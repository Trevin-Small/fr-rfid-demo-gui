const fs = require('fs');
const redis = require('redis');
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

const EXPIRATION_THRESHOLD = 10;
const FREQ_COEF = 2;
const FREQ_EXP = 1.7;
const FREQ_CONST = 1;
const TIMESTAMP_MEMORY = 4;

// Server test route - return data under key 'hello'
app.get('/server-test', async (req, res) => {
	let data = await redisClient.get('hello');
	res.status(200).json({ data });
});

app.get('/inventory', async (req, res) => {
  // Make deep copy of empty_inventory object
  const inventory = { ...empty_inventory };

  const curr_time = Math.floor(Date.now() / 1000);
  let total_inventory = 0;

  console.log("\n\nExpired tags:");

  // Iterate through tag list
  for (let i in tag_list.tags) {
    let tag_id = String(tag_list.tags[i]);

    // Get tag event from redis, parse into json
    let tag_data = await redisClient.get(tag_id);

    //console.log("/inventory", tag_id, tag_event);

    // If no data exists for this tag id, continue
    if (!tag_data) continue;

    tag_data = JSON.parse(tag_data);

    let freq = get_read_freq(tag_data);

    console.log(tag_id, " exp data: ", curr_time - tag_data.timestamps.slice(-1)[0], freq, Math.pow(freq, FREQ_EXP) + FREQ_CONST);

    // If it has been less than average_read_freq * FREQ_COEF time since seeing tag, it is in stock
    if (curr_time - tag_data.timestamps.slice(-1)[0] < Math.pow(freq, FREQ_EXP) + FREQ_CONST) {
      inventory[tag_data.flavor]++;
      total_inventory++;
    } else {
      console.log(tag_id + " Expired!");
    }
  }

  inventory.total = total_inventory;

  // Return status 200 with new_inventory state
  res.status(200).json({ inventory });
});


// Start the server
app.listen(8000, () => {
  console.log(`Server is running on port 8000`);
});

function get_read_freq(tag_data) {
	let range = (tag_data.timestamps.slice(-1)[0] - tag_data.timestamps[0]);
	let read_freq = range / (tag_data.timestamps.length - 1);
	return read_freq;
}
