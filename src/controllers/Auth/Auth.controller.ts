import { Controller, Post } from '@decorators/express';
import { Inject } from '@decorators/di';
import { sendJsonResponse, sendErrorResponse } from '../../utils/utils';
import { AuthService, TokenService, UsersService } from '../../services';
import { IPublicUser, IUser } from '../../models/IUser';
import { TExpressRequest, TExpressResponse } from '../../models';

type TLoginRequestBody = {
    email: string;
    password: string;
    fingerPrint: string;
}
type TLoginResponseBody = {
    accessToken: string;
    refreshToken: string;
    user: IPublicUser;
}

type TRefreshRequestBody = {
    refreshToken: string;
    fingerPrint: string;
}
type TRefreshResponseBody = {
    accessToken: string;
    refreshToken: string;
}

type TRegRequestBody = Partial<IUser>;
type TRegResponseBody = IPublicUser;

@Controller('/auth')
class AuthController {
    constructor(
        @Inject(AuthService) private authService: AuthService,
        @Inject(UsersService) private usersService: UsersService,
        @Inject(TokenService) private tokenService: TokenService
    ) {}

    @Post('/login')
    async login(req: TExpressRequest<TLoginRequestBody>, res: TExpressResponse<TLoginResponseBody>) {
        const { email, password, fingerPrint } = req.body;
        const user = await this.authService.authenticate(email, password);
        if (!user) {
            sendErrorResponse(res, 403, 'Неверный логин или пароль');
            return;
        }
        const accessToken = this.tokenService.generateAccessToken({ userId: user.id });
        const refreshToken = this.tokenService.generateRefreshToken({
            userId: user.id,
            fingerPrint: fingerPrint
        });
        sendJsonResponse(res, 200, {
            accessToken,
            refreshToken,
            user: user.getPublicUser()
        });
    }

    @Post('/logout')
    async logout(req: TExpressRequest, res: TExpressResponse) {
        sendJsonResponse(res, 200);
    }

    @Post('/refresh')
    async refreshToken(req: TExpressRequest<TRefreshRequestBody>, res: TExpressResponse<TRefreshResponseBody>) {
        const {refreshToken, fingerPrint} = req.body;
        try {
            const { userId } = await this.tokenService.verifyRefreshToken(refreshToken, fingerPrint);
            const newAccessToken = this.tokenService.generateAccessToken({ userId });
            const newRefreshToken = this.tokenService.generateRefreshToken({ userId, fingerPrint });
            sendJsonResponse(res, 200,
            {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken
            });
        } catch (e) {
            sendErrorResponse(res, 401, e.message);
        }
    }

    @Post('/reg')
    async reg(req: TExpressRequest<TRegRequestBody>, res: TExpressResponse<TRegResponseBody>) {
        const { email, password } = req.body;
        if (!email || !password) {
            sendErrorResponse(res, 400, 'Email or password are empty');
            return;
        }
        try {
            const user = await this.usersService.add(req.body);
            sendJsonResponse(res, 200, user.getPublicUser());
        } catch {
            sendErrorResponse(res, 400, 'Error');
        }
    }
}

export default AuthController;
