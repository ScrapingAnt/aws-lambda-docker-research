FROM node:14-buster

# Install Google Chrome
RUN apt-get update \
    && apt-get install -y chromium fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
      --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*


# Install aws-lambda-cpp build dependencies
RUN apt-get update && \
    apt-get install -y \
    g++ \
    make \
    cmake \
    unzip \
    libcurl4-openssl-dev

WORKDIR /code-and-deps

# Install nodejs dependencies, and create user (to run chromium from non-root user)
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
RUN npm install aws-lambda-ric aws-xray-sdk@3.3.1 puppeteer@8.0.0 \
    && groupadd -r pptruser && useradd -r -g pptruser -G audio,video pptruser \
    && mkdir -p /home/pptruser/Downloads \
    && chown -R pptruser:pptruser /home/pptruser \
    && chown -R pptruser:pptruser /code-and-deps
ENV AWS_XRAY_CONTEXT_MISSING LOG_ERROR

COPY src/app.js /code-and-deps/app.js
USER pptruser
ENTRYPOINT ["/usr/local/bin/npx", "aws-lambda-ric"]
CMD ["app.handler"]
