# Nginx Configuration for CoNetX App

## 📍 Location
Configuration file:
`/etc/nginx/sites-available/cooperative-bank`

Symlink to enable site:
```bash
sudo ln -s /etc/nginx/sites-available/cooperative-bank /etc/nginx/sites-enabled/
```

---

## ⚙️ Complete Nginx Configuration

```nginx
# Redirect all HTTP traffic to HTTPS
server {
    listen 80;
    server_name cooperativebanknetwork.com www.cooperativebanknetwork.com;
    return 301 https://$host$request_uri;
}

# Main HTTPS server block
server {
    listen 443 ssl;
    server_name cooperativebanknetwork.com www.cooperativebanknetwork.com;

    root /home/kk7442987/cooperative-bank-Network-app/frontend_vite/dist;
    index index.html;

    # SSL configuration (managed by Certbot)
    ssl_certificate /etc/letsencrypt/live/cooperativebanknetwork.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/cooperativebanknetwork.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Redirect all www → non-www (optional)
    if ($host = www.cooperativebanknetwork.com) {
        return 301 https://cooperativebanknetwork.com$request_uri;
    }

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options SAMEORIGIN;
    add_header X-XSS-Protection "1; mode=block";

    # Serve Vite-built frontend
    location / {
        try_files $uri /index.html;
    }

    # Proxy API requests to backend (Flask/FastAPI/etc.)
    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Enable gzip compression
    gzip on;
    gzip_types text/plain text/css application/javascript application/json image/svg+xml;
    gzip_min_length 256;

    # Log files
    access_log /var/log/nginx/cooperativebank_access.log;
    error_log /var/log/nginx/cooperativebank_error.log warn;
}
```

---

## 🧩 Deployment Steps

1. **Copy the configuration file**
   ```bash
   sudo cp cooperative-bank /etc/nginx/sites-available/cooperative-bank
   ```

2. **Enable the site**
   ```bash
   sudo ln -s /etc/nginx/sites-available/cooperative-bank /etc/nginx/sites-enabled/
   ```

3. **Disable the default site (if present)**
   ```bash
   sudo rm /etc/nginx/sites-enabled/default
   ```

4. **Test configuration**
   ```bash
   sudo nginx -t
   ```
   ✅ Expected output:
   ```
   nginx: configuration file /etc/nginx/nginx.conf test is successful
   ```

5. **Reload Nginx**
   ```bash
   sudo systemctl reload nginx
   ```

6. **Verify your deployment**
   Open your browser and visit:
   ```
   https://cooperativebanknetwork.com
   ```

---

## 🔒 SSL Certificate Renewal (Certbot)

Certbot automatically renews certificates every 60–90 days.  
To verify and reload Nginx after renewal:

```bash
sudo certbot renew --dry-run
sudo systemctl reload nginx
```

If you want automatic reloads on renewal, add this hook:
```bash
sudo bash -c 'echo "systemctl reload nginx" >> /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh'
sudo chmod +x /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh
```

---

## ✅ Permissions Check

Make sure Nginx can read your frontend files:
```bash
sudo chown -R www-data:www-data /home/kk7442987/cooperative-bank-Network-app/frontend_vite
sudo chmod -R 755 /home/kk7442987/cooperative-bank-Network-app/frontend_vite
```

---

## 🧠 Troubleshooting

- **Still seeing “Welcome to Nginx”?**
  Check for conflicting configs:
  ```bash
  sudo grep -R "cooperativebanknetwork.com" /etc/nginx/
  ```
  Remove or rename any duplicates found in `/etc/nginx/conf.d/` or `sites-enabled/`.

- **Check which config is active:**
  ```bash
  sudo nginx -T | grep -A3 "server_name cooperativebanknetwork.com"
  ```

- **Logs:**
  - Access: `/var/log/nginx/cooperativebank_access.log`
  - Errors: `/var/log/nginx/cooperativebank_error.log`
