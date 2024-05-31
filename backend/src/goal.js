const {Pool} = require('pg');
const db = require('./db');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
});

exports.createGoal = async (req, res) => {
  const goal = req.body;
  goal.memberCount = 1;
  const user = req.user;
  goal.author = user['id'];
  // todo: abstract these into db.js?
  const query = `
        INSERT INTO goal(goal)
        VALUES ($1)
        RETURNING *
  `;
  const result = await pool.query(query, [goal]);
  memberGoalData = {
    'member_id': user['id'],
    'goal_id': result['rows'][0]['id'],
    'lastChecked': new Date('1900-01-01T00:00:00Z').toISOString(),
    'streak': '0',
  };
  await db.joinGoal(memberGoalData);
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

  let filterTerm = req.query.tag;
  if (filterTerm === undefined) {
    filterTerm = '%';
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
WHERE goal->>'title' ILIKE $3 AND goal->>'tag' ILIKE $4
ORDER BY
    goal->>'members'
DESC
LIMIT $2
OFFSET $1`;
  const query = {
    text: selectQuery,
    values: [(pageNum - 1) * size, size, `%${searchTerm}%`, `%${filterTerm}%`],
  };
  const result = await pool.query(query);

  const goals = await Promise.all(result.rows.map(async (row) => {
    // load comments
    const commentsQuery = `
        SELECT *
        FROM comment
        WHERE goal_id = $1;
    `;
    const {rows} = await pool.query(commentsQuery, [row.id]);

    return {
      id: row.id,
      title: row.goal.title,
      recurrence: row.goal.recurrence,
      description: row.goal.description,
      tag: row.goal.tag,
      startdate: row.goal.startdate,
      enddate: row.goal.enddate,
      comments: rows,
      memberCount: row.goal.memberCount,
    };
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
    const result = rows.map((row) => ({
      id: row.id,
      title: row.goal.title,
      recurrence: row.goal.recurrence,
      description: row.goal.description,
      startdate: row.goal.startdate,
      enddate: row.goal.enddate,
      memberCount: row.goal.memberCount,
    }));
    res.status(200).json(result[0]);
  }
};

exports.deleteGoal = async (req, res) => {
  const goalId = req.params.id;
  const user = req.user;

  goalData = await db.getGoal(goalId);
  if (goalData == null) {
    return res.status(404).send();
  }

  if (goalData.author != user.id) {
    return res.status(401).send();
  }
  db.deleteGoal(goalId);
  res.status(200).send();
};

exports.joinGoal = async (req, res) => {
  const user = req.user;
  const goalId = req.path.split('/')[3];
  if (await db.isMemberInGoal(user.id, goalId) === true) {
    console.log('user alreaady in goal!');
    return res.status(400).json({message: 'User already in goal!'});
  }

  // PLEASE READ!!!!
  // lastchecked must be long to set goal as not completed at the begining
  // its a bit scuffed and disgusting but it works!
  memberGoalData = {
    'member_id': user.id,
    'goal_id': goalId,
    'lastChecked': new Date(1804, 6, 4).toISOString(), 
    'streak': '0',
  };
  await db.joinGoal(memberGoalData);

  res.status(200).json({message: 'Successfully joined goal!'});
};

exports.leaveGoal = async (req, res) => {
  const user = req.user;
  const goalToLeaveId = req.path.split('/')[3];

  const goalData = await db.getGoal(goalToLeaveId);

  if (goalData == null) {
    return res.status(404).send();
  }

  if (goalData.author == user.id) {
    console.log('cannot leave goal as the creator. must delete goal.');
    return res.status(401).send();
  }

  if (await db.isMemberInGoal(user.id, goalToLeaveId) == false) {
    console.log('not in the goal anyway'); // hella professional 🥶🥶🥶🥶🥶
    return res.status(401).send();
  }

  db.leaveGoal(user.id, goalToLeaveId);

  res.status(200).json({'message': 'Successfully left the goal'});
};

exports.getAllCompleted = async (req, res) => {
  const {id} = req.user;
  const goals = await db.getAllCompletedGoals(id);
  res.status(200).json(goals);
};

exports.getAllIncompleted = async (req, res) => {
  const {id} = req.user;
  const goals = await db.getAllIncompletedGoals(id);
  res.status(200).json(goals);
};

exports.completeGoal = async (req, res) => {
  const {id} = req.user;
  const goalId = req.params.goal;
  const completed = await db.completeGoal(id, goalId);
  if (completed) {
    res.status(200).json(completed);
  } else {
    res.status(404).send();
  }
};
