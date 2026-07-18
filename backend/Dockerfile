# Reclaim AI Express backend — Cloud Run image
# Build from this directory: docker build -t breakfree-api .
#
# Uses tsx at runtime (same as local `npm start`). The API only type-imports
# from ../frontend; those imports are erased and are not needed in the image.

FROM node:20-alpine
WORKDIR /app

ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY tsconfig.json ./
COPY src ./src

# Cloud Run injects PORT (default 8080). Bind all interfaces in src/index.ts.
ENV PORT=8080
EXPOSE 8080

USER node
CMD ["npm", "start"]
