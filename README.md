# Air (not airdrop)

A pair of scripts to transmit files over the network.

For use in two terminals that can find each other over the network.

## Caveat

Treat this as an interesting experiment and not as a secure means for transferring files within potentially adversarial network conditions.

## Requirements

You'll need `node`. This project uses ESM Modules. Reccomend using node v12 and above.

## Reciever

`bin/recieve.js -p 4545 > outFile.txt`

The reciever will stay open until a file has been sent to it. File data will be emitted over stdout on the reciever. The reciever will terminate when the transmitter closes the connection.

## Transmitter

`bin/transmit.js -p 4545 -h 127.0.0.1 < infile.txt`

The transmitter will read from stdin, and send data directly to the specified reciever.

To send binary files, use the `--raw` flag.
