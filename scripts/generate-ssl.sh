#!/bin/bash
mkdir -p nginx/ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/ssl/server.key \
  -out nginx/ssl/server.crt \
  -subj "/C=HR/ST=Zagreb/L=Zagreb/O=PhishGuard/CN=localhost"
echo "✅ SSL certificates generated (server.key & server.crt)"
