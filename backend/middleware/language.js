const { normalizeLang } = require('../utils/translator');

module.exports = (req, res, next) => {
  const headerLang = req.headers['x-language'] || req.headers['accept-language'];
  const queryLang = req.query.lang;
  req.language = normalizeLang(queryLang || headerLang || 'tr');
  const modeHeader = (req.headers['x-profile-mode'] || req.query.mode || '').toString().toLowerCase();
  req.profileMode = modeHeader === 'kids' ? 'kids' : 'adult';
  next();
};
