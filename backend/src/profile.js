const {Pool} = require('pg');

const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: process.env.POSTGRES_DB,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
  });


  exports.getUserInfo = async (req, res) => {
    const memberEmail = req.params.email;
    try {
      const memberId = await pool.query('SELECT id FROM users WHERE email = $1', [memberEmail]);
      

      const userInfoQuery = `
        SELECT data->>'name' AS name, data->>'bio' AS bio
        FROM "user"
        WHERE id = $1
      `;
      const userInfoResult = await pool.query(userInfoQuery, [memberId]);
      const userInfo = userInfoResult.rows[0];

      const topGoalsQuery = `
        SELECT *
        FROM member_goal mg
        JOIN "user" u ON mg.user_id = u.id
        WHERE u.id = $1
        ORDER BY (mg.data->>'streak')::int DESC
        LIMIT 3
      `;
      const topGoalsResult = await pool.query(topGoalsQuery, [memberId]);
      const topThreeGoals = topGoalsResult.rows;
  
      res.status(200).json({ userInfo, topThreeGoals });
    } catch (err) {
      console.error('Error retrieving user profile:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

exports.updateBio = async (userId, bio) => {
  try {
    const updateQuery = `
      UPDATE "user"
      SET data = jsonb_set(data, '{bio}', $1::jsonb)
      WHERE id = $2
    `;

    const query = {
      text: updateQuery,
      values: [bio, userId],
    };

    await pool.query(query);
    return true;
  } catch (err) {
    return false;
  }
};
  

