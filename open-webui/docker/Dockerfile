# The program moves to /opt/open-webui because the app volume covers /app; data and caches go to /app/data.
# The slim variant ships no embedding, speech or Ollama models (bring your own key).
# Pinned to Open WebUI v0.12.4 (slim, multi-arch index digest). The LICENSE (BSD-3 with a branding clause) ships with the image; keep the "Open WebUI" branding.
FROM ghcr.io/open-webui/open-webui:v0.12.4-slim@sha256:41812075aede8ada8497cb2b71c76412978633eee72775bb77796f593d03b677

USER root
RUN mv /app /opt/open-webui && mkdir /app && chown 1000:1000 /app
COPY --chown=0:0 --chmod=0644 LICENSE /opt/open-webui/LICENSE
COPY --chown=0:0 --chmod=0755 start-vertra.sh /opt/start-vertra.sh
USER 1000:1000

ENV HOME=/app \
    DATA_DIR=/app/data \
    STATIC_DIR=/app/data/static \
    WHISPER_MODEL_DIR=/app/data/cache/whisper/models \
    SENTENCE_TRANSFORMERS_HOME=/app/data/cache/embedding/models \
    HF_HOME=/app/data/cache/embedding/models \
    TIKTOKEN_CACHE_DIR=/app/data/cache/tiktoken
WORKDIR /opt/open-webui/backend
EXPOSE 8080
ENTRYPOINT ["/opt/start-vertra.sh"]
CMD []
