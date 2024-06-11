const {Pool} = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
});

/**
 * Adds a comment to a specific goal.
 * 
 * @async
 * @function addCommentToGoal
 * @param {Object} req - The request object.
 * @param {Object} req.user - The authenticated user object.
 * @param {string} req.user.id - The ID of the authenticated user.
 * @param {Object} req.body - The body of the request.
 * @param {string} req.body.content - The content of the comment.
 * @param {string} req.body.date - The date of the comment.
 * @param {Object} req.params - The route parameters.
 * @param {string} req.params.id - The ID of the goal.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} Sends a 404 status if the goal is not found, otherwise adds the comment and sends the newly created comment.
 */
exports.addCommentToGoal = async (req, res) => {
  const {id} = req.user; 
  const {content, date} = req.body;
  const goalId = req.params.id;

  const selectGoalQuery = 'SELECT * FROM goal WHERE id = $1';
  const selectResult = await pool.query(selectGoalQuery, [goalId]);

  if (selectResult.rows.length === 0) {
    return res.status(404).send();
  }

  const insert = `
    WITH user_info AS (
      SELECT data->>'name' AS username
      FROM "user"
      WHERE id = $1
    )

    INSERT INTO comment(user_id, goal_id, data)
    VALUES($1, $2, jsonb_build_object(
      'content', $3::text,
      'username', (SELECT username FROM user_info),
      'date', $4::timestamp))
    RETURNING *;
  `;

  const {rows} = await pool.query(insert, [id, goalId, content, date]);
  res.status(200).json(rows[0]);
};

/**
 * Retrieves all comments on a specific goal.
 * 
 * @async
 * @function getAllCommentsOnGoal
 * @param {Object} req - The request object.
 * @param {Object} req.params - The route parameters.
 * @param {string} req.params.id - The ID of the goal.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} Sends a response with all comments on the specified goal.
 */
exports.getAllCommentsOnGoal = async (req, res) => {
  const goalId = req.params.id;
  const query = `
        SELECT * FROM comment WHERE goal_id = $1;
  `;
  const {rows} = await pool.query(query, [goalId]);
  res.status(200).json(rows);
};
