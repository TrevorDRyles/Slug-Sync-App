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

// Returns a user list in the following JSON format:
// users = [{name, email, password, userID}, ...]
exports.selectAllUsers = async (data) => {
  const query = `
    SELECT "id", "data" from "user";
  `
  const result = await pool.query(query)
  const userData = result.rows;

  // todo: there's probably a smarter way to map this?
  const users = []
  for (let i=0; i< userData.length; i++){
    const currentUser = userData[i]["data"];
    currentUser["id"] = userData[i]["id"];
    users.push(userData[i]["data"]);
  }
  return users;
};
