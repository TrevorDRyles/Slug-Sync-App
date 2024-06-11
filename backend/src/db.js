const {Pool} = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
});

/**
 * Handles user signup by inserting a new user into the database.
 *
 * @async
 * @function postSignup
 * @param {Object} data - The user data to be inserted.
 * @param {string} data.name - The name of the user.
 * @param {string} data.email - The email of the user.
 * @param {string} data.password - The password of the user.
 * @return {Promise<Error|void>} Returns an error if the
 * transaction fails, otherwise commits the transaction.
 */
exports.postSignup = async (data) => {
  try {
    await pool.query('BEGIN');
    const insert = `
      INSERT INTO "user"(data)
      VALUES (
        jsonb_build_object(
          'name', $1::text,
          'email', $2::text,
          'password', crypt($3, 'cs'),
          'bio', ''
        )
      )
    `;

    const query = {
      text: insert,
      values: [data.name, data.email, data.password],
    };

    await pool.query(query);
    await pool.query('COMMIT');
  } catch (err) {
    await pool.query('ROLLBACK');
    return err;
  }
};

/**
 * Inserts a new record into the "member_goal" table, linking a user to a goal.
 * @async
 * @function joinGoal
 * @param {Object} data - Data object containing information for the insertion.
 * @param {string} data.member_id - The ID of the user to link to the goal.
 * @param {string} data.goal_id - The ID of the goal to link to the user.
 * @param {Object} data.jsonb - Additional data to be stored in "data"
 * @return {Promise<Object>} - A Promise that resolves.
 */
exports.joinGoal = async (data) => {
  const insert = `
    INSERT INTO user_goal("user_id", "goal_id", "last_checked", "streak")
    VALUES ($1, $2, $3, $4)
  `;
  const query = {
    text: insert,
    values: [data.member_id, data.goal_id, data.lastChecked, data.streak],
  };

  await pool.query(query);

  // increase goal memberCount field by 1
  const updateGoalMemberCountByOne = `
    UPDATE goal
    SET goal = jsonb_set(goal, '{memberCount}', 
        to_jsonb((goal->>'memberCount')::int + 1))
    WHERE id = $1
  `;
  await pool.query(updateGoalMemberCountByOne, [data.goal_id]);
};

/**
 * Retrieves a goal from the database by its ID.
 *
 * @async
 * @function getGoal
 * @param {string} goalId - The ID of the goal to retrieve.
 * @return {Promise<Object|null>} Returns the goal object if found,
 * otherwise returns null.
 */
exports.getGoal = async (goalId) => {
  const goalQuery = {
    text: `
      SELECT * FROM goal WHERE id = $1;
    `,
    values: [goalId],
  };
  const {rows} = await pool.query(goalQuery);
  if (rows.length === 0) {
    return null;
  } else {
    return {id: rows[0].id, ...rows[0].goal};
  }
};

/**
 * Deletes a goal from the database by its ID.
 *
 * @async
 * @function deleteGoal
 * @param {string} goalId - The ID of the goal to delete.
 * @return {Promise<void>} Returns a promise that resolves
 * when the goal is deleted.
 */
exports.deleteGoal = async (goalId) => {
  const deleteGoalQuery = {
    text: `
      DELETE FROM "goal"
      WHERE id = $1
    `,
    values: [goalId],
  };
  await pool.query(deleteGoalQuery);
};

/**
 * Retrieves goal count from the database.
 *
 * @async
 * @function getGoalCount
 * @return {Promise<number>} Returns a promise that
 * resolves to an integer representing the goal count.
 */
exports.getGoalCount = async () => {
  const select = 'SELECT COUNT(*) FROM goal';
  const {rows} = await pool.query(select);
  return parseInt(rows[0].count);
};


/**
 * Retrieves a user from the database by their email and password.
 *
 * @async
 * @function getMemberByPasswordAndEmail
 * @param {string} password - The password of the user.
 * @param {string} email - The email of the user.
 * @return {Promise<Object[]>} Returns a promise that
 * resolves to an array of user objects matching the
 * provided email and password.
 */
exports.getMemberByPasswordAndEmail = async (password, email) => {
  const selectQuery = `SELECT *
  FROM "user"
  where data ->> 'password' = crypt($1, 'cs')
  AND data ->> 'email' = $2`;
  const query = {
    text: selectQuery,
    values: [password, email],
  };

  const result = await pool.query(query);
  return result.rows.map((row) => ({
    id: row.id,
    name: row.data.name,
    email: row.data.email,
    roles: row.data.roles,
    img: row.data.img,
  }));
};

/**
 * Retrieves all completed goals for a specific user from the database.
 *
 * @async
 * @function getAllCompletedGoals
 * @param {string} userId - The ID of the user whose
 * completed goals are to be retrieved.
 * @return {Promise<Object[]>} Returns a promise that
 * resolves to an array of completed goal objects.
 */
exports.getAllCompletedGoals = async (userId) => {
  const select = `SELECT 
    g.id, 
    g.goal->>'title' AS title,
    g.goal->>'description' AS description,
    g.goal->>'recurrence' AS recurrence,
    g.goal->>'tag' AS tag,
    g.goal->>'startdate' AS startDate,
    g.goal ->> 'enddate' AS endDate,
    g.goal->>'memberCount' AS memberCount,
    ug.streak AS streak
  FROM goal g
  LEFT OUTER JOIN user_goal ug ON g.id = ug.goal_id
  LEFT OUTER JOIN "user" u ON u.id = ug.user_id
  WHERE ug.last_checked + (g.goal->>'recurrence')::interval > CURRENT_TIMESTAMP
  AND ug.user_id = $1`;
  const query = {
    text: select,
    values: [userId],
  };
  const {rows} = await pool.query(query);
  return rows.map((row) => ({...row, memberCount: parseInt(row.membercount)}));
};


/**
 * Retrieves all incompleted goals for a specific user from the database.
 *
 * @async
 * @function getAllIncompletedGoals
 * @param {string} userId - The ID of the user whose
 * incompleted goals are to be retrieved.
 * @return {Promise<Object[]>} Returns a promise that
 * resolves to an array of incompleted goal objects.
 */
exports.getAllIncompletedGoals = async (userId) => {
  const select = `SELECT 
    g.id, 
    g.goal->>'title' AS title,
    g.goal->>'description' AS description,
    g.goal->>'recurrence' AS recurrence,
    g.goal->>'tag' AS tag,
    g.goal->>'startdate' AS startDate,
    g.goal ->> 'enddate' AS endDate,
    g.goal->>'memberCount' AS memberCount,
    ug.streak AS streak
  FROM goal g
  LEFT OUTER JOIN user_goal ug ON g.id = ug.goal_id
  LEFT OUTER JOIN "user" u ON u.id = ug.user_id
  WHERE ug.last_checked + (g.goal->>'recurrence')::interval < CURRENT_TIMESTAMP
  AND ug.user_id = $1`;
  const query = {
    text: select,
    values: [userId],
  };
  const {rows} = await pool.query(query);
  return rows.map((row) => ({...row, memberCount: parseInt(row.membercount)}));
};

/**
 * Marks a goal as completed for a specific user in the database.
 *
 * @async
 * @function completeGoal
 * @param {string} userId - The ID of the user completing the goal.
 * @param {string} goalId - The ID of the goal to be marked as completed.
 * @return {Promise<Object>} Returns a promise that resolves to the
 * ID of the completed goal.
 */
exports.completeGoal = async (userId, goalId) => {
  const update = `UPDATE user_goal
  SET last_checked = CURRENT_TIMESTAMP,
  streak = streak + 1
  WHERE user_id = $1
  AND goal_id = $2
  RETURNING goal_id`;

  const query = {
    text: update,
    values: [userId, goalId],
  };
  const {rows} = await pool.query(query);
  return rows[0];
};

/**
 *
 * @async
 * @function isMemberInGoal
 * @param {string} userId - The ID of the user/member to check.
 * @param {string} goalId - The ID of the goal to check.
 * @return {Promise<boolean>}
 */
exports.isMemberInGoal = async (userId, goalId) => {
  const query = {
    text: `
      SELECT EXISTS (
        SELECT 1 FROM "user_goal"
        WHERE user_id = $1 AND goal_id = $2
      )
    `,
    values: [userId, goalId],
  };
  const result = await pool.query(query);
  // console.log(result.rows);
  return result.rows[0].exists;
};

/**
 *
 * @async
 * @function deleteMemberGoalByUserAndGoalId
 * @param {string} userId - The ID of the user/member.
 * @param {string} goalId - The ID of the goal.
 * @return {Promise<Object>}
 */
exports.leaveGoal = async (userId, goalId) => {
  const deleteQuery = {
    text: `
      DELETE FROM "user_goal"
      WHERE user_id = $1 AND goal_id = $2
    `,
    values: [userId, goalId],
  };

  await pool.query(deleteQuery);
};

/**
 * Retrieves user information from the database by user ID.
 *
 * @async
 * @function getUserInformation
 * @param {string} userId - The ID of the user whose information
 * is to be retrieved.
 * @return {Promise<Object>} Returns a promise that resolves to
 * an object containing the user's information (id, name, email, img).
 */
exports.getUserInformation = async (userId) => {
  const select = `SELECT 
    id,
    data->>'name' AS name,
    data->>'email' AS email,
    data->>'img' AS img
  FROM "user"
  WHERE id = $1`;

  const query = {
    text: select,
    values: [userId],
  };
  const {rows} = await pool.query(query);
  return rows[0];
};

/**
 * Retrieves all members associated with a specific goal from the database.
 *
 * @async
 * @function getAllMembersInGoal
 * @param {string} goalId - The ID of the goal to retrieve members for.
 * @return {Promise<Object[]>} Returns a promise that resolves
 * to an array of objects containing member IDs and usernames.
 */
exports.getAllMembersInGoal = async (goalId) => {
  const query = {
    text: `
      SELECT ug.user_id AS "id", u.data->>'name' AS "username"
      FROM "user_goal" ug
      JOIN "user" u ON ug.user_id = u.id
      WHERE ug.goal_id = $1;
    `,
    values: [goalId],
  };
  const {rows} = await pool.query(query);
  return rows;
};
