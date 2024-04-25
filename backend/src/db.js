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
