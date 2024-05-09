const express = require('express');
const cors = require('cors');
const yaml = require('js-yaml');
const swaggerUi = require('swagger-ui-express');
const fs = require('fs');
const path = require('path');
const OpenApiValidator = require('express-openapi-validator');
const auth = require('./auth');
const goal = require('./goal.js');
const profile = require('./profile.js');
const jwt = require('jsonwebtoken');

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

app.use(
  OpenApiValidator.middleware({
    apiSpec: apiSpec,
    validateRequests: true,
    validateResponses: true,
  }),
);

app.post('/v0/signup', auth.signup);

app.post('/v0/login', auth.login);

app.post('/v0/goal', goal.createGoal);

app.get('/v0/goal/:id', goal.viewGoal);

app.get('/v0/profile/:id', profile.getUserInfo);

app.get('/v0/goal', goal.getPostsByPageAndSize);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status).json({
    message: err.message,
    errors: err.errors,
    status: err.status,
  });
});

module.exports = app;
