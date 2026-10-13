# Coolify deployment

Production: https://myrkur.andri.is.

Coolify builds GitHub `main` with `Dockerfile.coolify` from `/` on Baracoa, publishes `ghcr.io/andrigitdev/myrkur`, and runs the image on Kastro-Host-A. Cloudflare proxied A records point each hostname to the deployment server. Traefik manages origin HTTPS certificates and renewal through HTTP-01 on port 80.

The container listens on port 80. Its Docker healthcheck and Coolify healthcheck probe `/` every 30 seconds with a five-second timeout and three retries. All production hostnames must have DNS records. Git pushes automatically deploy.

Build locally with `docker build -f Dockerfile.coolify .` from this directory. Run with `docker run --rm -p 80:80 <image>`. Vercel configuration remains available for rollback during the migration window; page-view analytics are disabled on Coolify.
