const router = require('express').Router();
const axios = require('axios');
const {
  createContent,
  updateContent,
  deleteContent,
  getContent,
  getAllContent,
  getRandomContent,
  searchContent,
} = require('../controllers/content');
const verifyToken = require('../middleware/verifyToken');
const { translateText } = require('../utils/translator');

router.post('/', verifyToken, createContent);

router.put('/:id', verifyToken, updateContent);

router.delete('/:id', verifyToken, deleteContent);

router.get('/find/:id', verifyToken, getContent);

router.get('/', verifyToken, getAllContent);

router.get('/random', verifyToken, getRandomContent);

router.get('/search', verifyToken, searchContent);

router.get('/omdb/:title', verifyToken, async (req, res) => {
  if (!req.user.isAdmin) {
    res.status(403).json('Bu işlemi yapmaya yetkiniz yok!');
    return;
  }

  try {
    const response = await axios.get(`http://www.omdbapi.com/?t=${req.params.title}&apikey=${process.env.OMDB_API_KEY}`);
    const data = response.data;

    if (req.language && req.language !== 'en' && data && data.Response !== 'False') {
      const [title, plot, genre] = await Promise.all([
        translateText(data.Title, req.language),
        translateText(data.Plot, req.language),
        translateText(data.Genre, req.language),
      ]);

      data.Title = title;
      data.Plot = plot;
      data.Genre = genre;
    }

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
