const router = require('express').Router();
const List = require('../models/List');
const { createList, deleteList, getLists } = require('../controllers/list');
const verifyToken = require('../middleware/verifyToken');

const localMessage = (req, tr, en) => (req.language === 'en' ? en : tr);

router.post('/', verifyToken, createList);

router.put('/:id', verifyToken, async (req, res) => {
  if (!req.user.isAdmin) {
    res.status(403).json(localMessage(req, 'Bu işlemi yapmaya yetkiniz yok!', 'You are not authorised to perform this action.'));
    return;
  }

  try {
    const updatedList = await List.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('content');

    res.status(200).json(updatedList);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.delete('/:id', verifyToken, deleteList);
router.get('/', verifyToken, getLists);

module.exports = router;
