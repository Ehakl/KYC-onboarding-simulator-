# Stage 1: Build the React application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first for caching dependencies
COPY package.json ./

# We assume package-lock.json is not present yet since user runs npm install later, 
# but in a real Dockerfile you'd COPY package*.json ./ and run npm ci.
# For this setup, we just use npm install.
RUN npm install

# Copy all other project files
COPY . .

# Build the application for production
RUN npm run build

# Stage 2: Serve the app with Nginx
FROM nginx:alpine

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Add a custom nginx configuration to handle React Router client-side routing.
# This ensures that URLs like /upload/123 fallback to index.html instead of returning 404.
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
