import initApp from './app';
import { ConfigToken, MessagesToken, UserModelToken } from './InjectionTokens';
import CONFIG from './CONFIG';
import { User } from './sequelize/models';
import MESSAGES from './MESSAGES';

const init = async () => {
    const app = await initApp({
        providers: [
            { provide: MessagesToken, useValue: MESSAGES },
            { provide: ConfigToken, useValue: CONFIG },
            { provide: UserModelToken, useValue: User },
        ]
    });
    app.listen(3001, () => { console.log('app') })
}

init();
