const router = require('express').Router();
const { addClient, getRecent, verifyTokenFromQuery } = require('../utils/notifier');

router.get('/stream', (req, res) => {
  const user = verifyTokenFromQuery(req);
  if (!user) {
    res.status(401).end();
    return;
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  if (typeof res.flushHeaders === 'function') res.flushHeaders();

  res.write(': connected\n\n');
  addClient(res);
});

router.get('/', (req, res) => {
  res.json(getRecent());
});

module.exports = router;

