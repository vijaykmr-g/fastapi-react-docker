# Use a small Node image
FROM node:20-alpine

# Set working directory inside container
WORKDIR /app

# Copy package files first (to cache npm install)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all project files (after dependencies)
COPY . .

# Expose port 3000 for React dev server
EXPOSE 3000

# Start the React app
CMD ["npm", "start", "--", "--host", "0.0.0.0"]
