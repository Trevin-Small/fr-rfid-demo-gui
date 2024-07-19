#!/bin/bash  

# Start docker containers in detached mode
docker compose up --force-recreate -d

# Go to react gui directory
cd react-gui

# Start the React development server 
npm run start &  

# Get the process ID of the npm command 
NPM_PID=$!  

# Function to wait until the server is running
function wait_for_server() {     
	until curl --output /dev/null --silent --head --fail http://localhost:3000; do
       		printf '.'
		sleep 3
	done
}  

# Wait for the server to start 
wait_for_server  

# Launch Chromium pointing to the local React development server 
/usr/bin/chromium --kiosk http://localhost:3000 &  

# Wait for the npm process to complete (in case you want to capture exit status or perform cleanup) 
wait $NPM_PID
