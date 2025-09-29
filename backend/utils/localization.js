const Content = require('../models/Content');
const List = require('../models/List');
const { translateText } = require('./translator');

const ensureTranslation = async (model, id, field, lang, baseText, existingTranslation) => {
  if (!baseText || lang === 'en') {
    return baseText;
  }

  if (existingTranslation) {
    return existingTranslation;
  }

  const existing = await model
    .findOne({ _id: id, [`translations.${field}.${lang}`]: { $exists: true } }, { [`translations.${field}.${lang}`]: 1 })
    .lean();

  if (existing?.translations?.[field]?.[lang]) {
    return existing.translations[field][lang];
  }

  const translated = await translateText(baseText, lang);

  if (translated && translated !== baseText) {
    await model.updateOne(
      { _id: id },
      { $set: { [`translations.${field}.${lang}`]: translated } }
    );
    return translated;
  }

  return baseText;
};

const localizeContent = async (content, lang) => {
  if (!content) return content;
  if (lang === 'en') {
    return content.toObject ? content.toObject() : { ...content };
  }

  const base = content.toObject ? content.toObject() : { ...content };

  const [title, description, genre] = await Promise.all([
    ensureTranslation(Content, base._id, 'title', lang, base.title, base.translations?.title?.[lang]),
    ensureTranslation(Content, base._id, 'description', lang, base.description, base.translations?.description?.[lang]),
    ensureTranslation(Content, base._id, 'genre', lang, base.genre, base.translations?.genre?.[lang]),
  ]);

  return {
    ...base,
    title,
    description,
    genre,
  };
};

const localizeList = async (list, lang) => {
  if (!list) return list;
  const base = list.toObject ? list.toObject() : { ...list };

  const title = lang === 'en'
    ? base.title
    : await ensureTranslation(List, base._id, 'title', lang, base.title, base.translations?.title?.[lang]);

  const genre = lang === 'en'
    ? base.genre
    : await ensureTranslation(List, base._id, 'genre', lang, base.genre, base.translations?.genre?.[lang]);

  let content = base.content || [];
  if (Array.isArray(content) && content.length) {
    content = await Promise.all(content.map((item) => localizeContent(item, lang)));
  }

  return {
    ...base,
    title,
    genre,
    content,
  };
};

module.exports = {
  localizeContent,
  localizeList,
};
