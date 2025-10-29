FROM nginx:alpine

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy SSL certificates
COPY ssl/ /etc/nginx/ssl/

# Expose ports
EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]
