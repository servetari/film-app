const jwt = require('jsonwebtoken');

const localMessage = (req, tr, en) => (req.language === 'en' ? en : tr);

function verifyToken(req, res, next) {
  const authHeader = req.headers.token;

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json(localMessage(req, 'Token geçersiz!', 'Token is invalid!'));
      }

      req.user = user;
      next();
    });
  } else {
    return res.status(401).json(localMessage(req, 'Kimliğiniz doğrulanmadı!', 'Authentication required!'));
  }
}

module.exports = verifyToken;
