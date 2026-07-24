import pino from 'pino';
import {
    FastifyReply,
    FastifyRequest,
    LogController,
} from 'fastify';
import {
    ATTR_CLIENT_ADDRESS,
    ATTR_CLIENT_PORT,
    ATTR_HTTP_REQUEST_METHOD,
    ATTR_HTTP_RESPONSE_STATUS_CODE,
    ATTR_HTTP_ROUTE,
    ATTR_SERVER_ADDRESS,
    ATTR_URL_PATH,
    ATTR_USER_AGENT_ORIGINAL,
} from '@opentelemetry/semantic-conventions';

import { Config } from './config';

/** Aligns with OpenTelemetry / ECS-style HTTP attribute naming. */
export const REQUEST_ID_LOG_LABEL = 'http.request.id';
export const DURATION_MS_LOG_LABEL = 'duration_ms';

export const serializeRequest = (req: FastifyRequest) => ({
    [ATTR_HTTP_REQUEST_METHOD]: req.method,
    [ATTR_URL_PATH]: req.url,
    [ATTR_HTTP_ROUTE]: req.routeOptions?.url,
    [ATTR_SERVER_ADDRESS]: req.host,
    [ATTR_CLIENT_ADDRESS]: req.ip,
    [ATTR_CLIENT_PORT]: req.socket?.remotePort,
    [ATTR_USER_AGENT_ORIGINAL]: req.headers['user-agent'],
});

export const serializeResponse = (reply: FastifyReply) => ({
    [ATTR_HTTP_RESPONSE_STATUS_CODE]: reply.statusCode,
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
