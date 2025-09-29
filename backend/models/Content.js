const mongoose = require('mongoose');

const TranslationSchema = new mongoose.Schema(
  {
    tr: { type: String },
    en: { type: String },
  },
  { _id: false }
);

const ContentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    img: { type: String, required: true },
    imgTitle: { type: String },
    imgSm: { type: String },
    trailer: { type: String },
    video: { type: String },
    year: { type: String },
    limit: { type: String },
    genre: { type: String },
    isSeries: { type: Boolean, default: false },
    translations: {
      title: { type: TranslationSchema, default: {} },
      description: { type: TranslationSchema, default: {} },
      genre: { type: TranslationSchema, default: {} },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Content', ContentSchema);
