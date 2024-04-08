const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const userdb = require('./userdb');
const secrets = require('../api/data/secrets');
const {Pool} = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
});

// login endpoint referenced from authenticated books example
exports.login = async (req, res) => {
  const {email, password} = req.body;
  const users = await userdb.selectAllUsers();
  const user = users.find((user) => {
    return user.user.email === email &&
            bcrypt.compareSync(password, user.user.password);
  });
  if (user) {
    const accessToken = jwt.sign(
      {email: user.user.email},
      secrets.accessToken, {
        expiresIn: '30m',
        algorithm: 'HS256',
      });
    res.status(200).json({id: user.id, email: user.user.email,
      accessToken: accessToken, name: user.user.name});
  } else {
    res.status(401).send('Invalid credentials');
  }
};

// check endpoint referenced from authenticated books example
exports.check = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    jwt.verify(token, secrets.accessToken, (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }
      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
};

exports.getAllUsers = async (req, res) => {
  const query = `
      SELECT id, "user"->>'name' AS name FROM "user";
  `;
  const result = await pool.query(query, []);
  res.status(200).json(result.rows);
};

