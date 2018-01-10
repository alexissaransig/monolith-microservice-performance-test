#!/usr/bin/env bash

#-------- Generate Data ------------
# Users
loadtest http://localhost:3000/api/generate/users -n 1

# Threads
loadtest http://localhost:3000/api/generate/threads -n 1

# Posts
loadtest http://localhost:3000/api/generate/posts -n 1

#-------- Select Data ------------
# Users
loadtest http://localhost:3000/api/users -t 2 -c 5 --rps 10

# Threads
loadtest http://localhost:3000/api/threads -t 2 -c 5 --rps 10

# Posts
loadtest http://localhost:3000/api/posts -t 2 -c 5 --rps 10
