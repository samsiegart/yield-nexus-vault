# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Build the application with environment variables
# Environment variables starting with VITE_ are embedded at build time
ARG VITE_FEEDBACK_ENDPOINT
ENV VITE_FEEDBACK_ENDPOINT=$VITE_FEEDBACK_ENDPOINT

RUN NODE_OPTIONS=--max-old-space-size=8192 yarn build

# Production stage
FROM nginx:alpine

# Copy built files to nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY <<EOF /etc/nginx/conf.d/default.conf
server {
    listen 3000;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Health check endpoint
    location /health {
        access_log off;
        error_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
        add_header Cache-Control no-cache;
    }

    # Main application
    location / {
        try_files \$uri \$uri/ /index.html;
        add_header Cache-Control "public, max-age=3600";
    }

    # Handle 404 errors
    error_page 404 /index.html;
}
EOF

EXPOSE 3000

# Add a startup script to ensure nginx starts properly
COPY <<EOF /docker-entrypoint.sh
#!/bin/sh
set -e

# Start nginx in the background
nginx -g "daemon off;" &
nginx_pid=\$!

# Wait a moment for nginx to start
sleep 2

# Check if nginx is running
if ! kill -0 \$nginx_pid 2>/dev/null; then
    echo "Nginx failed to start"
    exit 1
fi

# Wait for nginx process
wait \$nginx_pid
EOF

RUN chmod +x /docker-entrypoint.sh

CMD ["/docker-entrypoint.sh"]