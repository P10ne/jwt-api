import { Express } from 'express';
const { hashSync } = require('bcrypt');
const jwt = require('jsonwebtoken');
import { Container } from '@decorators/di';
import { ConfigToken, MessagesToken, UserModelToken } from '../../../src/InjectionTokens';
import { TConfig } from '../../../src/CONFIG';
const request = require('supertest');
import { User } from '../../../src/sequelize/models';
import { IUser } from '../../../src/models';
import { getInitializedApp, verifyToken } from '../utils';
import { TAccessTokenPayload, TRefreshTokenPayload } from '../../../src/services/Token.service';
import { errorResponse } from '../../utils';
import { TMessages } from '../../../src/MESSAGES';

describe('E2E API testing', () => {
    let MOCK_USERS: (IUser & { fingerPrint: string })[] = [];
    let app: Express;
    let config: TConfig;
    let messages: TMessages;

    const testLoginOnInvalidInput = async (email: string, password: string, fingerPrint: string) => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({ email, password, fingerPrint })
        expect(response.status).toBe(403);
        expect(response.body).toEqual(errorResponse(messages.AUTH.INPUT_IS_INCORRECT));
    }

    const testToken = async (token: string, secret: string, expiresIn: number, payload: any) => {
        const accessTokenVerifyResult = await verifyToken<TAccessTokenPayload>(token, secret);
        expect(accessTokenVerifyResult).not.toBe(null); // token is valid
        expect(accessTokenVerifyResult).toEqual(payload);
        expect(accessTokenVerifyResult.iat).toBe(Math.floor(Date.now() / 1000));
        expect(accessTokenVerifyResult.exp).toBe(Math.floor(Date.now() / 1000) + expiresIn);
    }

    const generateRefreshToken = (payload: TRefreshTokenPayload) => {
        const options = {
            expiresIn: config.tokens.refresh.expiresIn
        };
        return jwt.sign(payload, config.tokenSecret, options);
    }

    beforeAll(async () => {
        MOCK_USERS = [
            {id: 1, email: 'test1@test.test', password: 'password1', fingerPrint: 'fingerPrint1'},
            {id: 2, email: 'test2@test.test', password: 'password2', fingerPrint: 'fingerPrint2'}
        ];
        app = await getInitializedApp();

        config = Container.get<TConfig>(ConfigToken);
        messages = Container.get<TMessages>(MessagesToken);
        const UserModel = Container.get<typeof User>(UserModelToken);
        for (let { email, password } of MOCK_USERS) { // insert test users into db
            UserModel.create({
                email,
                password: hashSync(password, 10)
            });
        }
    })

    describe('/Auth', () => {
        describe('/login', () => {
            it('should return valid tokens with user data in payload on correct input', async () => {
                const { id, email, password, fingerPrint } = MOCK_USERS[0];
                jest.useFakeTimers();
                const response = await request(app)
                    .post('/api/auth/login')
                    .send({ email, password, fingerPrint });
                expect(response.status).toBe(200);
                const { accessToken, refreshToken } = response.body;

                await testToken(accessToken, config.tokenSecret, config.tokens.access.expiresIn, {
                    iat: expect.any(Number),
                    exp: expect.any(Number),
                    user: { id, email }
                });

                await testToken(refreshToken, config.tokenSecret, config.tokens.refresh.expiresIn, {
                    iat: expect.any(Number),
                    exp: expect.any(Number),
                    user: { id, email },
                    fingerPrint: expect.any(String)
                });
                jest.useRealTimers();
            })

            it('should return 401 answer with error message on wrong email', async () => {
                const { email, password } = MOCK_USERS[0];
                await testLoginOnInvalidInput(`wr${email}ong`, password, 'someFingerPrint');
            })

            it('should return 401 answer with error message on wrong password', async () => {
                const { email, password } = MOCK_USERS[0];
                await testLoginOnInvalidInput(email, `wr${password}ong`, 'someFingerPrint');
            })
        })

        describe('/refresh', () => {
            it('should return valid tokens with user data in payload on valid refresh token and fingerPrint', async () => {
                jest.useFakeTimers();
                const { id, email, fingerPrint } = MOCK_USERS[0];
                const generatedRefreshToken = generateRefreshToken({
                    user: { id, email },
                    fingerPrint
                });
                const response = await request(app)
                    .post('/api/auth/refresh')
                    .send({ refreshToken: generatedRefreshToken, fingerPrint });
                expect(response.status).toBe(200);
                const { accessToken, refreshToken } = response.body;

                await testToken(accessToken, config.tokenSecret, config.tokens.access.expiresIn, {
                    iat: expect.any(Number),
                    exp: expect.any(Number),
                    user: { id, email }
                });

                await testToken(refreshToken, config.tokenSecret, config.tokens.refresh.expiresIn, {
                    iat: expect.any(Number),
                    exp: expect.any(Number),
                    user: { id, email },
                    fingerPrint: expect.any(String)
                });
                jest.useRealTimers();
            })

            it('should return 401 answer with error message on invalid fingerPrint', async () => {
                jest.useFakeTimers();
                const { id, email, fingerPrint } = MOCK_USERS[0];
                const generatedRefreshToken = generateRefreshToken({
                    user: { id, email },
                    fingerPrint
                });

                const response = await request(app)
                    .post('/api/auth/refresh')
                    .send({ refreshToken: generatedRefreshToken, fingerPrint: 'someAnotherFingerPrint' });
                expect(response.status).toBe(401);
                expect(response.body).toEqual(errorResponse(messages.AUTH.FINGERPRINT_IS_WRONG));
                jest.useRealTimers();
            })

            it('should return 401 answer with error message on expired refresh token', async () => {
                jest.useFakeTimers();
                const { id, email, fingerPrint } = MOCK_USERS[0];
                const generatedRefreshToken = generateRefreshToken({
                    user: { id, email },
                    fingerPrint
                });

                jest.advanceTimersByTime(config.tokens.refresh.expiresIn * 1000 + 1);
                const response = await request(app)
                    .post('/api/auth/refresh')
                    .send({ refreshToken: generatedRefreshToken, fingerPrint });
                expect(response.status).toBe(401);
                expect(response.body).toEqual(errorResponse(messages.AUTH.TOKEN_IS_NOT_VALID));
                jest.useRealTimers();
            })
        })

        describe('/logout', () => {
            it('response should be successful', async () => {
                const response = await request(app)
                    .post('/api/auth/logout')
                expect(response.status).toBe(200);
            })
        })
    })
});
