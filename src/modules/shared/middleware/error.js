import CustomError from "../../shared/utils/custom-error.js";
import { log } from "../utils/logger.js";

export default function errorHandler(err, req, res, next) {
    const isCustomError = err instanceof CustomError;

    const status = isCustomError ? err.status : 500;
    const message = isCustomError ? err.message : 'internal_server';
    const fields = isCustomError ? err.fields : undefined;
    const messageOptions = isCustomError ? err.messageOptions : undefined;

    log.error('ERROR: ', {
        message,
        status,
        fields,
        err
    });

    if (!req.isApi && req.method === 'GET') {
        return res
            .status(status)
            .redirect(`/error?status=${status}&message=${message, messageOptions}`);
    }

    res.status(status).json({
        error: {
            code: status,
            message: message, messageOptions,
            fields: fields
                ? Object.fromEntries(
                    Object.entries(fields).map(([field, msg]) => [
                        field,
                        msg
                    ])
                )
                : undefined
        }
    });
}