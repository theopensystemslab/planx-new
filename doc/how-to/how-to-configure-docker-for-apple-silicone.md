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

### Permanent (Add to Shell Profile)

For zsh:
```bash
echo 'export DOCKER_DEFAULT_PLATFORM=linux/amd64' >> ~/.zshrc
source ~/.zshrc
```

For bash:
```bash
echo 'export DOCKER_DEFAULT_PLATFORM=linux/amd64' >> ~/.bashrc
source ~/.bashrc
```

### Usage Example

After setting the environment variable, you can run Docker commands normally:

```bash
# For PlanX project
pnpm run up

# General Docker commands
docker run -it postgres:15
docker-compose up
```

### Pros
- Simple, one-time setup
- Works for all Docker commands automatically
- No need to modify project files
- Easy to disable when needed

### Cons
- Applies emulation to all containers (may affect performance)
- May use emulation even when ARM64 versions exist

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

### Step 4: Prevent Accidental Commits

Add to your local Git exclude:
```bash
echo "docker-compose.arm64.yml" >> .git/info/exclude
echo "local-*.sh" >> .git/info/exclude
```

### Pros
- Fine-grained control over which services use emulation
- Can improve performance by only emulating when necessary
- Can be project-specific
- Allows mixing native ARM64 and emulated x86_64 containers

### Cons
- More complex setup
- Requires modifying commands or creating scripts
- Needs to be set up for each project

## Which Approach Should You Choose?

### Use DOCKER_DEFAULT_PLATFORM if:
- You want a simple, system-wide solution
- You work with mostly older Docker images that lack ARM64 support
- You're not concerned about maximum performance

### Use Docker Compose overrides if:
- You need maximum performance from containers
- You want selective emulation (some containers with native ARM64, others emulated)
- You're working on a shared project where others don't use Apple Silicon

## Additional Tips

1. **Check for ARM64 support**: Before assuming emulation is needed, check if the image supports ARM64: 
   ```bash
   docker manifest inspect <image>:<tag> | grep 'arm64'
   ```

2. **Use ARM64-native alternatives**: When possible, use images that have native ARM64 support:
   - `postgres:latest` instead of `postgis/postgis:X-Y-alpine`
   - `arm64v8/postgres` instead of `postgres`

3. **Test performance**: Emulation adds overhead. If performance is critical, benchmark the difference between emulated and native containers.

4. **Disabling platform emulation**: To disable the global setting temporarily:
   ```bash
   unset DOCKER_DEFAULT_PLATFORM
   ```
