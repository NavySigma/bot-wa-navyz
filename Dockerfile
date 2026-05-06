# Use an official Node.js runtime as a parent image
FROM node:18-slim

# Install system dependencies for Puppeteer (Chromium)
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-ipafont-gothic \
    fonts-wqy-zenhei \
    fonts-thai-tlwg \
    fonts-kacst \
    fonts-freefont-ttf \
    libxss1 \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Set the environment variable for Puppeteer to find Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Create directory for stickers if it doesn't exist
RUN mkdir -p stickers && echo "{}" > stickers/list.json

# Expose the port (Hugging Face Spaces might need this for its internal health check)
EXPOSE 7860

# Start the application
CMD [ "node", "index.js" ]
