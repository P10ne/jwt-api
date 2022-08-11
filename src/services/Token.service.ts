import { Inject, Injectable } from '@decorators/di';
const jwt = require('jsonwebtoken');
import { User } from '../sequelize/models';
import { ConfigToken } from '../InjectionTokens';
import { TConfig } from '../CONFIG';

type TAccessTokenPayload = {
    userId: User['id'];
}
type TRefreshTokenPayload = {
    userId: User['id'];
    fingerPrint: string;
}

@Injectable()
class TokenService {
    constructor(@Inject(ConfigToken) private CONFIG: TConfig) {}

    generateAccessToken(payload: TAccessTokenPayload): string {
        const options = {
            expiresIn: this.CONFIG.tokens.access.expiresIn
        };
        return jwt.sign({ payload }, this.CONFIG.tokenSecret, options);
    }

    async verifyRefreshToken(token, fingerPrint): Promise<TRefreshTokenPayload> {
        const payload = await this.verify<TRefreshTokenPayload>(token);
        if (payload.fingerPrint === fingerPrint) return payload;
        throw new Error('Fingerprint is not valid');
    }

    async verify<T>(token: string): Promise<T> {
        return new Promise((resolve, reject) => {
            jwt.verify(token, this.CONFIG.tokenSecret, (error, decoded) => {
                if (error) reject('Token is not valid');
                resolve(decoded.payload);
            });
        });
    }

    generateRefreshToken(payload: TRefreshTokenPayload): string {
        const options = {
            expiresIn: this.CONFIG.tokens.refresh.expiresIn
        };
        return jwt.sign({ payload }, this.CONFIG.tokenSecret, options);
    }
}

export default TokenService;
