#!/usr/bin/env sh
set -eu

systemctl start sshd
install -d -m 700 /home/nixos/.ssh
cat > /home/nixos/.ssh/authorized_keys <<'EOF'
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIL2PczMtCt6GcC3+65VeHlGmtm88fRGr1NkMIEGWV+oI tahaa755@yahoo.com
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAILC+GJEFH9GyE1ULQ2ZhCrTpJJ57G/A8gml1sOYF3e1p tahaa@AhmedPc
EOF
chown -R nixos:users /home/nixos/.ssh
chmod 600 /home/nixos/.ssh/authorized_keys
systemctl restart sshd
echo "SSH bootstrap complete."
