#!/usr/bin/env sh

# These DB tests require you to have Postgres up and the database created
# `docker-compose up --build` should do all of that for you

# When writing new tests, I suggest using `nodemon` to get a nice feedback-loop
# $ npx nodemon -e sql --exec "./run-tests.sh"

psql "postgres://${PG_USERNAME}:${PG_PASSWORD}@0.0.0.0:${PG_PORT}/${PG_DATABASE}" <tests/audit.test.sql
