
const verifierId = (req, res, next) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ message: "L'id doit être un nombre entier positif." });
  }

  next(); 
};

module.exports = verifierId;
