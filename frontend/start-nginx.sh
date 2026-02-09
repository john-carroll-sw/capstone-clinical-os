#!/bin/bash

# Ensure nginx directories exist with proper permissions
mkdir -p /var/log/nginx
mkdir -p /var/lib/nginx/tmp/client_body
mkdir -p /var/lib/nginx/tmp/proxy
mkdir -p /var/lib/nginx/tmp/fastcgi
mkdir -p /var/lib/nginx/tmp/uwsgi
mkdir -p /var/lib/nginx/tmp/scgi

# Set proper ownership and permissions
chown -R nginx:nginx /var/log/nginx /var/lib/nginx
chmod -R 755 /var/log/nginx /var/lib/nginx

# Start nginx in foreground
nginx -g 'daemon off;'

