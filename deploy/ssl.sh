#!/bin/bash
# Run this once your DNS A record for crm.hexamaddigital.com has propagated,
# if setup.sh's automatic SSL attempt was skipped.
#   sudo bash deploy/ssl.sh
set -e

if [ "$EUID" -ne 0 ]; then
  echo "Run this with sudo: sudo bash deploy/ssl.sh"
  exit 1
fi

DOMAIN="crm.hexamaddigital.com"
certbot --nginx -d "$DOMAIN" --redirect
