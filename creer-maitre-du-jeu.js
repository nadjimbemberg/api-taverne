
const bcrypt = require('bcrypt');
const pool = require('./db');

const email = process.argv[2];
const motDePasseEnClair = process.argv[3];

async function creerMaitreDuJeu() {
  if (!email || !motDePasseEnClair) {
    console.error('Usage : node creer-maitre-du-jeu.js <email> <mot_de_passe>');
    process.exitCode = 1;
    return;
  }

  try {
    const saltRounds = 10;
    const motDePasseHache = await bcrypt.hash(motDePasseEnClair, saltRounds);

    // Si l'email existe déjà, on remplace son mot de passe (pratique pour le changer)
    const resultat = await pool.query(
      `INSERT INTO utilisateurs (email, mot_de_passe) VALUES ($1, $2)
       ON CONFLICT (email) DO UPDATE SET mot_de_passe = EXCLUDED.mot_de_passe
       RETURNING id, email, role`,
      [email, motDePasseHache]
    );

    console.log('Compte Maître du Jeu prêt :', resultat.rows[0]);
  } catch (err) {
    console.error('Erreur lors de la création du compte :', err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

creerMaitreDuJeu();



  

