#!/usr/bin/env node
const net = require('net');

let piped = false;
let bytesPiped = 0;
const server = net.createServer(
  connection => {
    if (piped === true) {
      console.error("rejecting connection...");
      connection.destroy();
    }
    else {
      const pipeOut = connection.pipe(process.stdout)
      connection.on('data', chunk => bytesPiped += chunk.length);
      piped = true;
      connection.on('end', process.exit);
    }
  }
);

setInterval(() => {
  console.error(`have seen ${bytesPiped} bytes`);
}, 1000);

const port = process.argv[2];
server.listen(port);
