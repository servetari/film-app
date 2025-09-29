const Content = require('../models/Content');
const localMessage = (req, tr, en) => (req.language === 'en' ? en : tr);
const { localizeContent } = require('../utils/localization');
const { isKidFriendly } = require('../utils/filters');

const createContent = async (req, res) => {
  if (!req.user.isAdmin) {
    res.status(403).json(localMessage(req, 'Bu işlemi yapmaya yetkiniz yok!', 'You are not authorised to perform this action.'));
    return;
  }

  const newContent = new Content(req.body);
  try {
    const savedContent = await newContent.save();
    try {
      const { broadcast } = require('../utils/notifier');
      broadcast({
        type: 'new_content',
        contentId: savedContent._id,
        title: savedContent.title,
        isSeries: savedContent.isSeries,
        img: savedContent.imgSm || savedContent.img,
      });
    } catch (e) {}
    res.status(201).json(savedContent);
  } catch (err) {
    res.status(500).json(err);
  }
};

const updateContent = async (req, res) => {
  if (!req.user.isAdmin) {
    res.status(403).json(localMessage(req, 'Bu işlemi yapmaya yetkiniz yok!', 'You are not authorised to perform this action.'));
    return;
  }

  try {
    const updatedContent = await Content.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.status(200).json(updatedContent);
  } catch (err) {
    res.status(500).json(err);
  }
};

const deleteContent = async (req, res) => {
  if (!req.user.isAdmin) {
    res.status(403).json(localMessage(req, 'Bu işlemi yapmaya yetkiniz yok!', 'You are not authorised to perform this action.'));
    return;
  }

  try {
    await Content.findByIdAndDelete(req.params.id);
    res.status(200).json(localMessage(req, 'İçerik başarıyla silindi.', 'Content deleted successfully.'));
  } catch (err) {
    res.status(500).json(err);
  }
};

const getContent = async (req, res) => {
  try {
    const content = await Content.findById(req.params.id);
    if (!content) {
      res.status(404).json({ message: localMessage(req, 'İçerik bulunamadı.', 'Content not found.') });
      return;
    }

    const localized = await localizeContent(content, req.language);
    res.status(200).json(localized);
  } catch (err) {
    res.status(500).json(err);
  }
};

const getAllContent = async (req, res) => {
  try {
    const allContent = await Content.find().sort({ createdAt: -1 });
    const localized = await Promise.all(allContent.map((item) => localizeContent(item, req.language)));
    res.status(200).json(localized);
  } catch (err) {
    res.status(500).json(err);
  }
};

const getRandomContent = async (req, res) => {
  const type = req.query.type;
  let content;
  try {
    if (type === 'series') {
      content = await Content.aggregate([
        { $match: { isSeries: true } },
        { $sample: { size: 1 } },
      ]);
    } else {
      content = await Content.aggregate([
        { $match: { isSeries: false } },
        { $sample: { size: 1 } },
      ]);
    }

    const item = content[0];
    if (!item) {
      res.status(404).json({ message: localMessage(req, 'İçerik bulunamadı.', 'Content not found.') });
      return;
    }

    const doc = await Content.findById(item._id);
    const localized = await localizeContent(doc || item, req.language);
    res.status(200).json(localized);
  } catch (err) {
    res.status(500).json(err);
  }
};

const searchContent = async (req, res) => {
  try {
    const { q, genre, type, limit } = req.query;
    const lang = req.language || 'en';

    const andConditions = [];

    if (q && q.trim()) {
      const regex = new RegExp(q.trim(), 'i');
      andConditions.push({
        $or: [
          { title: { $regex: regex } },
          { [`translations.title.${lang}`]: { $regex: regex } },
        ],
      });
    }

    if (genre && genre !== 'all') {
      const regex = new RegExp(`^${genre}$`, 'i');
      andConditions.push({
        $or: [
          { genre: { $regex: regex } },
          { [`translations.genre.${lang}`]: { $regex: regex } },
        ],
      });
    }

    if (type === 'series') {
      andConditions.push({ isSeries: true });
    } else if (type === 'movie') {
      andConditions.push({ isSeries: false });
    }

    const match = andConditions.length ? { $and: andConditions } : {};

    const size = Math.min(parseInt(limit, 10) || 24, 100);
    let results = await Content.find(match).sort({ createdAt: -1 }).limit(size);
    if (req.profileMode === 'kids') {
      results = results.filter((r) => isKidFriendly(r));
    }

    const localized = await Promise.all(results.map((item) => localizeContent(item, lang)));
    res.status(200).json(localized);
  } catch (err) {
    res.status(500).json(err);
  }
};

module.exports = {
  createContent,
  updateContent,
  deleteContent,
  getContent,
  getAllContent,
  getRandomContent,
  searchContent,
};
