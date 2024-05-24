const {Pool} = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
});

exports.postSignup = async (data) => {
  try {
    await pool.query('BEGIN');
    const insert = `
      INSERT INTO "user"(data)
      VALUES (
        jsonb_build_object(
          'name', $1::text,
          'email', $2::text,
          'password', crypt($3, 'cs')
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
    INSERT INTO "user_goal"("user_id", "goal_id", "last_checked", "streak")
    VALUES ($1, $2, $3, $4)
  `;
  const query = {
    text: insert,
    values: [data.member_id, data.goal_id, data.lastChecked, data.streak],
  };

  await pool.query(query);
};

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

// referenced from cse 186 code trevor ryles
// exports.selectAllUsers = async () => {
//   const select = 'SELECT * FROM "user"';
//   const query = {
//     text: select,
//   };
//   const {rows} = await pool.query(query);
//   return rows;
// };

// referenced from cse 186 code trevor ryles
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
    avatarURL: row.data.avatarURL,
  }));
};

exports.getAllCompletedGoals = async (userId) => {
  const select = `SELECT 
    g.id, 
    g.goal->>'title' AS title,
    g.goal->>'description' AS description,
    g.goal->>'recurrence' AS recurrence,
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
  return rows;
};

exports.getAllIncompletedGoals = async (userId) => {
  const select = `SELECT 
    g.id, 
    g.goal->>'title' AS title,
    g.goal->>'description' AS description,
    g.goal->>'recurrence' AS recurrence,
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
  return rows;
};

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
  console.log(result.rows);
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
