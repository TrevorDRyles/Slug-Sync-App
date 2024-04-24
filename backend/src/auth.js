const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const secrets = require('../api/data/secrets');
const {Pool} = require('pg');
const db = require('./db')

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
  const users = await db.selectAllUsers();
  let user = false;
  console.log("Printing all users:\n", users);
  for (let i=0; i< users.length; i++){
    if (users[i]["email"] === email) {
      const passwordMatch = bcrypt.compareSync(password, users[i]["password"]);
      if (!passwordMatch){
        user = {
          "id" : users[i]["id"],
          "name" : users[i]["name"],
          "email" : users[i]["email"],
        }
      }
    }
  }

  if (user) {
    const accessToken = jwt.sign(
      user,
      secrets.accessToken, {
        expiresIn: '30m',
        algorithm: 'HS256',
      });
    res.status(200).json({token: accessToken});
  } else {
    res.status(401).send('Invalid credentials');
  }
};

exports.signup = async(req, res) => {
  // const {name, email, password} = req.body
  // console.log(req.body)
  // const data = {
  //   name: name,
  //   email: email,
  //   password: password
  // }
  // console.log(data)
  await db.postSignup(req.body)
  res.status(201).send();
}

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

