FROM public.ecr.aws/docker/library/node:lts-alpine3.16 AS builder
RUN apk add --no-cache python3 g++ make git
WORKDIR /app
COPY . .
RUN npm install && npm run build && npm prune --production && rm -rf app
RUN npm install gulp-cli -g && npm install gulp

FROM public.ecr.aws/docker/library/node:lts-alpine3.16
COPY --from=builder /app /app
WORKDIR /app
CMD ["node", "dist/main.js"]