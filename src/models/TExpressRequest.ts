import { Request } from 'express';

export type TExpressRequest<TBody = {}, TQuery = {}> = Request<{}, {}, TBody, TQuery>;
