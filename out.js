#!/usr/bin/env node
const net = require('net');

const port = process.argv[3]
const host = process.argv[2]
const connection = net.createConnection(port, host);
process.stdin.pipe(connection);

