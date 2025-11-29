#!/usr/bin/env bash

set -euo pipefail

# Deploy the Next.js app to Cloudflare Pages using next-on-pages + wrangler.

ROOT_DIR="$(cd -- "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

PROJECT_NAME="${CF_PAGES_PROJECT_NAME:-}"
BRANCH="${CF_PAGES_BRANCH:-main}"

if [[ -z "$PROJECT_NAME" ]]; then
  echo "Missing CF_PAGES_PROJECT_NAME (Cloudflare Pages project name)." >&2
  exit 1
fi

if [[ -z "${CLOUDFLARE_API_TOKEN:-}" ]]; then
  echo "Missing CLOUDFLARE_API_TOKEN (API token with Pages Write + Account Read)." >&2
  exit 1
fi

if [[ -z "${CLOUDFLARE_ACCOUNT_ID:-}" ]]; then
  echo "Missing CLOUDFLARE_ACCOUNT_ID (Cloudflare account id)." >&2
  exit 1
fi

echo "🛠  Building Next.js app for Cloudflare Pages..."
# next-on-pages CLI runs the build by default; no subcommand is expected.
npx --yes @cloudflare/next-on-pages@latest

echo "🚀 Deploying to Cloudflare Pages project '${PROJECT_NAME}' (branch: ${BRANCH})..."
npx --yes wrangler@latest pages deploy \
  .vercel/output \
  --project-name "$PROJECT_NAME" \
  --branch "$BRANCH"

echo "✅ Deploy completed. Check the Cloudflare Pages dashboard for status."
