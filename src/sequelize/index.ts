import User from './models/User';
import { Sequelize } from 'sequelize-typescript';
import { Container } from '@decorators/di';
import { TConfig } from '../CONFIG';
import { ConfigToken, UserModelToken } from '../InjectionTokens';

const initSequelize = () => {
    const CONFIG = Container.get<TConfig>(ConfigToken);
    const UserModel = Container.get<typeof User>(UserModelToken);
    const pgSequelize = new Sequelize({
        database: 'board',
        dialect: "sqlite",
        host: "localhost",
        models: [UserModel],
        ...CONFIG.sequelize
    });
    pgSequelize.sync();
}

export default initSequelize;
