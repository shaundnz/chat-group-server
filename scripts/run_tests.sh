#!/bin/sh
npm run test
npm run database:reset -- TestSeeder
npm run test:e2e