#!/bin/bash
# ============================================================
# Cooperative Bank App - Safe Migration Script
# With Automatic Backup & Rollback (SQLite + MySQL)
# ============================================================

set -e

echo "🚀 Starting safe database migration for Cooperative Bank App..."

# === Run only from backend root ===
if [ ! -f "app.py" ] && [ ! -f "wsgi.py" ]; then
  echo "❌ Please run this script from your backend root (where app.py is)."
  exit 1
fi

# === Ensure Flask is available ===
if ! command -v flask &> /dev/null; then
  echo "❌ Flask command not found."
  echo "💡 Run: source venv/bin/activate"
  exit 1
fi

# === Detect DB URI ===
DB_URI=$(grep -E "SQLALCHEMY_DATABASE_URI" app/config.py 2>/dev/null || true)
if [ -z "$DB_URI" ]; then
  DB_URI=$(grep -E "SQLALCHEMY_DATABASE_URI" app/__init__.py 2>/dev/null || true)
fi

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="./db_backups"
mkdir -p "$BACKUP_DIR"
ROLLBACK_FILE=""

# === Backup Function ===
backup_database() {
  echo "💾 Creating database backup before migration..."
  if echo "$DB_URI" | grep -q "sqlite"; then
    DB_PATH=$(echo "$DB_URI" | sed -E "s/.*sqlite:\/\/\///")
    BACKUP_FILE="$BACKUP_DIR/sqlite_backup_$TIMESTAMP.db"
    if [ -f "$DB_PATH" ]; then
      cp "$DB_PATH" "$BACKUP_FILE"
      ROLLBACK_FILE="$BACKUP_FILE"
      echo "✅ SQLite backup saved to: $BACKUP_FILE"
    else
      echo "⚠️ SQLite file not found at $DB_PATH, skipping backup."
    fi

  elif echo "$DB_URI" | grep -q "mysql"; then
    DB_USER=$(echo "$DB_URI" | sed -E 's/.*mysql:\/\/([^:]+):.*/\1/')
    DB_PASS=$(echo "$DB_URI" | sed -E 's/.*mysql:\/\/[^:]+:([^@]+)@.*/\1/')
    DB_HOST=$(echo "$DB_URI" | sed -E 's/.*@([^:\/]+).*/\1/')
    DB_NAME=$(echo "$DB_URI" | sed -E 's/.*\/([^?]+).*/\1/')
    BACKUP_FILE="$BACKUP_DIR/mysql_backup_${DB_NAME}_$TIMESTAMP.sql"
    mysqldump -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" > "$BACKUP_FILE"
    ROLLBACK_FILE="$BACKUP_FILE"
    echo "✅ MySQL backup saved to: $BACKUP_FILE"
  else
    echo "⚠️ Unknown DB type — skipping backup."
  fi
}

# === Rollback Function ===
rollback_database() {
  echo "⚠️ Migration failed! Rolling back from backup..."
  if [ -z "$ROLLBACK_FILE" ]; then
    echo "❌ No backup found to restore!"
    exit 1
  fi

  if echo "$ROLLBACK_FILE" | grep -q "sqlite"; then
    DB_PATH=$(echo "$DB_URI" | sed -E "s/.*sqlite:\/\/\///")
    echo "🔁 Restoring SQLite DB from $ROLLBACK_FILE ..."
    cp "$ROLLBACK_FILE" "$DB_PATH"
  elif echo "$ROLLBACK_FILE" | grep -q ".sql"; then
    DB_USER=$(echo "$DB_URI" | sed -E 's/.*mysql:\/\/([^:]+):.*/\1/')
    DB_PASS=$(echo "$DB_URI" | sed -E 's/.*mysql:\/\/[^:]+:([^@]+)@.*/\1/')
    DB_HOST=$(echo "$DB_URI" | sed -E 's/.*@([^:\/]+).*/\1/')
    DB_NAME=$(echo "$DB_URI" | sed -E 's/.*\/([^?]+).*/\1/')
    echo "🔁 Restoring MySQL DB from $ROLLBACK_FILE ..."
    mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" < "$ROLLBACK_FILE"
  else
    echo "❌ Unknown backup format, rollback skipped."
  fi
  echo "✅ Rollback complete. Database restored."
}

# === Trap errors to rollback automatically ===
trap 'rollback_database' ERR

# === Perform backup ===
backup_database

# === Migration process ===
echo "📁 Checking Alembic migrations..."
if [ ! -d "migrations" ]; then
  echo "🧱 Initializing Alembic migrations..."
  flask db init
else
  echo "✅ Migrations folder found."
fi

echo "🧩 Stamping DB head..."
flask db stamp head || true

echo "📄 Generating migration..."
flask db migrate -m "Auto migration on $TIMESTAMP"

echo "⚙️ Applying migration..."
flask db upgrade

# === If migration completes successfully ===
trap - ERR
echo "🎉 Migration successful! Database updated safely."
echo "📦 Backup stored at: $BACKUP_DIR/"
