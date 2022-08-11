const CONFIG = {
    tokenSecret: 'SECRET_KEY',
    tokens: {
        access: {
            expiresIn: 15 * 60
        },
        refresh: {
            expiresIn: 30 * 24 * 60 * 60
        }
    },
    sequelize: {
        storage: 'src/db/db.db'
    }
};

export type TConfig = typeof CONFIG;

export default CONFIG;
