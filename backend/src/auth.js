const jwt = require('jsonwebtoken');
const db = require('./db');

// referenced from cse 186 code trevor ryles
exports.login = async (req, res) => {
  const {email, password} = req.body;
  const users = await db.getMemberByPasswordAndEmail(
    password, email);
  if (users.length === 0) {
    return res.status(401).send('Invalid credentials');
  }
  const user = users[0];
  const accessToken = jwt.sign(
    {id: user.id, email: user.email, name: user.name, roles: user.roles},
    `${process.env.MASTER_SECRET}`, {
      expiresIn: '30m',
      algorithm: 'HS256',
    },
  );
  res.status(200).json({token: accessToken, name: user.name});
};


exports.signup = async (req, res) => {
  const err = await db.postSignup(req.body);
  err ? res.status(403).send() : res.status(201).send();
};

// check endpoint referenced from authenticated books example
// exports.check = (req, res, next) => {
//   const authHeader = req.headers.authorization;
//   if (authHeader) {
//     const token = authHeader.split(' ')[1];
//     jwt.verify(token, process.env.MASTER_SECRET, (err, user) => {
//       if (err) {
//         return res.sendStatus(403);
//       }
//       req.user = user;
//       next();
//     });
//   } else {
//     res.sendStatus(401);
//   }
// };

// exports.getAllUsers = async (req, res) => {
//   const query = `
//       SELECT id, "user"->>'name' AS name FROM "user";
//   `;
//   const result = await pool.query(query, []);
//   res.status(200).json(result.rows);
// };

