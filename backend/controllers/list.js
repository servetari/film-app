const List = require('../models/List');
const localMessage = (req, tr, en) => (req.language === 'en' ? en : tr);
const { localizeList } = require('../utils/localization');
const { isKidFriendly } = require('../utils/filters');

const createList = async (req, res) => {
  if (!req.user.isAdmin) {
    res.status(403).json(localMessage(req, 'Bu işlemi yapmaya yetkiniz yok!', 'You are not authorised to perform this action.'));
    return;
  }

  try {
    const payload = { ...req.body };
    payload.title = payload.title?.trim();
    payload.type = payload.type?.toLowerCase();
    payload.genre = payload.genre?.trim();

    if (!Array.isArray(payload.content)) {
      payload.content = [];
    }

    payload.content = Array.from(new Set(payload.content.map(String)));

    const newList = new List(payload);
    const savedList = await newList.save();
    const populated = await savedList.populate('content');

    const localized = await localizeList(populated, req.language);
    res.status(201).json(localized);
  } catch (err) {
    res.status(500).json(err);
  }
};

const deleteList = async (req, res) => {
  if (!req.user.isAdmin) {
    res.status(403).json(localMessage(req, 'Bu işlemi yapmaya yetkiniz yok!', 'You are not authorised to perform this action.'));
    return;
  }

  try {
    await List.findByIdAndDelete(req.params.id);
    res.status(200).json(localMessage(req, 'Liste başarıyla silindi.', 'List deleted successfully.'));
  } catch (err) {
    res.status(500).json(err);
  }
};

const getLists = async (req, res) => {
  const typeQuery = req.query.type;
  const genreQuery = req.query.genre;
  const returnAll = req.query.full === 'true';
  const kidsMode = req.profileMode === 'kids';

  try {
    const match = {};

    if (typeQuery && typeQuery !== 'all') {
      match.type = typeQuery;
    }

    if (genreQuery && genreQuery !== 'all') {
      match.genre = genreQuery;
    }

    if (returnAll) {
      const lists = await List.find(match)
        .populate('content')
        .sort({ createdAt: -1 });

      const localized = await Promise.all(
        lists.map((item) => {
          const base = item.toObject ? item.toObject() : { ...item };
          base.content = Array.isArray(base.content) && kidsMode
            ? base.content.filter((c) => isKidFriendly(c))
            : base.content;
          return localizeList(base, req.language);
        })
      );
      res.status(200).json(localized);
      return;
    }

    const lists = await List.find(match)
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('content');

    const localized = await Promise.all(
      lists.map((item) => {
        const base = item.toObject ? item.toObject() : { ...item };
        base.content = Array.isArray(base.content) && kidsMode
          ? base.content.filter((c) => isKidFriendly(c))
          : base.content;
        return localizeList(base, req.language);
      })
    );
    res.status(200).json(localized);
  } catch (err) {
    res.status(500).json(err);
  }
};

module.exports = {
  createList,
  deleteList,
  getLists,
};
