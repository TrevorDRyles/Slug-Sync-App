const express = require('express');
const cors = require('cors');
const yaml = require('js-yaml');
const swaggerUi = require('swagger-ui-express');
const fs = require('fs');
const path = require('path');
const OpenApiValidator = require('express-openapi-validator');
const auth = require('./auth');
const goal = require('./goal.js');
const user = require('./user.js');
const comment = require('./comment.js');
const profile = require('./profile.js');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: false}));

const apiSpec = path.join(__dirname, '../api/openapi.yaml');
const apidoc = yaml.load(fs.readFileSync(apiSpec, 'utf8'));

app.use(
  '/v0/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(apidoc),
);

app.get('/v0/user', auth.check, user.getUserInformation);

app.use(
  OpenApiValidator.middleware({
    apiSpec: apiSpec,
    validateRequests: true,
    validateResponses: true,
  }),
);

app.post('/v0/signup', auth.signup);

app.post('/v0/login', auth.login);

app.post('/v0/goal', auth.check, goal.createGoal);

app.post('/v0/goal/:id/join', auth.check, goal.joinGoal);

app.get('/v0/goal/completed', auth.check, goal.getAllCompleted);

app.get('/v0/goal/incompleted', auth.check, goal.getAllIncompleted);

app.get('/v0/goal/:id', auth.check, goal.viewGoal);

app.get('/v0/profile/:id', profile.getUserInfo);

app.post('/v0/profile/:id', profile.editProfile);

app.post('/v0/goal/:id/comment', auth.check, comment.addCommentToGoal);

app.get('/v0/goal/:id/comment', auth.check, comment.getAllCommentsOnGoal);

app.get('/v0/goal/:id/members', auth.check, goal.getAllMembersInGoal);

app.get('/v0/user/:id', auth.check, user.getUserById);

app.delete('/v0/goal/:id', auth.check, goal.deleteGoal);

app.post('/v0/goal/:id/leave', auth.check, goal.leaveGoal);

app.get('/v0/goal', auth.check, goal.getPostsByPageAndSize);

app.put('/v0/complete/:goal', auth.check, goal.completeGoal);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status).json({
    message: err.message,
    errors: err.errors,
    status: err.status,
  });
});

module.exports = app;
