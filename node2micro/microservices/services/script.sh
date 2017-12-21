#!/usr/bin/env bash

# Install dependencies and start the node server
#npm install loadtest -g
#npm install
#npm start

#-------- Generate Data ------------
# Users
loadtest http://localhost:3001/api/generate/users -t 3 -c 1 --rps 1

# Threads
loadtest http://localhost:3002/api/generate/threads -t 3 -c 1 --rps 1

# Posts
loadtest http://localhost:3003/api/generate/posts -t 3 -c 1 --rps 1

#-------- Select Data ------------
# Users
loadtest http://localhost:3001/api/users -t 10 -c 5 --rps 10

# Threads
loadtest http://localhost:3002/api/threads -t 10 -c 5 --rps 10

# Posts
loadtest http://localhost:3003/api/posts -t 10 -c 5 --rps 10
