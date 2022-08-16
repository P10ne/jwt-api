import { Express } from 'express';
import initApp from '../../src/app';
import { ConfigToken, MessagesToken, UserModelToken } from '../../src/InjectionTokens';
import CONFIG, { TConfig } from '../../src/CONFIG';
import { Provider } from '@decorators/di/lib/src/types';
import * as path from 'path';
import { User } from '../../src/sequelize/models';
import MESSAGES from '../../src/MESSAGES';
const jwt = require('jsonwebtoken');

let app: Express;
const TEST_CONFIG: TConfig = {
    ...CONFIG,
    sequelize: {
        ...CONFIG.sequelize,
        storage: path.resolve(__dirname) + './db.test.db',
        syncOptions: { force: true }
    }
}

const TEST_PROVIDERS: Provider[] = [
    { provide: ConfigToken, useValue: TEST_CONFIG },
    { provide: MessagesToken, useValue: MESSAGES },
    { provide: UserModelToken, useValue: User }
]

export const getInitializedApp = async () => {
    if (!app) {
        app = await initApp({
            providers: TEST_PROVIDERS
        });
    }
    return app;
}

type TAdditionalTokenPayload<T> = {
    iat: number;
    exp: number;
    payload: T;
}


export const verifyToken: <T>(token: string, secret: string) => Promise<TAdditionalTokenPayload<T> | null> = async <T>(token: string, secret: string) => {
    return new Promise(resolve => {
        jwt.verify(token, secret, { complete: true }, (error, decoded) => {
            if (error) resolve(null);
            resolve(decoded.payload);
        });
    })
}
