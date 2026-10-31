FROM evoapicloud/evolution-api@sha256:1bd8afc4a6cf48822e6cf02469aeae7bd35a12a6b616eacd1291926307f4d339

# Postgres only: migrations and the Prisma client are prepared at build time. The stock entrypoint does this on every start, which needs a writable root.
ENV DATABASE_PROVIDER=postgresql \
    CHECKPOINT_DISABLE=1 \
    PRISMA_HIDE_UPDATE_MESSAGE=1
RUN rm -rf prisma/migrations \
 && cp -r prisma/postgresql-migrations prisma/migrations \
 && npx prisma generate --schema ./prisma/postgresql-schema.prisma

# The app writes to <cwd>/instances and <cwd>/store (hardcoded); link them to the persistent disk.
RUN rm -rf instances store && ln -s /app/instances instances && ln -s /app/store store

COPY entrypoint.sh /evolution/vertra-entrypoint.sh
COPY vertra-tls-client-cert.cjs /evolution/vertra-tls-client-cert.cjs
# The preload is a no-op unless VERTRA_TLS_CLIENT_HOST/CERT/KEY are set.
ENV NODE_OPTIONS="--require /evolution/vertra-tls-client-cert.cjs"
ENTRYPOINT ["/bin/bash", "/evolution/vertra-entrypoint.sh"]
