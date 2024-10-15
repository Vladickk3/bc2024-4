const { Command } = require('commander');
const http = require('http');
const program = new Command();

program
  .requiredOption('-h, --host <host>', 'Server host')
  .requiredOption('-p, --port <port>', 'Server port')
  .requiredOption('-c, --cache <cachePath>', 'Cache directory path');

program.parse(process.argv);

const { host, port, cache } = program.opts();

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Server is running\n');
});

server.listen(port, host, () => {
  console.log(`Server running at http://${host}:${port}/`);
});
