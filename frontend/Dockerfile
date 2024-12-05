# Use Node.js as the base image
FROM node:18

# Set working directory
WORKDIR /app

# Copy frontend code
COPY . /app

# Install dependencies
RUN npm install

# Build the React app for production
RUN npm run build

# Expose the React port
EXPOSE 3000

# Serve the production build
CMD ["npx", "serve", "-s", "build", "-l", "3000"]