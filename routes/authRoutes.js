const express = require('express');
const { connexion } = require('../controllers/authController');

const router = express.Router();

router.post('/connexion', connexion);

module.exports = router;
