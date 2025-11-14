#!/bin/bash

# ===============================
# Automated Setup Script for Ubuntu
# ===============================

# Exit on any error
set -e

# Variables (change these as needed)
DB_ROOT_PASSWORD="rootpassword"
DB_NAME="cooperative_bank_db"
DB_USER="bankuser"
DB_PASSWORD="bankpassword"
BACKEND_DIR="$HOME/workspace/cooperative-bank-Network-app/backend"
PYTHON_ENV_DIR="$BACKEND_DIR/venv"
ENV_FILE="$BACKEND_DIR/.env"

echo "=== Updating system packages ==="
sudo apt update -y
sudo apt upgrade -y

echo "=== Installing MySQL server and client ==="
sudo apt install -y mysql-server mysql-client

echo "=== Starting MySQL service ==="
sudo systemctl start mysql
sudo systemctl enable mysql

echo "=== Securing MySQL installation ==="
sudo mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '${DB_ROOT_PASSWORD}';"
sudo mysql -e "DELETE FROM mysql.user WHERE User='';"
sudo mysql -e "DROP DATABASE IF EXISTS test;"
sudo mysql -e "DELETE FROM mysql.db WHERE Db='test' OR Db='test\\_%';"
sudo mysql -e "FLUSH PRIVILEGES;"

echo "=== Creating database and user ==="
mysql -uroot -p${DB_ROOT_PASSWORD} -e "CREATE DATABASE IF NOT EXISTS ${DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -uroot -p${DB_ROOT_PASSWORD} -e "CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASSWORD}';"
mysql -uroot -p${DB_ROOT_PASSWORD} -e "GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${DB_USER}'@'localhost';"
mysql -uroot -p${DB_ROOT_PASSWORD} -e "FLUSH PRIVILEGES;"

echo "=== Installing Python3 and virtualenv ==="
sudo apt install -y python3 python3-pip python3-venv

echo "=== Creating Python virtual environment ==="
python3 -m venv $PYTHON_ENV_DIR
source $PYTHON_ENV_DIR/bin/activate

echo "=== Installing Python dependencies ==="
pip install --upgrade pip
pip install flask flask_sqlalchemy pymysql python-dotenv passlib

echo "=== Creating .env file for Flask app ==="
cat > $ENV_FILE <<EOL
# Flask App Configuration
FLASK_ENV=development
FLASK_APP=app1.py

# MySQL Configuration
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=${DB_USER}
MYSQL_PASSWORD=${DB_PASSWORD}
MYSQL_DB=${DB_NAME}
EOL

echo "=== Adjusting password_hash column size to TEXT in database ==="
# Wait a few seconds to ensure MySQL is ready
sleep 2
mysql -u${DB_USER} -p${DB_PASSWORD} ${DB_NAME} -e "ALTER TABLE users MODIFY COLUMN password_hash TEXT;"

echo "=== Running backend server ==="
cd $BACKEND_DIR
python3 app1.py

echo "=== Setup Complete! Backend server should be running ==="

