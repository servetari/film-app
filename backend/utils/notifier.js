const jwt = require('jsonwebtoken');

const clients = new Set();
const recent = [];
const MAX_RECENT = 50;

function addClient(res) {
  clients.add(res);
  res.on('close', () => clients.delete(res));
}

function broadcast(event) {
  const payload = { ...event, createdAt: event.createdAt || Date.now() };
  recent.unshift(payload);
  if (recent.length > MAX_RECENT) recent.length = MAX_RECENT;

  const data = `data: ${JSON.stringify(payload)}\n\n`;
  for (const res of clients) {
    try {
      res.write(data);
    } catch (e) {
      clients.delete(res);
    }
  }
}

function getRecent() {
  return recent.slice(0, 20);
}

function verifyTokenFromQuery(req) {
  const token = req.query.token || '';
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded || null;
  } catch (e) {
    return null;
  }
}

module.exports = {
  addClient,
  broadcast,
  getRecent,
  verifyTokenFromQuery,
};

