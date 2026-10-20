
CREATE DATABASE IF NOT EXISTS generateur_pnj
    CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE generateur_pnj;

DROP TABLE IF EXISTS pnj_classe;
DROP TABLE IF EXISTS pnj;
DROP TABLE IF EXISTS classe;
DROP TABLE IF EXISTS race;


CREATE TABLE race (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nom VARCHAR(100) NOT NULL UNIQUE,
    esperance_vie INT NOT NULL,
    CONSTRAINT chk_race_esperance_vie CHECK (esperance_vie >= 0)
);


CREATE TABLE classe (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nom VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255)
);

CREATE TABLE pnj (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nom VARCHAR(100) NOT NULL,
    age INT NOT NULL,
    race_id INT NOT NULL,
    -- Point 3 : suppression logique (le PNJ mort reste en base)
    est_mort BOOLEAN NOT NULL DEFAULT FALSE,
    date_mort DATETIME NULL,
    -- Point 4 : date de création remplie automatiquement
    date_creation DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_pnj_age CHECK (age >= 0),
    CONSTRAINT fk_pnj_race FOREIGN KEY (race_id) REFERENCES race(id)
        ON DELETE RESTRICT
);

-- Table d'association : un PNJ peut avoir plusieurs classes, chacune avec son niveau
CREATE TABLE pnj_classe (
    pnj_id INT NOT NULL,
    classe_id INT NOT NULL,
    niveau INT NOT NULL DEFAULT 1,
    PRIMARY KEY (pnj_id, classe_id),
    CONSTRAINT chk_pnj_classe_niveau CHECK (niveau >= 1),
    CONSTRAINT fk_pc_pnj FOREIGN KEY (pnj_id) REFERENCES pnj(id)
        ON DELETE RESTRICT,
    CONSTRAINT fk_pc_classe FOREIGN KEY (classe_id) REFERENCES classe(id)
        ON DELETE RESTRICT
);

DELIMITER //
CREATE TRIGGER trg_pnj_interdire_delete
BEFORE DELETE ON pnj
FOR EACH ROW
BEGIN
    SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Suppression interdite : marquez le PNJ comme mort (est_mort = TRUE).';
END//
DELIMITER ;


INSERT INTO race (nom, esperance_vie) VALUES
('Humain', 80),
('Elfe', 750),
('Nain', 350);

INSERT INTO classe (nom, description) VALUES
('Guerrier', 'Combattant au corps à corps'),
('Voleur', 'Discret et agile'),
('Mage', 'Maîtrise la magie des arcanes'),
('Prêtre', 'Soigne et protège ses alliés');


INSERT INTO pnj (nom, age, race_id) VALUES
('Thorn', 32, 1),
('Elara', 214, 2),
('Borin', 120, 3),
('Lyra', 95, 2),
('Gaspard le paysan', 45, 1);   -- aucune classe de combat

INSERT INTO pnj_classe (pnj_id, classe_id, niveau) VALUES
(1, 1, 5),   -- Thorn : Guerrier niv. 5
(1, 2, 3),   -- Thorn : Voleur niv. 3
(2, 3, 8),   -- Elara : Mage niv. 8
(3, 1, 4),   -- Borin : Guerrier niv. 4
(3, 4, 2),   -- Borin : Prêtre niv. 2
(4, 2, 6),   -- Lyra : Voleur niv. 6
(4, 3, 2);   -- Lyra : Mage niv. 2
-- Gaspard n'a volontairement aucune ligne ici

UPDATE pnj SET est_mort = TRUE, date_mort = NOW() WHERE id = 3;

-- Tests des contraintes (à décommenter un par un, chacun doit ÉCHOUER) :
-- INSERT INTO race (nom, esperance_vie) VALUES ('Orc', -10);        -- CHECK
-- INSERT INTO pnj (nom, age, race_id) VALUES ('Bug', -5, 1);         -- CHECK
-- INSERT INTO classe (nom) VALUES ('Guerrier');                      -- UNIQUE
-- DELETE FROM pnj WHERE id = 1;                                      -- TRIGGER



SELECT p.nom AS pnj,
       COALESCE(c.nom, 'Civil') AS classe,
       pc.niveau
FROM pnj p
LEFT JOIN pnj_classe pc ON pc.pnj_id = p.id
LEFT JOIN classe c ON c.id = pc.classe_id
ORDER BY p.nom, classe;


SELECT c.nom AS classe,
       COUNT(pc.pnj_id) AS nb_pnj
FROM classe c
JOIN pnj_classe pc ON pc.classe_id = c.id
GROUP BY c.id, c.nom
HAVING COUNT(pc.pnj_id) >= 2
ORDER BY nb_pnj DESC;


SELECT CONCAT(
           p.nom, ' | ',
           COALESCE(GROUP_CONCAT(c.nom ORDER BY c.nom SEPARATOR ', '), 'Civil')
       ) AS menu
FROM pnj p
LEFT JOIN pnj_classe pc ON pc.pnj_id = p.id
LEFT JOIN classe c ON c.id = pc.classe_id
GROUP BY p.id, p.nom
ORDER BY p.nom;
