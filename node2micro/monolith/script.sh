#!/usr/bin/env bash

# Install dependencies and start the node server
npm install
npm install loadtest -g
npm start

#
loadtest http://localhost:3000/api/generate/users -t 20 -c 10 --rps 10

loadtest http://localhost:3000/api/users -t 20 -c 10 --rps 1000