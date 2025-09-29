const router = require('express').Router();
const multer = require('multer');
const streamifier = require('streamifier');
const cloudinary = require('../utils/cloudinary');
const verifyToken = require('../middleware/verifyToken');

const localMessage = (req, tr, en) => (req.language === 'en' ? en : tr);

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB upper bound
  },
});

const uploadToCloudinary = (buffer, options = {}) =>
  new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });

router.post('/video', verifyToken, upload.single('file'), async (req, res) => {
  if (!req.user.isAdmin) {
    res.status(403).json(localMessage(req, 'Bu işlemi yapmaya yetkiniz yok!', 'You are not authorised to perform this action.'));
    return;
  }

  if (!req.file) {
    res.status(400).json({ message: localMessage(req, 'Yüklenecek dosya bulunamadı.', 'No file provided for upload.') });
    return;
  }

  try {
    const result = await uploadToCloudinary(req.file.buffer, {
      resource_type: 'video',
      folder: 'streambox/videos',
    });

    res.status(200).json({
      url: result.secure_url,
      publicId: result.public_id,
      duration: result.duration,
      format: result.format,
      bytes: result.bytes,
    });
  } catch (error) {
    console.error('Cloudinary upload failed:', error);
    res.status(500).json({
      message: localMessage(req, 'Video yüklenirken bir hata oluştu.', 'An error occurred while uploading the video.'),
      error: error.message,
    });
  }
});

router.delete('/video/:publicId', verifyToken, async (req, res) => {
  if (!req.user.isAdmin) {
    res.status(403).json(localMessage(req, 'Bu işlemi yapmaya yetkiniz yok!', 'You are not authorised to perform this action.'));
    return;
  }

  try {
    const { publicId } = req.params;
    if (!publicId) {
      res.status(400).json({ message: localMessage(req, 'Silinecek medya kimliği bulunamadı.', 'Missing media identifier.') });
      return;
    }

    const result = await cloudinary.uploader.destroy(publicId, { resource_type: 'video' });
    res.status(200).json(result);
  } catch (error) {
    console.error('Cloudinary destroy failed:', error);
    res.status(500).json({
      message: localMessage(req, 'Video silinirken bir hata oluştu.', 'An error occurred while deleting the video.'),
      error: error.message,
    });
  }
});

module.exports = router;
