#!/bin/bash
set -e

# Log everything to a file for debugging
exec > >(tee /var/log/user-data.log) 2>&1
echo "=== User Data Script Started at $(date) ==="

# Update package lists first
apt-get update -y

# Install basic tools
echo "Installing basic tools..."
apt-get install -y git htop nvtop tmux python3 python3-pip curl unzip

# Install uv for the ubuntu user
echo "Installing uv..."
curl -LsSf https://astral.sh/uv/install.sh | sudo -u ubuntu sh
echo 'export PATH="$HOME/.cargo/bin:$PATH"' >> /home/ubuntu/.bashrc

# TODO: need to confirm that this actually works as intended
# Mount instance store (ephemeral) storage if available
# g4dn.xlarge has 1x 125GB NVMe SSD at /dev/nvme1n1
echo "Checking for instance store..."
if [ -b /dev/nvme1n1 ]; then
  echo "Found instance store, formatting and mounting..."
  mkfs.ext4 /dev/nvme1n1
  mkdir -p /mnt/instance-store
  mount /dev/nvme1n1 /mnt/instance-store
  chown ubuntu:ubuntu /mnt/instance-store
  chmod 755 /mnt/instance-store
  echo "Instance store mounted at /mnt/instance-store"
else
  echo "No instance store found"
fi

# Create a flag file to indicate completion
touch /var/log/user-data-completed
echo "=== User Data Script Completed Successfully at $(date) ==="
