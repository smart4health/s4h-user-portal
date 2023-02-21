const liveness = (req, res) => {
  res.json({
    Status: 'Alive',
  });
};

const readiness = (req, res) => {
  res.json({
    Status: 'OK',
  });
};

module.exports = { liveness, readiness };
