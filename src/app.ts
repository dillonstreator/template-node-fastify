import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import Fastify from 'fastify';
import pino from 'pino';
import helmet from '@fastify/helmet';
import compression from '@fastify/compress';
import {
    serializerCompiler,
    validatorCompiler,
    ZodTypeProvider,
    jsonSchemaTransform,
} from 'fastify-type-provider-zod';
import z from 'zod';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUI from '@fastify/swagger-ui';

import { Config } from './config';

const { name: pkgName, version: pkgVersion } = JSON.parse(
    readFileSync(join(__dirname, '..', 'package.json'), 'utf8')
) as { name: string; version: string };

declare module 'fastify' {
    interface FastifyRequest {
        abortSignal: AbortSignal;
    }
}

export const initApp = async (config: Config, logger: pino.Logger) => {
    const app = Fastify({
        loggerInstance: logger,
        trustProxy: true,
        bodyLimit: 1024,
        genReqId: () => randomUUID(),
    });
    app.setValidatorCompiler(validatorCompiler);
    app.setSerializerCompiler(serializerCompiler);

    await app.register(fastifySwagger, {
        openapi: {
            info: {
                title: pkgName,
                description: pkgName,
                version: pkgVersion,
            },
            servers: [],
        },
        transform: jsonSchemaTransform,
    });

    await app.register(helmet);
    await app.register(compression);
    await app.register(fastifySwaggerUI, {
        routePrefix: '/documentation',
    });

    await app.after();

    app.addHook('onRequest', async (req, res) => {
        const ac = new AbortController();
        req.abortSignal = ac.signal;

        req.raw.on('close', () => {
            if (req.raw.destroyed) {
                ac.abort();
            }
        });
    });

    app.get(config.healthCheckEndpoint, (req, res) => {
        res.status(200).send();
    });

    app.get('/hi', (req, res) => {
        req.log.info('hi');
        res.send('hi');
    });

    app.withTypeProvider<ZodTypeProvider>().route({
        method: 'POST',
        url: '/echo',
        schema: {
            body: z.object({
                name: z.string(),
            }),
            response: {
                200: z.object({
                    msg: z.string(),
                }),
            },
        },
        handler(req, res) {
            res.send({ msg: `hi ${req.body.name}` });
        },
    });

    app.post('/large-json-payload', {
        bodyLimit: 1024 * 50,
        handler(req, res) {
            res.status(200).send();
        },
    });

    app.get('/abort-signal-propagation', async (req, res) => {
        for (let i = 0; i < 10; i++) {
            // simulate some work
            await new Promise((r) => setTimeout(r, 25));

            req.log.debug('work');
            if (req.abortSignal.aborted) throw new Error('aborted');
        }

        const usersRes = await fetch(
            'https://jsonplaceholder.typicode.com/users',
            {
                signal: req.abortSignal,
            }
        );
        if (usersRes.status !== 200) {
            throw new Error(
                `unexpected non-200 status code ${usersRes.status}`
            );
        }
        const users = await usersRes.json();
        res.send(users);
    });

    app.setErrorHandler(function (error, req, res) {
        req.log.error(error);

        if (res.sent) return;

        res.status(500).send({ msg: 'Something went wrong' });
    });

    await app.ready();

    return {
        fastify: app,
        shutdown: async () => {
            // add any cleanup code here including database/redis disconnecting and background job shutdown
            await app.close();
        },
    };
};
