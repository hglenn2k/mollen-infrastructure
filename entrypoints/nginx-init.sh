#!/bin/bash
set -e

echo "Preparing nginx configuration for ${DEPLOYMENT_ENV:-local} environment"

# Create templates directory if it doesn't exist
mkdir -p /etc/nginx/templates

# Remove any existing template files to avoid duplicate processing
rm -f /etc/nginx/templates/*.template
rm -f /etc/nginx/conf.d/default.conf

# Determine which configuration to use based on DEPLOYMENT_ENV
if [ "$DEPLOYMENT_ENV" = "local" ]; then
    echo "Using local configuration template"
    cp /tmp/nginx-templates/local.conf.template /etc/nginx/templates/nginx.conf.template
else
    echo "Using production configuration template"
    cp /tmp/nginx-templates/production.conf.template /etc/nginx/templates/nginx.conf.template
fi

echo "Nginx initialization complete"