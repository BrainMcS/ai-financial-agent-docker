FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache python3 make g++

RUN npm install -g npm@latest
RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./
RUN pnpm install

COPY . .

ARG OPENAI_API_KEY
ARG FINANCIAL_DATASETS_API_KEY
ARG LANGCHAIN_API_KEY
ENV OPENAI_API_KEY=$OPENAI_API_KEY
ENV FINANCIAL_DATASETS_API_KEY=$FINANCIAL_DATASETS_API_KEY
ENV LANGCHAIN_API_KEY=$LANGCHAIN_API_KEY
ENV LANGCHAIN_TRACING_V2=true
ENV LANGCHAIN_PROJECT=ai-financial-agent

RUN pnpm run build # if needed for your app

EXPOSE 3000
CMD ["pnpm", "start"]