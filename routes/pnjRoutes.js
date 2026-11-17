const express = require('express');
const verifierToken = require('../middlewares/auth');
const verifierId = require('../middlewares/verifierId');
const {
  listerPnjs,
  trouverPnj,
  creerPnj,
  modifierPnj,
  supprimerPnj
} = require('../controllers/pnjController');

const router = express.Router();

// Routes publiques
router.get('/', listerPnjs);
router.get('/:id', verifierId, trouverPnj);

// Routes réservées au Maître du Jeu : le vigile vérifie le token en premier
router.post('/', verifierToken, creerPnj);
router.put('/:id', verifierToken, verifierId, modifierPnj);
router.delete('/:id', verifierToken, verifierId, supprimerPnj);

module.exports = router;
