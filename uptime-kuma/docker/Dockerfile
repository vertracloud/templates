# The program moves to /opt/uptime-kuma because the app volume covers /app; data goes to /app/data.
# The slim variant (SQLite, no Chromium) has no "real browser" monitor type.
# vertra-start.cjs creates the admin account before the public port opens (Kuma has no CLI for the first user).
# Pinned to Uptime Kuma 2.5.8 (slim, multi-arch index digest).
FROM louislam/uptime-kuma:2-slim@sha256:3e0ae13fa92d0a1108b7e4133eaa25b2bc4e26d2f5d8691a5cb01ee1fe5c95f1

USER root
RUN mv /app /opt/uptime-kuma && mkdir /app && chown 1000:1000 /app
# `ping` ships with a file capability (cap_net_raw=ep) and fails under cap-drop ALL; copying it through `cat` drops the attribute.
RUN cat /usr/bin/ping > /tmp/ping.nocap && chmod 0755 /tmp/ping.nocap && mv -f /tmp/ping.nocap /usr/bin/ping
COPY --chown=0:0 --chmod=0644 vertra-start.cjs /opt/vertra/vertra-start.cjs
USER 1000:1000

ENV HOME=/app \
    DATA_DIR=/app/data/ \
    UPTIME_KUMA_IS_CONTAINER=1
WORKDIR /opt/uptime-kuma
EXPOSE 3001
ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "/opt/vertra/vertra-start.cjs"]
