import { createServer } from 'http';
import { resolve } from 'path';
import { WebSocketServer } from 'ws';
import createExpress, { static as createStaticMiddleware } from 'express';

(function () {
  const app = createExpress();
  const { PORT = 5000 } = process.env;

  app.get('/health.txt', (_, res) => res.send('OK'));
  app.get('/', createStaticMiddleware(resolve(__dirname, '../public/')));

  console.log(resolve(__dirname, '../public/'));

  const server = createServer(app);
  const webSocketServer = new WebSocketServer({ server });

  webSocketServer.on('connection', ws => {
    console.log(`Connected`);

    ws.send('Hello, World!');
  });

  server.listen(PORT, () => {
    console.log(`Listening to port ${PORT}`);
  });
})();
