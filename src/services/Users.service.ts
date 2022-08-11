const { hashSync } = require('bcrypt');
import { Inject, Injectable } from '@decorators/di';
import { User } from '../sequelize/models';
import { UserModelToken } from '../InjectionTokens';
import { IUser } from '../models';

@Injectable()
class UsersService {
    constructor(
        @Inject(UserModelToken) private userModel: typeof User
    ) {}

    async getUserByEmail(email: User['email']): Promise<User | null> {
        return await this.userModel.findOne({
            where: { email }
        })
    }

    async add(data: Partial<IUser>): Promise<User> {
        const userDataToAdd: Partial<IUser> = {
            ...data,
            password: hashSync(data.password, 10)
        }
        return await this.userModel.create(userDataToAdd);
    }
}

export default UsersService;
