#!/usr/bin/env sh
set -eu

echo "Checking mounted target filesystems..."
mountpoint -q /mnt || { echo "Error: /mnt is not mounted."; exit 1; }
mountpoint -q /mnt/boot || { echo "Error: /mnt/boot is not mounted."; exit 1; }

echo "Stopping any stale install processes..."
pkill -f 'nixos-install --root /mnt --no-root-passwd' || true
pkill -f 'nix-build --out-link /mnt/tmp' || true
sleep 3
pkill -9 -f 'nixos-install --root /mnt --no-root-passwd' || true
pkill -9 -f 'nix-build --out-link /mnt/tmp' || true

echo "Current mounts:"
mount | grep -E ' /mnt | /mnt/boot ' || true
echo "Current swap:"
swapon --show || true

echo "Restarting nixos-install..."
echo "A full log will be written to /tmp/nixos-install.log"
nixos-install --root /mnt --no-root-passwd 2>&1 | tee /tmp/nixos-install.log
