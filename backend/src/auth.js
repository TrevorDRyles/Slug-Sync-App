const jwt = require('jsonwebtoken');
const db = require('./db');

/**
 * Handles user login, validates credentials, and returns a
 * JWT token if successful.
 *
 * @async
 * @function login
 * @param {Object} req - The request object.
 * @param {Object} req.body - The body of the request.
 * @param {string} req.body.email - The email of the user.
 * @param {string} req.body.password - The password of the user.
 * @param {Object} res - The response object.
 * @return {Promise<void>} Sends a response with a JWT token if credentials are
 * valid, otherwise sends an error message.
 */
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
  res.status(200).json({
    token: accessToken,
    id: user.id, name: user.name,
    img: user.img,
  });
};

/**
 * Handles user signup by adding a new user to the database.
 *
 * @async
 * @function signup
 * @param {Object} req - The request object.
 * @param {Object} req.body - The body of the request containing signup details.
 * @param {Object} res - The response object.
 * @return {Promise<void>} Sends a response with status
 * 201 if signup is successful, otherwise sends a response with status 403.
 */
exports.signup = async (req, res) => {
  const err = await db.postSignup(req.body);
  err ? res.status(403).send() : res.status(201).send();
};

/**
 * Middleware to check the authorization token in the request headers.
 *
 * @function check
 * @param {Object} req - The request object.
 * @param {Object} req.headers - The headers of the request.
 * @param {string} req.headers.authorization - The authorization header
 * containing the token.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function to be called if
 * the token is valid.
 * @return {void} Sends a 403 status if the token is invalid,
 * a 401 status if the token is missing, or proceeds to
 * the next middleware if the token is valid.
 */
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
    res.status(401).send();
  }
};

