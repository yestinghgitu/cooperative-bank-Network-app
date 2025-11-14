# ⚠️ This will remove old snaps, cached packages, and logs to free space

# 1️⃣ Remove unused snap packages (often >2GB)
sudo snap list --all | awk '/disabled/{print $1, $2}' | while read snapname revision; do
    sudo snap remove "$snapname" --revision="$revision"
done

# 2️⃣ Clean apt cache
sudo apt clean
sudo apt autoremove -y

# 3️⃣ Remove old journal logs
sudo journalctl --vacuum-size=100M

# 4️⃣ Optional: clear local snap cache
sudo rm -rf /var/cache/snapd/
