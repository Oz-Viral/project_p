# Step 1: Build the Next.js application
FROM node:20-alpine AS build

# Set the working directory in the container
WORKDIR /app

# Install Python, make, and g++ for node-gyp builds
RUN apk add --no-cache python3 make g++

# Install pnpm globally
RUN npm install -g pnpm

# Copy package.json and pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# Install dependencies including dev dependencies
RUN pnpm install

# Copy the rest of the project files
COPY . .

RUN npx prisma generate

# Build the Next.js application
RUN pnpm nx build frontend --configuration=production

# Step 2: Create the production image
FROM node:20-alpine AS production

ENV NEXT_PRIVATE_STANDALONE true

# Set the working directory in the container
WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy only the necessary files from the build stage
COPY --from=build /app/dist/apps/frontend ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./


# Set the environment to production
ENV NODE_ENV=production

# Expose the Next.js default port
EXPOSE 4200

# Start the Next.js application
CMD ["pnpm", "start:frontend", "--port", "4200"]