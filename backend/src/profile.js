const {Pool} = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
});

exports.getUserInfo = async (req, res) => {
  const memberId = req.params.id;

  const userInfoQuery = `
      SELECT id,
             data ->> 'name' AS name,
             data ->> 'bio'  AS bio,
             data ->> 'img'  AS img
      FROM "user"
      WHERE id = $1
  `;
  const userInfoResult = await pool.query(userInfoQuery, [memberId]);
  const userInfo = userInfoResult.rows[0];

  const topGoalsQuery = `
      SELECT user_id, goal_id, streak
      FROM user_goal
      WHERE user_id = $1
      ORDER BY streak::int DESC
      LIMIT 3
  `;

  const topGoalsResult = await pool.query(topGoalsQuery, [memberId]);
  const topGoals = topGoalsResult.rows;

  const topGoalsInfo = [];

  for (const goal of topGoals) {
    const goalInfoQuery = `
        SELECT *
        FROM goal
        WHERE id = $1
    `;
    const goalInfoResult = await pool.query(goalInfoQuery, [goal.goal_id]);
    const goalInfo = goalInfoResult.rows[0];
    topGoalsInfo.push({
      id: goal.goal_id,
      title: goalInfo.goal.title,
      description: goalInfo.goal.description,
      recurrence: goalInfo.goal.recurrence,
      startdate: goalInfo.goal.startdate,
      enddate: goalInfo.goal.enddate,
      streak: goal.streak,
    });
  }
  res.status(200).json({
    id: userInfo.id, name: userInfo.name,
    bio: userInfo.bio, img: userInfo.img, topGoals: topGoalsInfo,
  });
};

exports.editProfile = async (req, res) => {
  const userId = req.params.id;
  const {name, bio} = req.body;

  const updateQuery = `
      UPDATE "user"
      SET data = jsonb_set(jsonb_set(data, '{name}', $1::jsonb),
                           '{bio}', $2::jsonb)
      WHERE id = $3
  `;

  const query = {
    text: updateQuery,
    values: [JSON.stringify(name), JSON.stringify(bio), userId],
  };

  await pool.query(query);
  res.status(200).json({id: userId, name: name, bio: bio});
};
