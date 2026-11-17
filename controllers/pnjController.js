const pool = require('../db');


const listerPnjs = async (req, res) => {
  const nomCherche = req.query.nom;

  try {
    let resultat;

    if (nomCherche) {
      
      resultat = await pool.query(
        'SELECT * FROM Personnages WHERE nom ILIKE $1 ORDER BY id',
        [`%${nomCherche}%`]
      );
    } else {
      resultat = await pool.query('SELECT * FROM Personnages ORDER BY id');
    }

    res.status(200).json(resultat.rows);
  } catch (err) {
    console.error('Erreur SQL lors de la lecture des PNJ :', err.message);
    res.status(500).json({ message: 'Impossible de récupérer les PNJ' });
  }
};


const trouverPnj = async (req, res) => {
  const id = req.params.id;

  try {
    const resultat = await pool.query('SELECT * FROM Personnages WHERE id = $1', [id]);

    if (resultat.rows.length === 0) {
      return res.status(404).json({ message: `Aucun PNJ trouvé avec l'id ${id}` });
    }

    res.status(200).json(resultat.rows[0]);
  } catch (err) {
    console.error('Erreur SQL lors de la lecture du PNJ :', err.message);
    res.status(500).json({ message: 'Erreur lors de la récupération du PNJ' });
  }
};


const creerPnj = async (req, res) => {
  const nom = req.body.nom;
  const classe = req.body.classe;
  const niveau = req.body.niveau;

  if (!nom || !classe || !niveau) {
    return res.status(400).json({
      message: 'Requête incomplète : nom, classe et niveau sont obligatoires.'
    });
  }

  if (Number(niveau) < 1) {
    return res.status(400).json({ message: 'Le niveau doit être supérieur ou égal à 1.' });
  }

  try {
  
    const resultat = await pool.query(
      'INSERT INTO Personnages (nom, classe, niveau) VALUES ($1, $2, $3) RETURNING *',
      [nom, classe, niveau]
    );

    res.status(201).json({
      message: `Le PNJ ${nom} de classe ${classe} a été créé avec succès !`,
      pnj: resultat.rows[0]
    });
  } catch (err) {
    console.error('Erreur SQL lors de la création du PNJ :', err.message);
    res.status(500).json({ message: 'Erreur lors de la création du PNJ' });
  }
};


const modifierPnj = async (req, res) => {
  const id = req.params.id;
  const nom = req.body.nom;
  const classe = req.body.classe;
  const niveau = req.body.niveau;
  const statut = req.body.statut;

  if (!nom && !classe && !niveau && !statut) {
    return res.status(400).json({
      message: 'Rien à modifier : envoyez au moins nom, classe, niveau ou statut.'
    });
  }

  if (niveau !== undefined && Number(niveau) < 1) {
    return res.status(400).json({ message: 'Le niveau doit être supérieur ou égal à 1.' });
  }

  try {
  
    const resultat = await pool.query(
      `UPDATE Personnages
       SET nom = COALESCE($1, nom),
           classe = COALESCE($2, classe),
           niveau = COALESCE($3, niveau),
           statut = COALESCE($4, statut)
       WHERE id = $5
       RETURNING *`,
      [nom, classe, niveau, statut, id]
    );

    if (resultat.rows.length === 0) {
      return res.status(404).json({ message: `Aucun PNJ trouvé avec l'id ${id}` });
    }

    res.status(200).json({
      message: `Le PNJ ${resultat.rows[0].nom} a été modifié.`,
      pnj: resultat.rows[0]
    });
  } catch (err) {
    console.error('Erreur SQL lors de la modification du PNJ :', err.message);
    res.status(500).json({ message: 'Erreur lors de la modification du PNJ' });
  }
};


const supprimerPnj = async (req, res) => {
  const id = req.params.id;

  try {
    const resultat = await pool.query('DELETE FROM Personnages WHERE id = $1 RETURNING *', [id]);

    if (resultat.rows.length === 0) {
      return res.status(404).json({ message: `Aucun PNJ trouvé avec l'id ${id}` });
    }

    res.status(200).json({ message: `Le PNJ ${resultat.rows[0].nom} a été supprimé.` });
  } catch (err) {
    console.error('Erreur SQL lors de la suppression du PNJ :', err.message);
    res.status(500).json({ message: 'Erreur lors de la suppression du PNJ' });
  }
};

module.exports = { listerPnjs, trouverPnj, creerPnj, modifierPnj, supprimerPnj };
