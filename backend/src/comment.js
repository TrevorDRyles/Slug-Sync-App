const {Pool} = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
});

// https://chat.openai.com/share/9c8fe898-ae46-4b7a-8f68-3c01db7db9ed
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

exports.getAllCommentsOnGoal = async (req, res) => {
  const goalId = req.params.id;
  const query = `
      SELECT c.goal_id, c.id, c.user_id, c.data, u.data AS user_data
      FROM comment c
        JOIN "user" u ON u.id = c.user_id
        WHERE goal_id = $1;
  `;
  const {rows} = await pool.query(query, [goalId]);
  res.status(200).json(rows);
};
