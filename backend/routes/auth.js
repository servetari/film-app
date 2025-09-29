const express = require('express');
const router = express.Router();


const { register, login, checkAvailability } = require('../controllers/auth.js');


router.post('/register', register);


router.post('/login', login);

router.get('/check', checkAvailability);


module.exports = router;
