# Gemini CLI on Render Free

A small HTTP wrapper around Google's Gemini CLI for Render's free Web Service plan.

## Environment variables

- `GEMINI_API_KEY`: Gemini API key used by the CLI.
- `WEB_API_TOKEN`: long random token required by the `/ask` endpoint.

## Endpoints

- `GET /health` — health check.
- `POST /ask` — JSON body `{ "prompt": "..." }`, with `Authorization: Bearer <WEB_API_TOKEN>`.

The service runs Gemini CLI in headless JSON mode with a two-minute request timeout. Render Free may sleep after inactivity, so the first request after idle can be slower.
