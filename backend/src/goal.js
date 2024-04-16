const {Pool} = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
});

exports.createGoal = async (req, res) => {
  const goal = req.body;
  const query = `
        INSERT INTO goal(goal)
        VALUES ($1)
        RETURNING *
  `;
  const result = await pool.query(query, [goal]);
  res.status(200).json({id: result.rows[0].id, ...result.rows[0].goal});
};

