const jwt = require('jsonwebtoken');
const {Pool} = require('pg');
const db = require('./db');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
});

// referenced from cse 186 code trevor ryles
exports.login = async (req, res) => {
  const {email, password} = req.body;
  const users = await db.getMemberByPasswordAndEmail(
    password, email);
  if (users.length === 0) {
    return res.status(401).send('Invalid credentials');
  }
  const user = users[0];
  if (user) {
    const accessToken = jwt.sign(
      {email: user.email, name: user.name, roles: user.roles},
      `${process.env.MASTER_SECRET}`, {
        expiresIn: '30m',
        algorithm: 'HS256',
      },
    );
    res.status(200).json({token: accessToken});
  }
};


exports.signup = async (req, res) => {
  const err = await db.postSignup(req.body);
  err ? res.status(403).send() : res.status(201).send();
};

// check endpoint referenced from authenticated books example
// TODO refactor handlers db access into the db module
exports.check = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.MASTER_SECRET, (err, user) => {
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

