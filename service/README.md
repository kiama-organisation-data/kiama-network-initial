# Kiama-network service

## Requirement
- Installation de node js
- Installation mongodb

## Installation
* npm i : installation des dependences

## Installation database
* Local :
    * Require : mongodb
    * .env :  MONGODB_URI = "link mongodb://localhost:27017/kiama-network"

## launch server via npm 
* npm run dev : start server
* npm run build : compile all files

## launch server via yarn
* yarn run dev : start server
* yarn run build : compile all files

## test benchmarking by ab https://httpd.apache.org/docs/2.4/en/programs/ab.html
* ab -c 50 -n 50 localhost:8181//kiama-network/api/users/list
* -c : concurrency, number of multiple requests to perform at a time 
* -n : requests, number of requests to perform for the benchmarking session

## npm install -g local-ssl-proxy 
* local-ssl-proxy --config proxy.json


