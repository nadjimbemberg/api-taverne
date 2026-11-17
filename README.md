# API de la Taverne

API Node.js / Express connectée à une base PostgreSQL (Neon) pour gérer les PNJ d'une campagne.
Le front (tableau de bord du Maître du Jeu) est un projet à part : `../tableau-de-bord-mj`.

## Lancer le projet

```bash
npm install
npm run dev
```

L'API tourne sur http://localhost:3000. Le CORS n'autorise que le front sur http://localhost:3001.

Le fichier `.env` doit contenir `DATABASE_URL` et `JWT_SECRET` (voir `.env.example`).

Pour créer ou changer le compte du Maître du Jeu :

```bash
node creer-maitre-du-jeu.js email@exemple.fr motdepasse
```

## Organisation

```
server.js          configuration d'Express et branchement des routes
db.js              connexion à la base Neon
routes/            quelle URL appelle quelle fonction
controllers/       les fonctions qui font les requêtes SQL et répondent
middlewares/       auth.js (vérifie le token) et verifierId.js (vérifie l'id)
requete sql/       scripts pour recréer les tables
postman/           collection pour tester toutes les routes
```

## Routes

| Méthode | URL | Token | Rôle |
|---|---|---|---|
| POST | `/api/connexion` | non | connexion du MJ, renvoie un token |
| GET | `/api/pnj` | non | liste des PNJ (`?nom=` pour chercher) |
| GET | `/api/pnj/:id` | non | un PNJ |
| POST | `/api/pnj` | oui | créer un PNJ |
| PUT | `/api/pnj/:id` | oui | modifier un PNJ |
| DELETE | `/api/pnj/:id` | oui | supprimer un PNJ |

Les routes avec token attendent l'en-tête `Authorization: Bearer <token>`.
