# Step 1: Build the backend application
FROM node:20-alpine AS build

# Set the working directory in the container
WORKDIR /app

# Install Python, make, and g++
RUN apk add --no-cache python3 make g++

# Install pnpm globally
RUN npm install -g pnpm

# Copy the package.json and pnpm-lock.yaml (or yarn.lock) files
COPY package.json pnpm-lock.yaml ./

# Install dependencies (including dev dependencies)
RUN pnpm install

# Copy the entire project to the container
COPY . .

# Build the backend application
RUN pnpm nx build backend --configuration=production

# Step 2: Create the production image
FROM node:20-alpine AS production

# Set the working directory in the container
WORKDIR /app

# Copy built files and node_modules from build step
COPY --from=build /app/dist/apps/backend ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./

# Set the environment to production
ENV NODE_ENV=production

# Expose the backend application's port (adjust this according to your application)
EXPOSE 4000

# Command to run the backend application
CMD ["node", "dist/main.js"]