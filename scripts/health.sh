#!/bin/bash -e

while true; do
    curl -m 5 --silent --output /dev/null --write-out "%{http_code} | %{time_total} | %{time_connect} | %{time_appconnect} | %{time_starttransfer}\n" \
    http://localhost:8080/health && echo; sleep 1;
done
