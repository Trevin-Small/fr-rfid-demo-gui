#f'real RFID Inventory Demo
Inventory GUI for f'real onsite visit

# Overview
docker compose is used to manage the following containers:
- mqtt-broker: runs a mosquitto mqtt broker. This is the endpoint that the zebra reader sends tag read events to
- mqtt-subscriber: python script that subscribes to tag read events. whenever one is received, it writes it into the redis database
- redis: datastore used for storing tag reads
- http-server: an Express.js server to provide inventory data to the user interface. reads from the redis DB, and provides inventory as a json response to an HTTP request.

The user interface is built using React. Note it is not containerized - I was getting weird bugs when running it in a container. 
Not sure what the issue was, may have had a libary somewhere that wasn't compatible with the container's node image or something. I just decided not to containerize it.
Anyways, running the react server locally compiles the project and brings up a locally hosted version of the gui.

# Running
run ```docker compose build```
followed by ```./start.sh```
The start script launches the containers, then the local react server, and finally launches chromium in kiosk mode bringing up the react page. 
Also note the script depends on the location of the chromium binary since it was made to run on a tinker board.

# Apologies
This code is messy and poorly structured and commented, sorry about that 😅 I didn't spend anytime cleaning it up
