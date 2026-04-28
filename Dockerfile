FROM node:20-alpine AS deps
WORKDIR /app

RUN cat <<'EOF' > package.json
{
  "name": "oom-test",
  "version": "1.0.0",
  "dependencies": {
    "webpack": "latest",
    "webpack-cli": "latest"
  }
}
EOF

RUN npm install --legacy-peer-deps

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules

RUN cat <<'EOF' > oom.js
const arrays = [];
const chunkMB = 100;
let totalMB = 0;
while (true) {
  const chunk = Buffer.alloc(chunkMB * 1024 * 1024, 1);
  arrays.push(chunk);
  totalMB += chunkMB;
  console.log(`Allocated ${totalMB}MB`);
}
EOF

RUN node oom.js

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/oom.js ./
CMD ["echo", "done"]
