import { Provider } from '@decorators/di/lib/src/types';

const express = require('express');
const bodyParser = require('body-parser');
import { attachControllers } from '@decorators/express';
import AuthController from './controllers/Auth/Auth.controller';
import { Container } from '@decorators/di';
import initSequelize from './sequelize';

export type TInitAppConfig = {
    providers: Provider[]
}

const initApp = async ({ providers }: TInitAppConfig) => {
    const app = express();
    app.use(bodyParser.json());
    app.use(
        bodyParser.urlencoded({
            extended: true,
        })
    );

    Container.provide(providers);

    await initSequelize();

    const apiRouter = express.Router();
    attachControllers(apiRouter, [
        AuthController
    ]);
    app.use('/api', apiRouter);
    return app;
}
export default initApp;
