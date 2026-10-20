require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({

  connectionString: process.env.DATABASE_URL,

  ssl: {
    rejectUnauthorized: false
  }
});

pool.connect((err, client, release) => {
  if (err) {
  console.error('Erreur de connexion à la base de données', err.stack);
  } else {
    console.log("Connexion à la base de données réussie !");
    release();
  }
});

// Tolérance aux pannes : si Neon coupe une connexion inactive,
// on affiche l'erreur au lieu de laisser Node planter.
pool.on('error', (err) => {
  console.error('Erreur inattendue du pool PostgreSQL :', err.message);
});

module.exports = pool;