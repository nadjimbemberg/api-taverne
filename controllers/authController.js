const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');


const connexion = async (req, res) => {
  const email = req.body.email;
  const motDePasseSaisi = req.body.password;

  if (!email || !motDePasseSaisi) {
    return res.status(400).json({ message: 'Email et mot de passe obligatoires.' });
  }

  try {
    const resultat = await pool.query('SELECT * FROM utilisateurs WHERE email = $1', [email]);
    const utilisateurTrouve = resultat.rows[0];

   
    if (!utilisateurTrouve) {
      return res.status(401).json({ message: 'Identifiants invalides.' });
    }

    const motDePasseValide = await bcrypt.compare(motDePasseSaisi, utilisateurTrouve.mot_de_passe);

    if (!motDePasseValide) {
      return res.status(401).json({ message: 'Identifiants invalides.' });
    }

    const token = jwt.sign(
      { id: utilisateurTrouve.id, role: utilisateurTrouve.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({ token });
  } catch (err) {
    console.error('Erreur lors de la connexion :', err.message);
    res.status(500).json({ message: 'Erreur lors de la connexion' });
  }
};

module.exports = { connexion };
