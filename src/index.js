import { createServer } from 'http';
import { resolve } from 'path';
import { WebSocketServer } from 'ws';
import createExpress, { static as createStaticMiddleware } from 'express';
import random from 'math-random';

let lastLogTime = Date.now();

function log(message) {
  const now = new Date();
  const timestamp = `${now.toLocaleTimeString()} (+${+now - lastLogTime}ms)`;

  console.log(`${timestamp.padEnd(30, ' ')} ${message}`);
  lastLogTime = now;
}

function uniqueId() {
  return random().toString(36).substring(2, 7);
}

(function () {
  const app = createExpress();
  const { PORT = 5000 } = process.env;
  const activeWebSockets = new Map();

  app.get('/health.txt', (_, res) => res.send('OK'));
  app.get('/', createStaticMiddleware(resolve(__dirname, '../public/')));

  log(`*****: ${resolve(__dirname, '../public/')}`);

  const server = createServer(app);
  const webSocketServer = new WebSocketServer({ server });

  webSocketServer.on('connection', ws => {
    const id = uniqueId();

    log(`${id}: Connected`);

    activeWebSockets.set(id, ws);

    ws.send('Hello, World!');

    ws.on('message', data => {
      const text = data.toString('utf8');

      log(`${id}: Received ${text}`);

      ws.send(text);
    });

    ws.on('close', () => {
      log(`${id}: Closed`);

      activeWebSockets.delete(id);
    });

    ws.on('ping', () => log(`${id}: Sent a ping`));
    ws.on('pong', () => log(`${id}: Received a pong`));
  });

  app.get('/kill-all', (_, res) => {
    log('*****: Closing all Web Socket connections');

    for (const ws of activeWebSockets.values()) {
      ws.close();
    }

    res.send('OK');
  });

  app.get('/ping-all', (_, res) => {
    log('*****: Pinging all Web Socket connections');

    for (const ws of activeWebSockets.values()) {
      ws.ping();
    }

    res.send('OK');
  });

  app.get('/send-something', (_, res) => {
    log('*****: Sending something to all Web Socket connections');

    for (const ws of activeWebSockets.values()) {
      ws.send('Aloha!');
    }

    res.send('OK');
  });

  app.get('/kill-myself', (_, res) => {
    log('*****: Killing this server');

    res.send('OK');

    process.exit(-1);
  });

  server.listen(PORT, () => log(`*****: Listening to port ${PORT}`));
})();
