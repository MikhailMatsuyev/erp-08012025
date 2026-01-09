#!/bin/sh

echo "⏳ Waiting for MySQL..."

until mysqladmin ping \
  -h"$DB_HOST" \
  -u"$DB_USER" \
  -p"$DB_PASSWORD" \
  --ssl=0 \
  --silent
do
  echo "❌ MySQL not ready, waiting..."
  sleep 2
done

echo "✅ MySQL is ready"
