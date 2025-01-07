#!/bin/bash
pip install --upgrade pip
pip install --no-cache-dir Django
pip install --no-cache-dir psycopg2-binary


# its for wait for the database to be ready
MAX_RETRIES=3
RETRY_COUNT=0

until pg_isready -h $DB_HOST -p $DB_PORT -U $POSTGRES_USER || [ $RETRY_COUNT -eq $MAX_RETRIES ]; do
  >&2 echo "PostgreSQL is not ready, waiting... (attempt $((RETRY_COUNT + 1)))"
  RETRY_COUNT=$((RETRY_COUNT + 1))
  sleep 2
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
  >&2 echo "PostgreSQL did not become ready after $MAX_RETRIES attempts, exiting."
  exit 1
fi


exec "$@"