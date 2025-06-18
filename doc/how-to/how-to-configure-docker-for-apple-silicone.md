# Docker on Apple Silicon Mac: Platform Compatibility Solutions

This document outlines solutions for running Docker containers that don't have native ARM64 support on Apple Silicon Macs (M1, M2, M3).

## The Problem

When trying to run Docker containers on an Apple Silicon Mac, you may encounter errors like:

```
Error response from daemon: no matching manifest for linux/arm64/v8 in the manifest list entries: no match for platform in manifest
```

This happens because the Docker image doesn't provide a version built for ARM64 architecture, which is what Apple Silicon Macs use.

## Solution 1: Set DOCKER_DEFAULT_PLATFORM Environment Variable

This approach tells Docker to automatically use emulation for all images.

### Temporary (Current Terminal Session)

```bash
export DOCKER_DEFAULT_PLATFORM=linux/amd64
```

### Notes:
- Simple, one-time setup
- Works for all Docker commands automatically
- Has to be set anew with each new terminal session


## Solution 2: Docker Compose Override Files

This approach uses override files to specify platform emulation only for specific services.

### Step 1: Create an Override File

Create a file named `docker-compose.arm64.yml`:

```yaml
services:
  postgres:
    platform: linux/amd64
  metabase:
    platform: linux/amd64
  # Add other services that need emulation
```

### Step 2: Use the Override File

```bash
docker compose -f ./docker-compose.yml -f ./docker-compose.local.yml -f ./docker-compose.arm64.yml up -d
```

### Step 3: Create Helper Scripts (Optional)

Create a script named `local-up.sh`:

```bash
#!/bin/bash
docker compose -f ./docker-compose.yml -f ./docker-compose.local.yml -f ./docker-compose.arm64.yml up -d
```

Make it executable:
```bash
chmod +x local-up.sh
```

### Step 4: Add to local git ignore

Add to your local Git exclude:
```bash
echo "docker-compose.arm64.yml" >> .git/info/exclude
echo "local-*.sh" >> .git/info/exclude
```

### Notes
- Offers replacement for `docker-compose.override.yml`
- Process can be repeated for ```docker-down``` and ```docker-restart``` scripts

## Additional Tips

1. **Check for ARM64 support**: Before assuming emulation is needed, check if the image supports ARM64:
   ```bash
   docker manifest inspect <image>:<tag> | grep 'arm64'
   ```

2. **Disabling platform emulation**: To disable the global setting temporarily:
   ```bash
   unset DOCKER_DEFAULT_PLATFORM
   ```
