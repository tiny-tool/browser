FROM node:22-bookworm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ARG PKG_VER
WORKDIR /app

RUN corepack enable
RUN apt-get update \
    && apt-get install -y wget gnupg \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

RUN groupadd -r pptruser && useradd -r -g pptruser -G audio,video pptruser \
    && chown -R pptruser:pptruser /app \
    && chown -R pptruser:pptruser /app \
    && chown -R pptruser:pptruser /app \
    && chown -R pptruser:pptruser /app

RUN corepack prepare pnpm@9.15.9 --activate
RUN pnpm add -g @tiny-tool/browser-mcp@${PKG_VER}

USER pptruser
EXPOSE 3000

CMD [ "@tiny-tool/browser-mcp", "-t", "sse" ]
