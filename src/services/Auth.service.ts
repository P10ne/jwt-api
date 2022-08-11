const { compareSync } = require('bcrypt');
import { Inject, Injectable } from '@decorators/di';
import { User } from '../sequelize/models';
import UsersService from './Users.service';

@Injectable()
class AuthService {
    constructor(
        @Inject(UsersService) private usersService: UsersService
    ) {}

    async authenticate(email: User['email'], password: string): Promise<User | null> {
        const user = await this.usersService.getUserByEmail(email);
        return user && compareSync(password, user.password)
            ? user
            : null;
    }

}

export default AuthService;
