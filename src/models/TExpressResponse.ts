import { Response } from 'express';

export type TExpressErrorResponse = { message: string };

export type TExpressResponse<T = void> = Response<T | TExpressErrorResponse>;
