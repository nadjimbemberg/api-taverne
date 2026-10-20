require('dotenv').config();


const express = require('express');
const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  const idSaisi = req.query.id;

  if (idSaisi) {
    return res.json({ message: `Vous avez demandé à voir le PNJ numéro : ${idSaisi}` });
  }

  res.json({ message: 'Bienvenue sur votre API REST Node.js' });
});

// Fonctionnalité 2 : l'enrôlement d'une recrue
app.post('/api/pnj', async (req, res) => {

  const nomDuNouveauPNJ = req.body.nom;
  const ClasseDuNouveauPNJ = req.body.classe;
  const niveauDuNouveauPNJ = req.body.niveau;

  // Bonus : requête incomplète -> on bloque avant de solliciter Neon
  if (!nomDuNouveauPNJ || !ClasseDuNouveauPNJ || !niveauDuNouveauPNJ) {
    return res.status(400).json({
      message: 'Requête incomplète : nom, classe et niveau sont obligatoires.'
    });
  }

  try {
    // $1, $2, $3 : requête paramétrée, protégée contre l'injection SQL
    const resultat = await pool.query(
      'INSERT INTO Personnages (nom, classe, niveau) VALUES ($1, $2, $3) RETURNING *',
      [nomDuNouveauPNJ, ClasseDuNouveauPNJ, niveauDuNouveauPNJ]
    );

    res.status(201).json({
      message: `Le PNJ ${nomDuNouveauPNJ} de classe ${ClasseDuNouveauPNJ} a été créé avec succès !`,
      pnj: resultat.rows[0]
    });
  } catch (err) {
    console.error('Erreur SQL lors de la création du PNJ :', err.message);

    res.status(500).json({ message: 'Erreur lors de la création du PNJ' });
  }
});

// Fonctionnalité 1 : le registre de la taverne
app.get('/api/pnj', async (req, res) => {
  try {
    const resultat = await pool.query('SELECT * FROM Personnages');

    res.status(200).json(resultat.rows);
  } catch (err) {
    console.error('Erreur SQL lors de la lecture des PNJ :', err.message);

    res.status(500).json({ message: 'Impossible de récupérer les PNJ' });
  }
});

/* Hors sujet pour ce TP : mis en commentaire pour l'instant

app.get('/api/pnj/ :id', async (req, res) => {
try {

  const idSaisi = req.params.id;
  const resultat = await pool.query(
  "SELECT * FROM Personnages WHERE id = $1",
  [idSaisi] );

  if (resultat.rows.length === 0) {

    return res
    .status(404)
    .json({ message: `Aucun PNJ trouvé avec l'ID ${idSaisi}` });
  }

  res.status(200).json(resultat.rows[0]);

res.status(200).json(resultat.rows[0]);
}catch (err) {

  console.error('Erreur SQL ', err.message);

res
.status(500)
.json({ message: 'Erreur lors de la récupération du PNJ' });
}
});

app.put("api/pnj/niveau"  , (req, res) => {

  const id = req.body.id;
  const nouveauNiveau = req.body.niveau;

  pool.query(
    'UPDATE Personnages SET niveau = $1 WHERE id = ${nouveauNiveau} Where id =  ${id}',
);

res.json({ message: "Niveau mis à jour !" });

});

*/

// Route inconnue : on répond en JSON (au lieu de la page HTML d'Express)
app.use((req, res) => {
  res.status(404).json({ message: 'Route introuvable' });
});

// JSON mal formé ou erreur imprévue : on répond aussi en JSON
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Le corps de la requête n\'est pas un JSON valide.' });
  }

  console.error('Erreur inattendue :', err.message);
  res.status(500).json({ message: 'Erreur interne du serveur' });
});

app.listen(PORT, () => {
  console.log(`Le serveur de la taverne est ouvert sur http://localhost:${PORT}`);
});
