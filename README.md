# Some experiments with monitoring of the event loop

Thank you to [prom-client](https://github.com/siimon/prom-client) creators. 

## app server

app listens on port 8080


```
nodemon node server-plain.js
```

Endpoints:

* http://localhost:8080/http

performs 10 async requests

* http://localhost:8080/http?c=100

performs 100 async requests

* http://localhost:8080/file

performs 10 sync file reads (file size ca. 50KB)

* http://localhost:8080/http?c=100

performs 100 sync file reads (file size ca. 50KB)

* http://localhost:8080/health

health check


## prometheus server

prometheus listens on port 9100

serves also metrics about the event loop lag, for example:

Endpoint:

* http://localhost:9100/metrics

```
# HELP nodejs_eventloop_lag_mean_seconds The mean of the recorded event loop delays.
# TYPE nodejs_eventloop_lag_mean_seconds gauge
nodejs_eventloop_lag_mean_seconds 0.010315473212237707
```

## measurements

1. start the script server-plain.js: this will start both, main app and prometheus
2. start a script monitoring the /health endpoint: ./scripts/health.sh
3. call the endpoint http://localhost:8080/http?c=100
4. watch the output of the health check
5. watch the output of the metrics http://localhost:9100/metrics
6. call the endpoint http://localhost:8080/http?c=10000
7. watch the output of the health check
8. watch the output of the metrics http://localhost:9100/metrics

## results

### for /http?c=100 endpoint


* health check

responds always within 10 millis:

```
200 | 0,008 | 0,005 | 0,000 | 0,008
```


* /metrics

event loop lag mean is 10 milliseconds. Max. event loop lag was 28 millis. :thumbsup:

```
# HELP nodejs_eventloop_lag_min_seconds The minimum recorded event loop delay.
# TYPE nodejs_eventloop_lag_min_seconds gauge
nodejs_eventloop_lag_min_seconds 0.009125888

# HELP nodejs_eventloop_lag_max_seconds The maximum recorded event loop delay.
# TYPE nodejs_eventloop_lag_max_seconds gauge
nodejs_eventloop_lag_max_seconds 0.028442623

# HELP nodejs_eventloop_lag_mean_seconds The mean of the recorded event loop delays.
# TYPE nodejs_eventloop_lag_mean_seconds gauge
nodejs_eventloop_lag_mean_seconds 0.010196139392189817
```

### for /file?c=100 endpoint

* health check

outage as soon as the /file endpoint is called:

```
200 | 0,006 | 0,005 | 0,000 | 0,006

# outage, 5 seconds timeout
000 | 5,001 | 0,004 | 0,000 | 0,000
000 | 5,002 | 0,004 | 0,000 | 0,000

200 | 3,493 | 0,004 | 0,000 | 3,493
```


* /metrics

The event loop lag mean is 56 millis, however, for 8 seconds no new requests could have been processed (incl. health check and metrics), see max value. :thumbsdown:

```
# HELP nodejs_eventloop_lag_min_seconds The minimum recorded event loop delay.
# TYPE nodejs_eventloop_lag_min_seconds gauge
nodejs_eventloop_lag_min_seconds 0.009306112

# HELP nodejs_eventloop_lag_max_seconds The maximum recorded event loop delay.
# TYPE nodejs_eventloop_lag_max_seconds gauge
nodejs_eventloop_lag_max_seconds 8.241807359

# HELP nodejs_eventloop_lag_mean_seconds The mean of the recorded event loop delays.
# TYPE nodejs_eventloop_lag_mean_seconds gauge
nodejs_eventloop_lag_mean_seconds 0.05574823924653739
```
