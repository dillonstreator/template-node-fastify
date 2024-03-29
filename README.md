# `template-node-fastify`

A minimal production-ready node HTTP server with [`Fastify`](https://fastify.dev/) and Typescript.

✅ Typescript \
✅ Graceful shutdown \
✅ Optional Tracing with OpenTelemetry (configurable via environment variables) \
✅ Properly configured request payload size limiting to help prevent Denial of Service attack vectors \
✅ Auto-generated Swagger/OpenAPI documentation \
✅ `AbortSignal` propagation to prevent unnecessary work (includes example and test)  \
✅ Structured logging with [`pino`](https://github.com/pinojs/pino) \
✅ Rich request logging middleware including request id, trace id, context propagation, and more \
✅ [`zod`](https://github.com/turkerdev/fastify-type-provider-zod) for request validation, JSON schema inference, and OpenAPI/Swagger generation \
✅ Testing with [`tap`](https://www.npmjs.com/package/tap) and [`undici`](https://www.npmjs.com/package/undici) \
✅ [`helmet`](https://github.com/fastify/fastify-helmet) & [`compression`](https://github.com/fastify/fastify-compress)

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/xeb3TM?referralCode=ToZEjF)


## Installation

```sh
git clone https://github.com/dillonstreator/template-node-fastify

cd template-node-fastify

yarn install

yarn dev
```

## Configuration

See all example configuration via environment variables in [`.env-example`](./.env-example)

### Open Telemetry

Open Telemetry is disabled by default but can be enabled by setting the `OTEL_ENABLED` environment to `true`.

By default, the trace exporter is set to standard output. This can be overridden by setting `OTEL_EXPORTER_OTLP_ENDPOINT`.

Start the `jaegertracing/all-in-one` container with `docker-compose up` and set `OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318` to collect logs in jaeger. Docker compose will expose jaeger at http://localhost:16686