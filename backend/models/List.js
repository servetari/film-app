const mongoose = require('mongoose');

const TranslationSchema = new mongoose.Schema(
  {
    tr: { type: String },
    en: { type: String },
  },
  { _id: false }
);

const ListSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, unique: true },
    type: { type: String },
    genre: { type: String },
    content: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Content' }],
    translations: {
      title: { type: TranslationSchema, default: {} },
      genre: { type: TranslationSchema, default: {} },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('List', ListSchema);
