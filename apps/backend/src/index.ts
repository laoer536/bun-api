import { cors } from '@elysiajs/cors'
import { Elysia } from 'elysia'
import { opentelemetry } from '@elysia/opentelemetry'
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-node'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto'

import { openapiPlugin } from './plugin/openapi'
import { user } from './modules'
import { betterAuthPlugin } from './plugin/better-auth'

export const app = new Elysia()
  .use(cors({ origin: false })) // Why is 'origin: false'? Because we have configured a proxy locally for front-end development, we have set up a reverse proxy for NGINX deployed online.
  .use(
    opentelemetry({
      spanProcessors: [
        new BatchSpanProcessor(
          new OTLPTraceExporter({
            url: 'https://api.axiom.co/v1/traces',
            headers: {
              Authorization: `Bearer ${process.env.AXIOM_TOKEN}`,
              'X-Axiom-Dataset': process.env.AXIOM_DATASET as string,
            },
          }),
        ),
      ],
    }),
  )
  .use(betterAuthPlugin)
  .use(openapiPlugin)
  .use(user)
  .listen(8090)

export type App = typeof app
export * from './types/models.ts'
