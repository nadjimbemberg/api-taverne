require('dotenv').config();

const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const pnjRoutes = require('./routes/pnjRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Seul le front Next.js (port 3001) a le droit d'appeler l'API depuis le navigateur
const corsOptions = {
  origin: 'http://localhost:3001',
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Bienvenue sur votre API REST Node.js' });
});

app.use('/api', authRoutes);    // POST /api/connexion
app.use('/api/pnj', pnjRoutes); // GET, POST, PUT et DELETE sur /api/pnj

// Route inconnue : on répond en JSON plutôt qu'avec la page HTML d'Express
app.use((req, res) => {
  res.status(404).json({ message: 'Route introuvable' });
});

// JSON mal formé ou erreur imprévue
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
