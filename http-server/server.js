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
  "timestamp": 0,
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

/*
 * Tag "expiration time" refers to the amount of time which a tag goes without being read to be considered "not in the freezer".
 * Since tag read rate depends heavily upon location in the freezer, expiration time needs to be calculated as a function of observed read rate.
 * The redis db will store the last N many read events of the tag, allowing you to calculate how often you see the tag on average.
 * 
 * Currently, the expiration function goes this way:
 * freq = get_read_freq(tag_data); // calculate average amount of time between read events (i.e. value of 3 means 3 seconds on average between received events)
 *
 * expiration_time =  Math.pow(freq, FREQ_EXP) + (READ_COUNT_NUMERATOR / avg_reads) + EXPIRATION_CONST;
 *
 * The average frequency is raised to an exponent. found to work better than scaled with a coefficient. 
 * Further, (READ_COUNT_NUMERATOR / avg_reads) gives an additional time bias for tags that don't read frequently, since it increases as avg_reads decreases.
 *
 * EXPIRATION_CONST is added as an offset to give high-frequency tags some buffer time. 
 * Curruently it is 6 because the reader time seems to be about 5 seconds behind server time no matter what I do (tried using ntp time to combat this, didnt fix it)
 *
 * DEFAULT_FREQ is the default frequency if tag has only been read once.
 */
const FREQ_EXP = 1.525;
const EXPIRATION_CONST = 6;
const READ_COUNT_NUMERATOR = 3;
const DEFAULT_FREQ = 30;

// Duration of time in minutes to preserve inventory data (for graphing purposes)
const INVENTORY_ARRAY_SIZE = 10;

// Rate in milliseconds to update the inventory
const UPDATE_RATE = 2000;
let inventoryArray = [];

function updateInventory()  {
  // Get ntp time 
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
      }
    }

    inventory.total = total_inventory;
    inventory.timestamp = Date.now();

    inventoryArray.push(inventory);

    if (inventoryArray.length > MINS_TO_MILLIS(INVENTORY_ARRAY_SIZE) / UPDATE_RATE) {
      inventoryArray.shift();
    }
  
  });
}

function MINS_TO_MILLIS() {
  return 60000 * INVENTORY_ARRAY_SIZE;
}

// Call update inventory every UPDATE_RATE milliseconds
setInterval(updateInventory, UPDATE_RATE);

// URL/inventory route, serves the most recent inventory information.
app.get('/inventory', async (req, res) => {
  res.status(200).json(inventoryArray[inventoryArray.length - 1]);
});

// URL/inventory-history route, serves the last INVENTORY_ARRAY_SIZE minutes of inventory information. Used for graphing inventory over time.
app.get('/inventory-history', async (req, res) => {
  res.status(200).json(inventoryArray);
});

// Start the server
app.listen(8000, () => {
  console.log(`Server is running on port 8000`);
});

// Calculate number of seconds between tag read events on average
function get_read_freq(tag_data) {
	if (tag_data.timestamps.length < 2) return DEFAULT_FREQ;
	let range = (tag_data.timestamps.slice(-1)[0] - tag_data.timestamps[0]);
	let read_freq = range / (tag_data.timestamps.length - 1);
	return read_freq;
}

// Calcualte average tag reads per event (tag metadata includes read count, which can be greater than 1 in an event)
function get_avg_reads(tag_data) {
	console.log(tag_data.read_arr);
	if (tag_data.read_arr.length == 1) return tag_data.read_arr[0];
	let total = 0;
	for (let read in tag_data.read_arr) {
		total += read;
	}
	return total / tag_data.read_arr.length;
}
