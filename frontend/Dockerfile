# Stage 1: Build the React app
FROM node:18-alpine AS build

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the frontend code
COPY . .

# Build the React app for production (creates the 'dist' folder)
RUN npm run build

# Stage 2: Serve the app using Nginx (a super fast web server)
FROM nginx:alpine

# Copy the built React files from Stage 1 into Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
