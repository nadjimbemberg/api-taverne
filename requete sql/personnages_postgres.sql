-- Table Personnages pour PostgreSQL
-- (les aventuriers qui étaient écrits en dur dans server.js)

DROP TABLE IF EXISTS Personnages;

CREATE TABLE Personnages (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    classe VARCHAR(100),
    niveau INT NOT NULL DEFAULT 1 CHECK (niveau >= 1),
    statut VARCHAR(20) NOT NULL DEFAULT 'vivant'
);

INSERT INTO Personnages (nom, classe, niveau, statut) VALUES
('Lara Croft', 'Exploratrice', 3, 'morte'),
('Indiana Jones', 'Archéologue', 2, 'vivant'),
('Geralt de Riv', 'Sorceleur', 6, 'vivant'),
('Link', 'Héros', 7, 'vivant'),
('Frodo Baggins', 'Hobbit', 1, 'morte'),
('Eowyn', 'Guerrière', 4, 'vivant'),
('Gandalf', 'Magicien', 10, 'vivant'),
('Arya Stark', 'Assassin', 5, 'vivant'),
('Jon Snow', 'Guerrier', 7, 'vivant'),
('Daenerys Targaryen', 'Reine', 8, 'vivant');

-- Vérification
SELECT * FROM Personnages;
