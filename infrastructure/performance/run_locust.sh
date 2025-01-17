#!/usr/bin/env bash

# grab filename and number of users from command line args
LOCUSTFILE=$1
USERS=$2

# export env for scripts to reference (accepts local/staging, but not production)
if [ -z $3 ]; then
  echo "No environment passed in, assuming local"
  export TARGET_ENV=local
else
  echo "Setting target environment as: $3"
  export TARGET_ENV=$3
fi

# this script assumes your machine has 8 cores, each of which can handle ~ 300 users (will depend on workload)
# check core count with lscpu, test and adjust constants accordingly for your use case
LOCAL_CORES=8
USERS_PER_CORE=300

# get the ceiling of division, rather than floor (i.e. lean towards more workers)
PROCESSES=$((($USERS + $USERS_PER_CORE - 1) / $USERS_PER_CORE))
PROCESSES=$(($PROCESSES > 0 ? $PROCESSES : 1))
WORKERS=$PROCESSES
if [ $WORKERS -gt $LOCAL_CORES ]; then
  PROCESSES=-1
  WORKERS=$LOCAL_CORES
fi

# we keep spawn rate relatively low to avoid overwhelming CPUs during ramp up
SPAWN_RATE=5

# run load test for thrice as long as total ramp up time (or 5 minutes, whichever is higher)
RUN_TIME_SECONDS=$((($USERS / $SPAWN_RATE) * 3))
RUN_TIME_SECONDS=$(($RUN_TIME_SECONDS > 300 ? $RUN_TIME_SECONDS : 300))

echo "Running $LOCUSTFILE load test across $WORKERS workers (i.e. CPUs)"
python -m locust --locustfile $LOCUSTFILE --users $USERS --spawn-rate $SPAWN_RATE --run-time $RUN_TIME_SECONDS --processes $PROCESSES --autostart