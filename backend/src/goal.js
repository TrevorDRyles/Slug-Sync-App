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

// exports.getAllGoals = async (req, res) => {
//   const goal = req.body;
//   const query = `
//         SELECT * FROM goal
//   `;
//   const result = await pool.query(query, [goal]);
//   res.status(200).json({id: result.rows[0].id, ...result.rows[0].goal});
// };

exports.getPostsByPageAndSize = async function(req, res) {
  let pageNum = req.query.page;
  let searchTerm = req.query.search;
  if (searchTerm === undefined) {
    searchTerm = '%';
  }

  let size = req.query.size;
  // const user = req.user;
  if (size === undefined) {
    size = 20;
    pageNum = 1;
  } else {
    size = parseInt(req.query.size);
  }

  const selectQuery = `
SELECT *
FROM
    goal     -- the post's member is the logged in user
WHERE goal->>'title' ILIKE $3
ORDER BY
    goal->>'members'
DESC
LIMIT $2
OFFSET $1`;
  const query = {
    text: selectQuery,
    values: [(pageNum - 1) * size, size, `%${searchTerm}%`],
  };
  const result = await pool.query(query);
  console.log(result);
  const goals = result.rows.map((row) => ({
    id: row.id,
    title: row.goal.title,
    recurrence: row.goal.recurrence,
    description: row.goal.description,
  }));
  res.status(200).json(goals);
};

exports.viewGoal = async (req, res) => {
  const goalId = req.params.id;
  const query = `
        SELECT * FROM goal WHERE id = $1;
  `;
  const {rows} = await pool.query(query, [goalId]);
  if (rows.length === 0) {
    res.status(404).send();
  } else {
    res.status(200).json({id: rows[0].id, ...rows[0].goal});
  }
};

