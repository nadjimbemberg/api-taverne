# Exemples du cours — API de la Taverne

Code écrit en cours, conservé tel quel pour réviser.
Ce fichier n'est **jamais exécuté** : la version qui fonctionne est dans `server.js` et `db.js`.

Les notes « ⚠️ À retenir » expliquent ce qui a été corrigé dans la version finale.

---

## 1. Premier serveur Express (port 4000)

```js
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Bienvenue sur votre API REST Node.js');
});

app.get('/aventuriers', (req, res) => {
  // Exemple de données d'aventuriers
  const aventuriers = [
    { id: 1, nom: 'Lara Croft', classe: 'Exploratrice', niveau: '3', statut: 'morte' },
    { id: 2, nom: 'Indiana Jones', classe: 'Archéologue', niveau: '2', statut: 'vivant' },
    { id: 3, nom: 'Geralt de Riv', classe: 'Sorceleur', niveau: '6', statut: 'vivant' },
    { id: 4, nom: 'Link', classe: 'Héros', niveau: '7', statut: 'vivant' },
    { id: 5, nom: 'Frodo Baggins', classe: 'Hobbit', niveau: '1', statut: 'morte' },
    { id: 6, nom: 'Eowyn', classe: 'Guerrière', niveau: '4', statut: 'vivant' },
    { id: 7, nom: 'Gandalf', classe: 'Magicien' , niveau: '10', statut: 'vivant' },
    { id: 8, nom: 'Arya Stark', classe: 'Assassin' , niveau: '5', statut: 'vivant' },
    { id: 9, nom: 'Jon Snow', classe: 'Guerrier', niveau: '7', statut: 'vivant' },
    { id: 10, nom: 'Daenerys Targaryen', classe: 'Reine', niveau: '8', statut: 'vivant' }
  ];
  res.json(aventuriers);

  setTimeout(() => {
    res.json(aventuriers);
  }, 1000); // Délai de 1 seconde avant d'envoyer la réponse 
});

app.listen(4000, () => {
  console.log('Serveur démarré sur http://localhost:4000');
});
```

⚠️ À retenir :
- Une requête ne reçoit **qu'une seule réponse** : le `res.json` dans le `setTimeout` provoque l'erreur « Cannot set headers after they are sent ».
- Ces 10 aventuriers sont maintenant dans Neon (table `Personnages`, script `requete sql/personnages_postgres.sql`).

---

## 2. Serveur de la taverne (port 3000) et `req.query`

```js
const express = require('express');

const app = express();
const PORT = 3000;

app.use(express.json());

app.listen(PORT, () => {
  console.log(`Le serveur de la taverne est ouvert sur http://localhost:${PORT}`);
});

app.get('/', (req, res) => {

const idSaisi = req.query.id;

res.json({ message: `Vous demandé à voir le PNJ numéro : ${idSaisi}` });
});
```

Même idée sur `/api/pnj` :

```js
app.get('/api/pnj', (req, res) => {
const idSaisi = req.query.id;

res.json({ message: `Vous demandé à voir le PNJ numéro : ${idSaisi}` });
}); 
```

⚠️ À retenir :
- `req.query` lit les paramètres après le `?` dans l'URL : `http://localhost:3000/?id=5` → `req.query.id` vaut `"5"`.
- `require('express')`, `const app = express()` et `app.listen` ne s'écrivent **qu'une seule fois** par serveur.
- Deux routes avec le même verbe et le même chemin : seule la **première** répond.

---

## 3. Route avec des données écrites en dur

```js
app.get("api/pnj", (req, res) => {
  
  const inventaire = [ 
      { id: 1, nom: 'Lara Croft', classe: 'Exploratrice', niveau: '3', statut: 'morte' },
      { id: 2, nom: 'Indiana Jones', classe: 'Archéologue', niveau: '2', statut: 'vivant' },
  ];

  res.json(inventaire);
});
```

⚠️ À retenir : un chemin de route commence **toujours par `/`** → `"/api/pnj"`. Sans le `/`, la route ne répond jamais.

---

## 4. Recevoir des données : `POST` et `req.body`

```js
app.use(express.json());

app.post('/api/pnj', (req, res) => {

  const nomDuNouveauPNJ = req.body.nom;
  const ClasseDuNouveauPNJ = req.body.classe;

  res.status(201).json({
    message: `Le PNJ ${nomDuNouveauPNJ} de classe ${ClasseDuNouveauPNJ} a été créé avec succès !`
  });
});
```

⚠️ À retenir :
- `express.json()` est obligatoire pour que `req.body` soit rempli.
- `201` = code HTTP des créations réussies.
- Dans la version finale, la route fait un vrai `INSERT` dans Neon et vérifie que les champs sont présents (code `400` sinon).

---

## 5. Connexion à PostgreSQL avec un Pool (`db.js`)

Fichier `.env` (forme de l'exemple du cours, la vraie adresse vient de Neon) :

```
DATABASE_URL=postgres://utilisateur:mot_de_passe@localhost:5432/nom_de_la_base_de_donnees
```

Fichier `db.js` :

```js
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

module.exports = pool;
```

Dans `server.js` :

```js
const pool = require('./db');
```

⚠️ À retenir :
- `require('dotenv').config()` charge le fichier `.env` dans `process.env`.
- `module.exports = pool` (dans `db.js`) + `require('./db')` (dans `server.js`) = on partage **le même Pool** entre les fichiers.
- Ce code doit être dans `db.js`, pas dans `server.js` : sinon `pool` est déclaré deux fois et le serveur ne démarre pas.
- Version finale : ajout de `pool.on('error', ...)` pour que Node ne plante pas si Neon coupe une connexion.

---

## 6. Lire la base : `SELECT`

```js
app.get('/api/pnj', async (req, res) => {

  const resultat = await pool.query('SELECT * FROM Personnages');

  res.status(200).json(resultat.rows);
});
```

⚠️ À retenir :
- `async` sur la fonction est obligatoire pour utiliser `await`.
- Les lignes trouvées sont dans `resultat.rows`.
- Version finale : ajout d'un `try/catch` qui renvoie `500` si Neon est en panne.

---

## 7. Requête paramétrée avec `$1` (recherche par nom)

```js
const nomSaisi = req.query.nom;

await pool.query('SELECT * FROM Personnages WHERE nom = $1', [nomSaisi]);

const requeteSQL = 'SELECT * FROM Personnages WHERE nom = $1';

const valeurs = [nomSaisi];

const resultat = await pool.query(requeteSQL, valeurs);
```

⚠️ À retenir :
- `$1` est remplacé par la 1ʳᵉ valeur du tableau : c'est la **protection contre l'injection SQL**.
- Les deux écritures font la même chose (requête directe, ou requête et valeurs dans des variables).
- Ce code doit être **à l'intérieur d'une route** `async (req, res) => { ... }` : en dehors, `req` n'existe pas et `await` est interdit.

---

## 8. Un PNJ par son id : `req.params`, `try/catch` et `404`

```js
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
```

⚠️ À corriger avant de l'utiliser :
- Pas d'espace dans le chemin : `'/api/pnj/:id'`.
- `res.status(200).json(...)` est écrit deux fois : une seule réponse par requête.

À retenir :
- `:id` dans le chemin → `req.params.id` (ex. `/api/pnj/3` → `"3"`).
- `rows.length === 0` → aucun PNJ trouvé → code `404`.

---

## 9. Modifier : `PUT`

```js
app.put("api/pnj/niveau"  , (req, res) => {
  
  const id = req.body.id;
  const nouveauNiveau = req.body.niveau;

  pool.query(
    'UPDATE Personnages SET niveau = $1 WHERE id = ${nouveauNiveau} Where id =  ${id}',
);

res.json({ message: "Niveau mis à jour !" });

}); 
```

⚠️ À corriger avant de l'utiliser :
- Le chemin doit commencer par `/` : `"/api/pnj/niveau"`.
- La requête SQL doit utiliser `$1` et `$2` avec un tableau de valeurs (et un seul `WHERE`) :
  `'UPDATE Personnages SET niveau = $1 WHERE id = $2', [nouveauNiveau, id]`
- `${...}` ne fonctionne qu'entre accents graves `` ` ``, pas entre guillemets simples `'`.
- Il faut `async` / `await` et un `try/catch`, comme pour les autres routes.
