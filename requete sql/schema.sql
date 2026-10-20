-- Correction : on supprime les tables avant de les recréer, pour pouvoir relancer le script
DROP TABLE IF EXISTS article_tags;
DROP TABLE IF EXISTS tags;
DROP TABLE IF EXISTS articles;
DROP TABLE IF EXISTS produits;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS utilisateurs;

CREATE TABLE categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nom VARCHAR(255) NOT NULL unique,
    description VARCHAR(255)
);

CREATE TABLE produits(
    id INT PRIMARY KEY AUTO_INCREMENT,
    nom VARCHAR(255) NOT NULL unique,
    prix DECIMAL(10,2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    categorie_id INT,
    FOREIGN KEY (categorie_id) REFERENCES categories(id)
);

CREATE TABLE utilisateurs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nom VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    age INT,
    domaine VARCHAR(255),
    annee_inscription INT
);

-- Correction : tables utilisées par les requêtes plus bas mais jamais créées
CREATE TABLE articles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    utilisateur_id INT NOT NULL,
    categorie_id INT,
    titre VARCHAR(255) NOT NULL,
    date_publication DATE NOT NULL,
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id),
    FOREIGN KEY (categorie_id) REFERENCES categories(id)
);

CREATE TABLE tags (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nom VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE article_tags (
    article_id INT NOT NULL,
    tag_id INT NOT NULL,
    PRIMARY KEY (article_id, tag_id),
    FOREIGN KEY (article_id) REFERENCES articles(id),
    FOREIGN KEY (tag_id) REFERENCES tags(id)
);

INSERT INTO categories (nom, description) VALUES
('Électronique', 'Appareils électroniques et gadgets'),
('Vêtements', 'Vêtements pour hommes, femmes et enfants'),
('Alimentation', 'Produits alimentaires et boissons');

INSERT INTO produits (nom, prix, stock, categorie_id) VALUES
('Smartphone', 699.99, 50, 1),
('Ordinateur portable', 999.99, 30, 1),
('T-shirt', 19.99, 100, 2),
('Jeans', 49.99, 80, 2),
('Chocolat', 5.99, 200, 3),
('Café', 9.99, 150, 3);

-- Correction : données de test pour que les requêtes renvoient des résultats
INSERT INTO utilisateurs (nom, email, age, annee_inscription) VALUES
('Alice', 'alice@gmail.com', 24, 2024),
('Bruno', 'bruno@yahoo.fr', 31, 2024),
('Chloé', 'chloe@gmail.com', 28, 2025),
('David', 'david@outlook.fr', 45, 2025);

INSERT INTO articles (utilisateur_id, categorie_id, titre, date_publication) VALUES
(1, 1, 'Test du nouveau smartphone', '2026-01-10'),
(2, 1, 'Quel ordinateur choisir ?', '2026-01-25'),
(1, 1, 'Les meilleurs écouteurs', '2026-04-02'),
(3, 2, 'Tendances mode printemps', '2026-03-01'),
(3, 2, 'Bien choisir son jean', '2026-03-15'),
(4, 3, 'Recette au chocolat', '2026-02-05'),
(1, 3, 'Le café parfait', '2026-05-20');

INSERT INTO tags (nom) VALUES
('Tech'),
('Mode'),
('Cuisine');

INSERT INTO article_tags (article_id, tag_id) VALUES
(1, 1), (2, 1), (3, 1),
(4, 2), (5, 2),
(6, 3), (7, 3);


-- Correction : virgules en trop avant les FROM supprimées,
-- et DATEDIFF à la place de "date - date > INTERVAL" (non valide en MySQL/MariaDB)
WITH EcartArticles AS (
    SELECT
        id,
        utilisateur_id,
        titre,
        date_publication,
        LAG(date_publication) OVER (PARTITION BY categorie_id ORDER BY id) AS date_precedente
    FROM articles
)
SELECT
    id,
    utilisateur_id,
    titre,
    date_publication,
    date_precedente
FROM EcartArticles
WHERE DATEDIFF(date_publication, date_precedente) > 30;

-- Correction : point-virgule manquant à la fin
with EcartArticles AS (
    SELECT
        id,
        utilisateur_id,
        titre,
        date_publication,
        LAG(date_publication) OVER (PARTITION BY categorie_id ORDER BY id) AS date_precedente
    FROM articles
)
SELECT u.nom, u.email
FROM utilisateurs u
JOIN EcartArticles ea ON u.id = ea.utilisateur_id;

-- Correction : requête incomplète (pas de FROM, virgule avant LIMIT).
-- c = categories et p = produits : on compte le nombre de produits par catégorie.
SELECT
    c.nom AS categorie_nom,
    COUNT(p.id) AS nombre_produits
FROM categories c
LEFT JOIN produits p ON p.categorie_id = c.id
GROUP BY c.id, c.nom
LIMIT 10;

SELECT u.id, u.nom, COUNT(a.id) AS nb_articles
FROM utilisateurs u
JOIN articles a ON a.utilisateur_id = u.id
GROUP BY u.id, u.nom
ORDER BY nb_articles DESC
LIMIT 3;

-- Correction : virgule en trop avant FROM.
-- On groupe sur l'expression, car "domaine" est aussi une colonne de la table
-- et MySQL choisirait la colonne au lieu de l'alias.
SELECT SUBSTRING_INDEX(email, '@', -1) AS domaine,
        AVG(age) AS age_moyen
FROM utilisateurs
GROUP BY SUBSTRING_INDEX(email, '@', -1)
ORDER BY age_moyen DESC;

-- Correction : la colonne s'appelle annee_inscription (et contient déjà l'année)
SELECT annee_inscription AS annee,
       GROUP_CONCAT(nom SEPARATOR ', ') AS prenoms
FROM utilisateurs
GROUP BY annee_inscription;

SELECT t.nom AS tag, COUNT(atg.article_id) AS nb_articles
FROM tags t
JOIN article_tags atg ON atg.tag_id = t.id
GROUP BY t.id, t.nom;
