import createExpress from 'express';
import { createServer } from 'http';

const app = createExpress();
const { PORT = 5000 } = process.env;

app.get('/health.txt', (_, res) => res.send('OK'));

createServer(app).listen(PORT, () => {
  console.log(`Listening to port ${PORT}`);
});
