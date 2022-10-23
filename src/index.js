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

(function () {
  const app = createExpress();
  const { PORT = 5000 } = process.env;

  app.get('/health.txt', (_, res) => res.send('OK'));
  app.get('/', createStaticMiddleware(resolve(__dirname, '../public/')));

  log(resolve(__dirname, '../public/'));

  const server = createServer(app);
  const webSocketServer = new WebSocketServer({ server });

  webSocketServer.on('connection', ws => {
    log(`Connected`);

    ws.send('Hello, World!');

    ws.on('message', data => {
      const text = data.toString('utf8');

      log(text);

      ws.send(text);
    });

    ws.on('close', data => {
      log('Closed');
    });
  });

  server.listen(PORT, () => {
    log(`Listening to port ${PORT}`);
  });
})();
