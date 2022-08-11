export interface IPublicUserFields {
    id: number;
    email: string;
}

export interface IPrivateUserFields {
    password: string;
}

export interface IUser extends IPublicUserFields, IPrivateUserFields {}
export interface IPublicUser extends IPublicUserFields {}
