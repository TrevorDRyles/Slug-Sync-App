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
 * Creates a new goal in the database based on the provided request body.
 *
 * @async
 * @function createGoal
 * @param {Object} req - The request object.
 * @param {Object} req.body - The body of the request containing the
 * details of the goal to be created.
 * @param {Object} req.user - The authenticated user object.
 * @param {string} req.user.id - The ID of the authenticated user
 * who creates the goal.
 * @param {Object} res - The response object.
 * @return {Promise<void>} Returns a promise that resolves
 * when the goal is successfully created.
 */
exports.createGoal = async (req, res) => {
  const goal = req.body;
  const user = req.user;
  goal.author = user['id'];
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

/**
 * Retrieves goals based on page number, size, search term, and tag
 * filter from the database.
 *
 * @async
 * @function getGoalsByPageAndSize
 * @param {Object} req - The request object.
 * @param {Object} req.query - The query parameters from the request.
 * @param {number} req.query.page - The page number of the posts to retrieve.
 * @param {string} req.query.search - The search term to filter posts
 * by title (optional).
 * @param {string} req.query.tag - The tag term to filter posts
 * by tag (optional).
 * @param {number} req.query.size - The number of posts per
 * page (optional, default is 20).
 * @param {Object} res - The response object.
 * @return {Promise<void>} Returns a promise that resolves when
 * the posts are retrieved and sent in the response.
 */
exports.getGoalsByPageAndSize = async function(req, res) {
  let pageNum = req.query.page;
  let searchTerm = sanitize(req.query.search);
  if (searchTerm === undefined) {
    searchTerm = '%';
  }

  let filterTerm = sanitize(req.query.tag);
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

/**
 * Retrieves details of a specific goal from the database and
 * sends it in the response.
 *
 * @async
 * @function viewGoal
 * @param {Object} req - The request object.
 * @param {string} req.params.id - The ID of the goal to be viewed.
 * @param {Object} res - The response object.
 * @return {Promise<void>} Returns a promise that resolves
 * when the goal details are retrieved and sent in the response.
 */
exports.viewGoal = async (req, res) => {
  const goalId = req.params.id;
  const query = `
      SELECT *
      FROM goal g
               LEFT OUTER JOIN user_goal ug
                               ON g.id = ug.goal_id
      WHERE ug.goal_id = $1
        AND g.id = $1;
  `;
  const {rows} = await pool.query(query, [goalId]);
  if (rows.length === 0) {
    res.status(404).send();
  } else {
    let result;
    const rowWithLoggedInUserId =
      rows.find((row) => row.user_id === req.user.id);
    // if there's a row that has the logged in user id
    if (rowWithLoggedInUserId) {
      // then get that record's streak
      result = {
        id: rowWithLoggedInUserId.id,
        title: rowWithLoggedInUserId.goal.title,
        recurrence: rowWithLoggedInUserId.goal.recurrence,
        description: rowWithLoggedInUserId.goal.description,
        startdate: rowWithLoggedInUserId.goal.startdate,
        enddate: rowWithLoggedInUserId.goal.enddate,
        memberCount: rowWithLoggedInUserId.goal.memberCount,
        streak: rowWithLoggedInUserId.streak,
      };
      res.status(200).json(result);
      return;
    }
    // otherwise streak is 0
    result = rows.map((row) => {
      return {
        id: row.id,
        title: row.goal.title,
        recurrence: row.goal.recurrence,
        description: row.goal.description,
        startdate: row.goal.startdate,
        enddate: row.goal.enddate,
        memberCount: row.goal.memberCount,
        streak: 0,
      };
    });
    res.status(200).json(result[0]);
  }
};

/**
 * Deletes a goal from the database if the authenticated user
 * is the author of the goal.
 *
 * @async
 * @function deleteGoal
 * @param {Object} req - The request object.
 * @param {string} req.params.id - The ID of the goal to be deleted.
 * @param {Object} req.user - The authenticated user object.
 * @param {string} req.user.id - The ID of the authenticated user.
 * @param {Object} res - The response object.
 * @return {Promise<void>} Returns a promise that resolves when
 * the goal is successfully deleted.
 */
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

/**
 * Allows a user to join a goal if they are not already a member.
 *
 * @async
 * @function joinGoal
 * @param {Object} req - The request object.
 * @param {Object} req.user - The authenticated user object.
 * @param {string} req.user.id - The ID of the authenticated user.
 * @param {Object} req.path - The path object from the request.
 * @param {string} req.path.split('/')[3] - The ID of the goal to
 * join extracted from the request path.
 * @param {Object} res - The response object.
 * @return {Promise<void>} Returns a promise that resolves when
 * the user successfully joins the goal.
 */
exports.joinGoal = async (req, res) => {
  const user = req.user;
  const goalId = req.path.split('/')[3];
  if (await db.isMemberInGoal(user.id, goalId) === true) {
    // console.log('user alreaady in goal!');
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

/**
 * Allows a user to leave a goal if they are a member of it.
 *
 * @async
 * @function leaveGoal
 * @param {Object} req - The request object.
 * @param {Object} req.user - The authenticated user object.
 * @param {string} req.user.id - The ID of the authenticated user.
 * @param {Object} req.path - The path object from the request.
 * @param {string} req.path.split('/')[3] - The ID of the goal to
 * leave extracted from the request path.
 * @param {Object} res - The response object.
 * @return {Promise<void>} Returns a promise that resolves when
 * the user successfully leaves the goal.
 */
exports.leaveGoal = async (req, res) => {
  const user = req.user;
  const goalToLeaveId = req.path.split('/')[3];

  const goalData = await db.getGoal(goalToLeaveId);

  if (goalData == null) {
    return res.status(404).send();
  }

  if (goalData.author == user.id) {
    // console.log('cannot leave goal as the creator. must delete goal.');
    return res.status(401).send();
  }

  if (await db.isMemberInGoal(user.id, goalToLeaveId) == false) {
    // console.log('not in the goal anyway'); // hella professional 🥶🥶🥶🥶🥶
    return res.status(401).send();
  }

  db.leaveGoal(user.id, goalToLeaveId);

  res.status(200).json({'message': 'Successfully left the goal'});
};

/**
 * Retrieves all completed goals for the authenticated user from
 * the database and sends them in the response.
 *
 * @async
 * @function getAllCompleted
 * @param {Object} req - The request object.
 * @param {Object} req.user - The authenticated user object.
 * @param {string} req.user.id - The ID of the authenticated user.
 * @param {Object} res - The response object.
 * @return {Promise<void>} Returns a promise that resolves
 * when the completed goals are retrieved and sent in the response.
 */
exports.getAllCompleted = async (req, res) => {
  const {id} = req.user;
  const goals = await db.getAllCompletedGoals(id);
  res.status(200).json(goals);
};

/**
 * Retrieves all incompleted goals for the authenticated user
 * from the database and sends them in the response.
 *
 * @async
 * @function getAllIncompleted
 * @param {Object} req - The request object.
 * @param {Object} req.user - The authenticated user object.
 * @param {string} req.user.id - The ID of the authenticated user.
 * @param {Object} res - The response object.
 * @return {Promise<void>} Returns a promise that resolves
 * when the incompleted goals are retrieved and sent in the response.
 */
exports.getAllIncompleted = async (req, res) => {
  const {id} = req.user;
  const goals = await db.getAllIncompletedGoals(id);
  res.status(200).json(goals);
};

/**
 * Marks a goal as completed for the authenticated user in the database.
 *
 * @async
 * @function completeGoal
 * @param {Object} req - The request object.
 * @param {Object} req.user - The authenticated user object.
 * @param {string} req.user.id - The ID of the authenticated user.
 * @param {Object} req.params - The parameters object from the request.
 * @param {string} req.params.goal - The ID of the goal to mark as completed.
 * @param {Object} res - The response object.
 * @return {Promise<void>} Returns a promise that resolves
 * when the goal is successfully marked as completed, or when an error occurs.
 */
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

/**
 * Gets the total count of goals
 *
 * @async
 * @function getGoalCount
 * @param{Object} req
 * @param{Object} res
 * @return {Promise<void>}
 */
exports.getGoalCount = async (req, res) => {
  const {id} = req.user;
  const goalCount = await db.getGoalCount(id);
  res.status(200).json(goalCount);
};

/**
 * Retrieves all members of a specific goal from the database
 * and sends them in the response.
 *
 * @async
 * @function getAllMembersInGoal
 * @param {Object} req - The request object.
 * @param {Object} req.path - The path object from the request.
 * @param {string} req.path.split('/')[3] - The ID of the goal to
 * get members from extracted from the request path.
 * @param {Object} res - The response object.
 * @return {Promise<void>} Returns a promise that resolves
 * when the members of the goal are retrieved and sent in the response.
 */
exports.getAllMembersInGoal = async (req, res) => {
  const goalId = req.path.split('/')[3];
  const goalMembers = await db.getAllMembersInGoal(goalId);
  // console.log(goalMembers);

  // goofy ahh add the role (admin or member)
  const goalInfo = await db.getGoal(goalId);
  // console.log(goalInfo);
  const goalAuthorID = goalInfo.author;
  // console.log(goalAuthorID);
  for (let i = 0; i < goalMembers.length; i++) {
    if (goalAuthorID == goalMembers[i].id) {
      goalMembers[i].role = 'author';
    } else {
      goalMembers[i].role = 'member';
    }
  }

  res.status(200).json(goalMembers);
};

/**
 * sanitize
 * referenced from github copilot
 * @param{string} input
 * @return {*}
 */
function sanitize(input) {
  if (!input) {
    return input;
  }
  return input.replace(/[^a-z0-9 ]/gi, '');
}
