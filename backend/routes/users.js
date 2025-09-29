const router = require('express').Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Content = require('../models/Content');
const verifyToken = require('../middleware/verifyToken');
const { isKidFriendly } = require('../utils/filters');

const localMessage = (req, tr, en) => (req.language === 'en' ? en : tr);

const sanitizeUser = (user) => {
  if (!user) return null;
  const { password, ...rest } = user._doc || user;
  return rest;
};

router.get('/favorites', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('favorites');

    if (!user) {
      res.status(404).json(localMessage(req, 'Kullanıcı bulunamadı.', 'User not found.'));
      return;
    }

    const kidsMode = req.profileMode === 'kids';
    const favs = Array.isArray(user.favorites) ? user.favorites : [];
    const filtered = kidsMode ? favs.filter((c) => isKidFriendly(c)) : favs;
    res.status(200).json(filtered);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.post('/favorites', verifyToken, async (req, res) => {
  const { contentId } = req.body;

  if (!contentId) {
    res.status(400).json(localMessage(req, 'contentId alanı zorunludur.', 'The contentId field is required.'));
    return;
  }

  try {
    const contentExists = await Content.exists({ _id: contentId });

    if (!contentExists) {
      res.status(404).json(localMessage(req, 'İçerik bulunamadı.', 'Content not found.'));
      return;
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $addToSet: { favorites: contentId } },
      { new: true }
    ).populate('favorites');

    res.status(200).json(user?.favorites || []);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.delete('/favorites/:contentId', verifyToken, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $pull: { favorites: req.params.contentId } },
      { new: true }
    ).populate('favorites');

    res.status(200).json(user?.favorites || []);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      res.status(404).json({ message: localMessage(req, 'Kullanıcı bulunamadı.', 'User not found.') });
      return;
    }

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.put('/me', verifyToken, async (req, res) => {
  try {
    const updates = {};
    const { username, email, avatar } = req.body;

    if (username) {
      const trimmed = username.trim();
      if (trimmed.length === 0) {
        res.status(400).json({ message: localMessage(req, 'Kullanıcı adı boş olamaz.', 'Username cannot be empty.') });
        return;
      }
      const existing = await User.findOne({ username: trimmed, _id: { $ne: req.user.id } });
      if (existing) {
        res.status(400).json({ message: localMessage(req, 'Bu kullanıcı adı zaten kullanılıyor.', 'This username is already taken.') });
        return;
      }
      updates.username = trimmed;
    }

    if (email) {
      const trimmedEmail = email.trim().toLowerCase();
      const existingEmail = await User.findOne({ email: trimmedEmail, _id: { $ne: req.user.id } });
      if (existingEmail) {
        res.status(400).json({ message: localMessage(req, 'Bu e-posta zaten kullanılıyor.', 'This email is already in use.') });
        return;
      }
      updates.email = trimmedEmail;
    }

    if (typeof avatar === 'string') {
      updates.avatar = avatar.trim();
    }

    if (!Object.keys(updates).length) {
      res.status(400).json({ message: localMessage(req, 'Güncellenecek bir alan bulunamadı.', 'There is nothing to update.') });
      return;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json(updatedUser);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.put('/me/password', verifyToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res.status(400).json({ message: localMessage(req, 'Mevcut ve yeni şifre alanları zorunludur.', 'Current and new password fields are required.') });
    return;
  }

  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      res.status(404).json({ message: localMessage(req, 'Kullanıcı bulunamadı.', 'User not found.') });
      return;
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      res.status(400).json({ message: localMessage(req, 'Mevcut şifre doğru değil.', 'The current password is incorrect.') });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({ message: localMessage(req, 'Şifre başarıyla güncellendi.', 'Password updated successfully.') });
  } catch (err) {
    res.status(500).json(err);
  }
});

router.put('/:id', verifyToken, async (req, res) => {
  if (req.user.id === req.params.id || req.user.isAdmin) {
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      req.body.password = await bcrypt.hash(req.body.password, salt);
    }
    try {
      const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true }
      );
      res.status(200).json(updatedUser);
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json(localMessage(req, 'Sadece kendi hesabınızı güncelleyebilirsiniz!', 'You can only update your own account!'));
  }
});

router.delete('/:id', verifyToken, async (req, res) => {
  if (req.user.id === req.params.id || req.user.isAdmin) {
    try {
      await User.findByIdAndDelete(req.params.id);
      res.status(200).json(localMessage(req, 'Kullanıcı silindi.', 'User deleted.'));
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json(localMessage(req, 'Sadece kendi hesabınızı silebilirsiniz!', 'You can only delete your own account!'));
  }
});

router.get('/find/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404).json({ message: localMessage(req, 'Kullanıcı bulunamadı.', 'User not found.') });
      return;
    }
    res.status(200).json(sanitizeUser(user));
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get('/', verifyToken, async (req, res) => {
  if (req.user.isAdmin) {
    try {
      const users = await User.find();
      res.status(200).json(users.map((user) => sanitizeUser(user)));
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json(localMessage(req, 'Tüm kullanıcıları görme yetkiniz yok!', 'You are not allowed to view all users!'));
  }
});

module.exports = router;
