
const jwt = require('jsonwebtoken');
require('dotenv').config(); 

const verifierToken = (req, res, next) => {


  const headerAuth = req.headers.authorization;

  if (!headerAuth) {
    return res.status(401).json({ erreur: "Accès refusé. Aucun badge VIP présenté." });
  }

  const token = headerAuth.split(' ')[1];

  if (!token) {
    return res.status(401).json({ erreur: "Format de token invalide." });
  }


  try {
    const payloadDecode = jwt.verify(token, process.env.JWT_SECRET);

  
    req.utilisateur = payloadDecode;

    next();
  } catch (erreur) {
   
    return res.status(403).json({ erreur: "Badge VIP invalide ou expiré. Expulsion immédiate." });
  }
};

module.exports = verifierToken;
