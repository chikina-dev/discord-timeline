# Use Bun's official image which includes bun runtime
FROM oven/bun:latest

# Create app directory
WORKDIR /app

# Copy package manifest for better layer caching
COPY package.json ./

# Install production dependencies. If there is no bun.lockb, bun will proceed anyway.
RUN bun install --production || true

# Copy application sources
COPY . .

# Set production environment
ENV NODE_ENV=production

# Discord bots don't need to expose ports by default; leave for flexibility
# EXPOSE 3000

# Start the bot using `bun start` to run the package.json start script
CMD ["bun", "start"]
