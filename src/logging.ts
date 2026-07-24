import pino from 'pino';
import {
    FastifyReply,
    FastifyRequest,
    LogController,
} from 'fastify';

import { Config } from './config';

export const REQUEST_ID_LOG_LABEL = 'request_id';
export const DURATION_MS_LOG_LABEL = 'duration_ms';

export const serializeRequest = (req: FastifyRequest) => ({
    method: req.method,
    path: req.url,
    route: req.routeOptions?.url,
    host: req.host,
    remote_address: req.ip,
    remote_port: req.socket?.remotePort,
    user_agent: req.headers['user-agent'],
});

export const serializeResponse = (reply: FastifyReply) => ({
    status_code: reply.statusCode,
});

export class AppLogController extends LogController {
    constructor(options?: ConstructorParameters<typeof LogController>[0]) {
        super({
            ...options,
            requestIdLogLabel: REQUEST_ID_LOG_LABEL,
        });
    }

    requestCompleted(
        error: Error | null,
        request: FastifyRequest,
        reply: FastifyReply
    ) {
        if (this.isLogDisabled(request)) return;

        if (error) {
            reply.log.error(
                {
                    res: reply,
                    err: error,
                    [DURATION_MS_LOG_LABEL]: reply.elapsedTime,
                },
                'request errored'
            );
        } else {
            reply.log.info(
                {
                    res: reply,
                    [DURATION_MS_LOG_LABEL]: reply.elapsedTime,
                },
                'request completed'
            );
        }
    }
}

export const initLogging = async (config: Config): Promise<pino.Logger> => {
    return pino({
        level: config.logLevel,
        serializers: {
            req: serializeRequest,
            res: serializeResponse,
        },
    });
};
