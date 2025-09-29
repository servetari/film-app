const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const sanitizeUser = (user) => {
  if (!user) return null;
  const { password, ...rest } = user._doc || user;
  return rest;
};

const localMessage = (req, tr, en) => (req?.language === 'en' ? en : tr);

const register = async (req, res) => {
  try {
    const { username, email, password, avatar } = req.body;

    const existingUser = await User.findOne({ $or: [{ email: email?.toLowerCase() }, { username }] });
    if (existingUser) {
      res.status(400).json({ message: localMessage(req, 'Bu e-posta veya kullanıcı adı zaten kullanılıyor.', 'This email or username is already in use.') });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      email: email?.toLowerCase(),
      password: hashedPassword,
      avatar: typeof avatar === 'string' && avatar.trim().length ? avatar.trim() : undefined,
    });

    await newUser.save();

    res.status(201).json({ message: localMessage(req, 'Kullanıcı başarıyla oluşturuldu.', 'User created successfully.') });
  } catch (error) {
    res.status(500).json({ message: localMessage(req, 'Sunucu hatası.', 'Server error.'), error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email?.toLowerCase() });
    if (!user) {
      res.status(400).json({ message: localMessage(req, 'Geçersiz e-posta veya şifre.', 'Invalid email or password.') });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({ message: localMessage(req, 'Geçersiz e-posta veya şifre.', 'Invalid email or password.') });
      return;
    }

    const payload = {
      id: user._id,
      isAdmin: user.isAdmin,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    res.status(200).json({ token, user: sanitizeUser(user) });
  } catch (error) {
    res.status(500).json({ message: localMessage(req, 'Sunucu hatası.', 'Server error.'), error: error.message });
  }
};

const checkAvailability = async (req, res) => {
  try {
    const email = req.query.email?.toLowerCase()?.trim();
    const username = req.query.username?.trim();

    let emailAvailable = true;
    let usernameAvailable = true;

    if (email) {
      const count = await User.countDocuments({ email });
      emailAvailable = count === 0;
    }
    if (username) {
      const count2 = await User.countDocuments({ username });
      usernameAvailable = count2 === 0;
    }

    res.status(200).json({ emailAvailable, usernameAvailable });
  } catch (error) {
    res.status(500).json({ message: localMessage(req, 'Sunucu hatası.', 'Server error.'), error: error.message });
  }
};

module.exports = {
  register,
  login,
  checkAvailability,
};
