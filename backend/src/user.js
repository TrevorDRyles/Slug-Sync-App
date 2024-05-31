const {Pool} = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
});

exports.getUserById = async (req, res) => {
  const id = req.params.id;
  const query = `
      SELECT * FROM "user" WHERE id = $1;
  `;
  const result = await pool.query(query, [id]);
  if (result.rows.length === 0) {
    return res.status(404).send('User not found');
  }
  res.status(200).json(result.rows[0]);
};
