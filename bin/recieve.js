#!/usr/bin/env node
import { createServer } from "net";
import { parseArgs } from "../src/parse-args.js";

const { port, help } = parseArgs(process.argv, {
  "-p": "--port",
  "-h": "--help",
});
if (help) {
  console.error(`
usage:

  bin/recieve.js -p 4545 > outFile.txt

-p, --port: (required) port number to listen for transmitted files on
-h, --help: print this help message
  `);
  process.exit(0);
}

let waitingForFirstConnection = true;
function handleConnection(connection) {
  if (waitingForFirstConnection === false) {
    connection.destroy();
  } else {
    waitingForFirstConnection = false;
    connection.pipe(process.stdout);
    connection.on("end", () => server.close());
  }
}

const server = createServer(handleConnection);
server.listen(port);
