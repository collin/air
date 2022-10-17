#!/usr/bin/env node
import { createConnection } from "net";
import { parseArgs } from "../src/parse-args.js";

const { host, port, raw, help } = parseArgs(process.argv, {
  "-p": "--port",
  "-h": "--host",
  "-r": "--raw",
});

if (help) {
  console.error(`
usage:

  transmit -p 4545 -h 127.0.0.1 < infile.txt

-p, --port: (required) destination port to transmit file to
-h, --host: (required) destination host to transmit file to
-r, --raw:  (optional) use raw mode when piping data (use for binary files)
--help: print this help message
    `);
  process.exit(0);
}

const connection = createConnection(port, host);
process.stdin.pipe(connection);
if (raw) {
  process.stdin.setRawMode(true);
}
