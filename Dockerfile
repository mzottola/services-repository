FROM node:20-alpine

WORKDIR /app

# Copy the stress script into the image first
COPY memory-stress.js .

# Then run it during build
RUN node --max-old-space-size=2048 memory-stress.js
