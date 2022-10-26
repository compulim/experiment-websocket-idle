import { createServer } from 'http';
import { resolve } from 'path';
import { WebSocketServer } from 'ws';
import createExpress, { static as createStaticMiddleware } from 'express';

let lastLogTime = Date.now();

function log(message) {
  const now = new Date();

  console.log(`${now.toLocaleTimeString()} (+${+now - lastLogTime}ms): ${message}`);
  lastLogTime = now;
}

function removeInline(array, item) {
  const index = array.indexOf(item);

  ~index && array.splice(index, 1);
}

(function () {
  const app = createExpress();
  const { PORT = 5000 } = process.env;
  const activeWebSockets = [];

  app.get('/health.txt', (_, res) => res.send('OK'));
  app.get('/', createStaticMiddleware(resolve(__dirname, '../public/')));

  log(resolve(__dirname, '../public/'));

  const server = createServer(app);
  const webSocketServer = new WebSocketServer({ server });

  webSocketServer.on('connection', ws => {
    log(`Connected`);

    activeWebSockets.push(ws);

    ws.send('Hello, World!');

    ws.on('message', data => {
      const text = data.toString('utf8');

      log(text);

      ws.send(text);
    });

    ws.on('close', () => {
      log('Closed');
      removeInline(activeWebSockets, ws);
    });

    ws.on('ping', () => {
      log('Received a ping');
    });

    ws.on('pong', () => {
      log('Received a pong');
    });
  });

  app.get('/close-all', () => {
    log('Closing all Web Socket connections');
    activeWebSockets.map(ws => ws.close());
  });

  app.get('/send-something', () => {
    log('Sending something to all Web Socket connections');
    activeWebSockets.map(ws => ws.send('Aloha!'));
  });

  server.listen(PORT, () => {
    log(`Listening to port ${PORT}`);
  });
})();
