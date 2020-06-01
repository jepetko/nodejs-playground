#!/bin/bash -e

clinic doctor --on-port 'autocannon localhost:$PORT' --open=false -- node server.js

