import { Column, DataType, Model, Table } from 'sequelize-typescript';
import { IUser } from '../../models';
import { IPublicUser } from '../../models/IUser';

@Table
class User extends Model<IUser, Omit<IUser, 'id'>> implements IUser {
    @Column({
        type: DataType.INTEGER,
        primaryKey: true,
        autoIncrement: true
    })
    id: number;

    @Column({
        type: DataType.STRING,
        unique: true
    })
    email: string;

    @Column({
        type: DataType.STRING
    })
    password: string;

    getPublicUser(): IPublicUser {
        const { id, email } = this.toJSON();
        return {
            id,
            email
        }
    }
}

export default User;
