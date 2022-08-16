import { Inject, Injectable } from '@decorators/di';
const jwt = require('jsonwebtoken');
import { ConfigToken, MessagesToken } from '../InjectionTokens';
import { TConfig } from '../CONFIG';
import { IPublicUser } from '../models/IUser';
import { TMessages } from '../MESSAGES';

export type TAccessTokenPayload = {
    user: IPublicUser;
}
export type TRefreshTokenPayload = {
    user: IPublicUser;
    fingerPrint: string;
}

@Injectable()
class TokenService {
    constructor(
        @Inject(ConfigToken) private CONFIG: TConfig,
        @Inject(MessagesToken) private messages: TMessages
    ) {}

    generateAccessToken(payload: TAccessTokenPayload): string {
        const options = {
            expiresIn: this.CONFIG.tokens.access.expiresIn
        };
        return jwt.sign(payload, this.CONFIG.tokenSecret, options);
    }

    async verifyRefreshToken(token, fingerPrint): Promise<TRefreshTokenPayload> {
        const payload = await this.verify<TRefreshTokenPayload>(token);
        if (payload.fingerPrint === fingerPrint) return payload;
        throw new Error(this.messages.AUTH.FINGERPRINT_IS_WRONG);
    }

    async verify<T>(token: string): Promise<T> {
        return new Promise((resolve, reject) => {
            jwt.verify(token, this.CONFIG.tokenSecret, (error, decoded) => {
                if (error) reject(new Error(this.messages.AUTH.TOKEN_IS_NOT_VALID));
                resolve(decoded);
            });
        });
    }

    generateRefreshToken(payload: TRefreshTokenPayload): string {
        const options = {
            expiresIn: this.CONFIG.tokens.refresh.expiresIn
        };
        return jwt.sign(payload, this.CONFIG.tokenSecret, options);
    }
}

export default TokenService;
