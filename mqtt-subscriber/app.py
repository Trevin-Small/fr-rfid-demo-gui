import paho.mqtt.client as mqtt
import dateutil
import dateutil.parser as dp
import redis
import os
import json

FLAVOR_LOOKUP_PREFIX = 'flavor_'
TIMESTAMP_MEMORY = 5

flavor_lookup = json.load(open('flavor_lookup.json'))

# Connect to redis
redis_host = os.getenv('REDIS_HOST', 'redis')
redis_port = int(os.getenv('REDIS_PORT', 6379))
r = redis.Redis(host=redis_host, port=redis_port, decode_responses=True)

def redis_write(key, value):
    r.set(key, value)

def redis_read(key):
    value = r.get(key)
    if (value):
        return value
    else:
        return None

def on_connect(mqttc, obj, flags, reason_code, properties):
    print("reason_code: " + str(reason_code))

    # build flavor lookup table
    for tag in flavor_lookup['tags']:
        redis_write(FLAVOR_LOOKUP_PREFIX + str(tag['id']), tag['flavor'])

def on_msg(mqttc, obj, msg):
    #print("Received msg - topic: " + msg.topic + ", qos: " + str(msg.qos) + " msg: " + msg.payload.decode())

    # Convert msg string to json
    msg_parsed = json.loads(msg.payload)
    
    # Get entries out of tag event
    tag_id = str(msg_parsed['data']['idHex'])[-4:]
    reads = msg_parsed['data']['reads']
    timestamp = int(dp.isoparse(msg_parsed['timestamp']).timestamp())

    #print("Received msg: " + tag_id + ", " + str(reads) + ", " + str(timestamp))

    # Check redis for saved tag events
    existing = redis_read(tag_id)

    timestamp_arr = []
    read_arr = []

    # If this tag has been read before, it will exist in redis
    if existing:

        # Load into json object
        existing_parsed = json.loads(existing)
        
        # Get array of TIMESTAMP_MEMORY most recent event timestamps
        timestamp_arr = existing_parsed['timestamps']

        read_arr = existing_parsed['read_arr']

        # If timestamp predates 5 most recent tag reads, ignore this event
        if len(timestamp_arr) == TIMESTAMP_MEMORY and timestamp < existing_parsed['timestamps'][0]:
            #print("  not storing msg " + tag_id) 
            return

    # Append the timestamp to the array
    timestamp_arr.append(timestamp)

    # Sort timestamp array
    timestamp_arr.sort()

    # Add most recent read count
    read_arr.append(reads)

    #print(timestamp_arr)

    # If timestamp array has more than TIMESTAMP_MEMORY entries, pop the oldest timestamp
    if (len(timestamp_arr) > TIMESTAMP_MEMORY):
        # Remove oldest timestamp
        timestamp_arr.pop(0)

        # Remove oldest read entry
        read_arr.pop(0)

    # Retreive flavor assigned to this (flavor_)tag_id
    flavor = redis_read(FLAVOR_LOOKUP_PREFIX + tag_id)

    # Build json object for tag_event table
    tag_event = { "timestamps": timestamp_arr, "read_arr": read_arr, "flavor": flavor }

    # Output event data
    #print(tag_id + ": " + json.dumps(tag_event))

    # Write (tag_id, tag_event) into tag_event_table
    redis_write(tag_id, json.dumps(tag_event))

def on_subscribe(mqttc, obj, mid, reason_code_list, properties):
	print("Subscribed: " + str(mid) + " " + str(reason_code_list))

def on_log(mqttc, obj, level, string):
	print(string)

print("mqtt-subscriber initializing...")

mqttc = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
mqttc.on_message = on_msg
mqttc.on_connect = on_connect
mqttc_on_subscribe = on_subscribe
mqttc.connect("mqtt-broker", 1883, 50)
mqttc.subscribe("FX960077E6F0/tevents")

print("mqtt-subscriber sub to FX960077E6F0/tevents. Running!")

mqttc.loop_forever()
