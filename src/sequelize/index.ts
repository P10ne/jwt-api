import User from './models/User';
import { Sequelize } from 'sequelize-typescript';
import { Container } from '@decorators/di';
import { TConfig } from '../CONFIG';
import { ConfigToken, UserModelToken } from '../InjectionTokens';

const initSequelize = async () => {
    const CONFIG = Container.get<TConfig>(ConfigToken);
    const UserModel = Container.get<typeof User>(UserModelToken);
    const pgSequelize = new Sequelize({
        database: 'board',
        dialect: "sqlite",
        host: "localhost",
        models: [UserModel],
        logging: false,
        ...CONFIG.sequelize
    });
    await pgSequelize.sync({
        ...CONFIG.sequelize.syncOptions
    });
}

export default initSequelize;
