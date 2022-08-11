const express = require('express');
const bodyParser = require('body-parser');
import { attachControllers } from '@decorators/express';
import AuthController from './controllers/Auth/Auth.controller';
import { Container } from '@decorators/di';
import { User } from './sequelize/models';
import { ConfigToken, UserModelToken } from './InjectionTokens';
import CONFIG from './CONFIG';
import initSequelize from './sequelize';

const app = express();
app.use(bodyParser.json());
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);

Container.provide([
    { provide: ConfigToken, useValue: CONFIG },
    { provide: UserModelToken, useValue: User }
]);

initSequelize();

const apiRouter = express.Router();
attachControllers(apiRouter, [
    AuthController
]);
app.use('/api', apiRouter);

app.listen(3000, () => {
    console.log('app');
});
