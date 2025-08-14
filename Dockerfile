# VIP Room - Static Site with Nginx
FROM nginx:alpine

# Copy static files
COPY . /usr/share/nginx/html

# Create custom nginx config for VIP Room
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]