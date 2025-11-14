# 📘 README: Database Migration Setup (Flask-Migrate)

This guide explains how to initialize and manage database migrations for the CoNetX backend using **Flask-Migrate** and **SQLAlchemy**.

---

## 🏗️ Step 1: Ensure Flask-Migrate Is Installed

Make sure you have Flask-Migrate installed in your project:

```bash
pip install Flask-Migrate
```

If using a `requirements.txt`, also update it:

```bash
pip freeze > requirements.txt
```

---

## ⚙️ Step 2: Configure Migrate in Your `app.py`

At the top of your backend entry file (usually `app.py`), ensure these lines are present **after** you initialize your Flask app and SQLAlchemy `db`:

```python
from flask_migrate import Migrate
from models import db

migrate = Migrate(app, db)
```

This enables the `flask db` CLI commands.

---

## 🗂️ Step 3: Initialize the Migrations Folder

Run this **once** to set up your migrations directory:

```bash
flask db init
```

✅ This will create a new folder called `migrations/`
It stores all database schema change history (safe to commit to Git).

---

## 🧱 Step 4: Generate a Migration Script

After adding or modifying models (e.g., CooperativeBank, CooperativeBranch, BankContact) in your `models.py`, generate a migration:

```bash
flask db migrate -m "Add cooperative bank, branch, and contact models"
```

This creates an auto-generated migration script inside `migrations/versions/`.

---

## 🚀 Step 5: Apply the Migration to the Database

Apply all pending migrations to your database:

```bash
flask db upgrade
```

✅ This creates or updates tables in your configured database.

---

## 🧾 Expected Tables Created

If you’ve defined models similar to:

- `CooperativeBank`
- `CooperativeBranch`
- `BankContact`

Then you’ll now have these tables:

```
cooperative_banks
cooperative_branches
bank_contacts
contact_messages
users
roles
... (any other models you defined)
```

---

## 🔍 Step 6: Verify the Tables Exist

You can verify using the Flask shell:

```bash
flask shell
```

Then run inside the shell:

```python
from models import db, CooperativeBank
db.session.query(CooperativeBank).all()
```

If it runs without error, your table exists ✅

---

## 🧹 Common Maintenance Commands

| Action | Command |
|--------|----------|
| Initialize migrations folder | `flask db init` |
| Generate new migration | `flask db migrate -m "message"` |
| Apply migrations | `flask db upgrade` |
| Roll back last migration | `flask db downgrade` |
| Show migration history | `flask db history` |

---

## 🧩 Troubleshooting Tips

- If you change a model but the migration doesn’t detect it:
  ```bash
  flask db migrate --force
  ```
- If you accidentally break migrations, delete the `migrations/` folder and your DB, then re-run:
  ```bash
  flask db init
  flask db migrate -m "Initial migration"
  flask db upgrade
  ```

---

## 💡 Pro Tip: Include Migrations in Git

Commit your `migrations/` folder to Git.  
That way, every developer (or deployment) stays in sync with your database schema.

---

## ✅ Done!

You now have a complete Flask-Migrate setup that tracks schema evolution for your Cooperative Bank project.


flask db stamp head
flask db migrate -m "Fix relationship overlaps and sync schema"
flask db upgrade