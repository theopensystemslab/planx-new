#!/bin/bash
set -e

# Log everything to a file for debugging
exec > >(tee /var/log/user-data.log) 2>&1
echo "=== User Data Script Started at $(date) ==="

# Update package lists first
apt-get update -y

# Install basic tools
echo "Installing basic tools..."
apt-get install -y git gh htop nvtop tmux python3 python3-pip curl unzip

# Install uv for the ubuntu user
echo "Installing uv..."
curl -LsSf https://astral.sh/uv/install.sh | sudo -u ubuntu sh
echo 'export PATH="$HOME/.cargo/bin:$PATH"' >> /home/ubuntu/.bashrc

# Check instance store status (already mounted by Deep Learning AMI)
echo "Checking instance store status..."
if [ -d /opt/dlami/nvme ]; then
  echo "Instance store is available at /opt/dlami/nvme"
  # Ensure ubuntu user has access to the instance store
  sudo chown -R ubuntu:ubuntu /opt/dlami/nvme
  chmod 755 /opt/dlami/nvme
  echo "Instance store permissions updated for ubuntu user"
  
  # Create a convenience symlink in ubuntu's home directory
  ln -sf /opt/dlami/nvme /home/ubuntu/nvme
  echo "Created symlink at /home/ubuntu/nvme -> /opt/dlami/nvme"
else
  echo "Instance store not found at expected location"
fi

# Create a flag file to indicate completion
touch /var/log/user-data-completed
echo "=== User Data Script Completed Successfully at $(date) ==="
