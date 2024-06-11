const {Pool} = require('pg');
const db = require('./db');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
});

/**
 * Retrieves user information by user ID from the database and
 * sends it in the response.
 *
 * @async
 * @function getUserById
 * @param {Object} req - The request object.
 * @param {string} req.params.id - The ID of the user to
 * retrieve information for.
 * @param {Object} res - The response object.
 * @return {Promise<void>} Returns a promise that resolves
 * when the user information is retrieved and sent in the response.
 */
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

/**
 * Retrieves user information for the authenticated user from
 * the database and sends it in the response.
 *
 * @async
 * @function getUserInformation
 * @param {Object} req - The request object.
 * @param {Object} req.user - The authenticated user object.
 * @param {string} req.user.id - The ID of the authenticated user.
 * @param {Object} res - The response object.
 * @return {Promise<void>} Returns a promise that resolves
 * when the user information is retrieved and sent in the response.
 */
exports.getUserInformation = async (req, res) => {
  const {id} = req.user;
  const user = await db.getUserInformation(id);
  res.status(200).json(user);
};
