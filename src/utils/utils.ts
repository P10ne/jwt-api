import { Response } from 'express';

export const sendJsonResponse = <T>(res: Response<T>, status: number, content?: T) => {
    res.status(status);
    if (content) {
        res.json(content);
        return;
    }
    res.send();
};

export const sendErrorResponse = (res: Response, status: number, message: string) => {
    res.status(status);
    res.json({
        message
    });
};
