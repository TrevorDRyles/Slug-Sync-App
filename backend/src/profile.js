const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
});

exports.getUserInfo = async (req, res) => {
  console.log('inside user info:' + req.params.id);
  const memberId = req.params.id;

  try {
    const userInfoQuery = `
      SELECT id, data->>'name' AS name, data->>'bio' AS bio
      FROM "user"
      WHERE id = $1
    `;
    const userInfoResult = await pool.query(userInfoQuery, [memberId]);
    const userInfo = userInfoResult.rows[0];

    const topGoalsQuery = `
      SELECT mg.member_id AS id, mg.goal_id, mg.data->>'streak' AS streak
      FROM member_goal mg
      JOIN "user" u ON mg.member_id = u.id
      WHERE u.id = $1
      ORDER BY (mg.data->>'streak')::int DESC
      LIMIT 3
    `;

    const topGoalsResult = await pool.query(topGoalsQuery, [memberId]);
    const topGoals = topGoalsResult.rows;
    
    console.log("user info" + JSON.stringify(userInfo, null, 2));
    console.log("topgoals" + JSON.stringify(topGoals, null, 2));

    const topGoalsInfo = [];

    for (const goal of topGoals) {
      const goalInfoQuery = `
        SELECT *
        FROM goal
        WHERE id = $1
      `;
      const goalInfoResult = await pool.query(goalInfoQuery, [goal.goal_id]);
      const goalInfo = goalInfoResult.rows[0];

      console.log("Goal Info for Goal ID " + goal.goal_id + ":", goalInfo);

      topGoalsInfo.push({
        goal_id: goal.goal_id,
        title: goalInfo.goal.title,
        description: goalInfo.goal.description,
        recurrence: goalInfo.goal.recurrence,
      });
    }
    console.log("topgoalsinfo" + JSON.stringify(topGoalsInfo, null, 2));
    res.status(200).json({ id: userInfo.id, name: userInfo.name, bio: userInfo.bio, topGoals: topGoalsInfo });
  } catch (err) {
    console.error('Error retrieving user profile:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.editProfile = async (req, res) => {
  const userId = req.params.id;
  const { name, bio } = req.body;

  try {
    const updateQuery = `
      UPDATE "user"
      SET data = jsonb_set(jsonb_set(data, '{name}', $1::jsonb), '{bio}', $2::jsonb)
      WHERE id = $3
    `;

    const query = {
      text: updateQuery,
      values: [JSON.stringify(name), JSON.stringify(bio), userId],
    };

    await pool.query(query);
    res.status(200).json({ id: userId, name: name, bio: bio});
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};