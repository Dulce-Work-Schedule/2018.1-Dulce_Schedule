#!/bin/sh

echo "Schedule Background"

npm install forever -g

echo "Run forever"

forever start /usr/src/app/client_schedule.js

echo "Run tests"
# npm run test **/tests/
npm run test
