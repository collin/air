const dgram = require('dgram');
const socket = dgram.createSocket({type: 'udp4', reuseAddr: true});
const {parseArgs} = require('./parse-args');

const [, {emit, print, frequency}] = parseArgs(process.argv, {
  '-e': '--emit',
  '-p': '--print',
  '-f': '--frequency'
});

socket.on('error', err => {
  console.log(`socket error:\n${err.stack}`);
  socket.close();
});

if (print) {
  socket.on('message', (msg, rinfo) => {
    console.log(`socket got: ${msg} from ${rinfo.address}:${rinfo.port}`);
  });
}

socket.on('listening', () => {
  socket.addMembership('233.255.255.255');
  const address = socket.address();
  console.log(`socket listening ${address.address}:${address.port}`);
  if (emit) {
    setInterval(() => {
      const message = Buffer.from(`The time is ${new Date()}`);
      socket.send(message, 0, message.length, 6000, '233.255.255.255');
    }, frequency || 1000);
  }
});

socket.bind(6000);
