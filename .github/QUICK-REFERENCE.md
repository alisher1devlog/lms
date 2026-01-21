# CI/CD Quick Reference

Quick commands and links for daily CI/CD operations.

## 🎯 Common Tasks

### Push Code
```bash
# Create and push feature branch
git checkout -b feature/my-feature
git commit -am "feat: my changes"
git push origin feature/my-feature

# Create Pull Request on GitHub
# Wait for checks to pass
# Request review and merge
```

### Deploy to Production
```bash
# Option 1: Merge to main (auto-deploys if configured)
git push origin main

# Option 2: Manual deployment
# Go to GitHub → Actions → Manual Deployment
# Select environment and version
# Click "Run workflow"
```

### Check Test Results
```bash
# Local
npm test                    # Run all tests
npm run test:cov           # With coverage
npm run test:watch         # Watch mode
npm run test:e2e           # End-to-end tests

# GitHub Actions
# https://github.com/[owner]/lms/actions
```

### View Docker Images
```bash
# Pull image
docker pull ghcr.io/[owner]/lms:main

# List local images
docker images | grep lms

# Run image
docker run -p 3000:3000 ghcr.io/[owner]/lms:main
```

## 🔗 Quick Links

### GitHub
- **Repository:** https://github.com/[owner]/lms
- **Actions:** https://github.com/[owner]/lms/actions
- **Deployments:** https://github.com/[owner]/lms/deployments
- **Pull Requests:** https://github.com/[owner]/lms/pulls
- **Issues:** https://github.com/[owner]/lms/issues

### Monitoring
- **Codecov:** https://codecov.io/gh/[owner]/lms
- **GitHub Status:** https://www.githubstatus.com
- **Build Status Badge:** `![CI](https://github.com/[owner]/lms/workflows/Test/badge.svg)`

## 📊 Workflow Status

| Workflow | Branch | Status |
|----------|--------|--------|
| Test | main, develop | [![test](https://github.com/[owner]/lms/workflows/Test/badge.svg)](https://github.com/[owner]/lms/actions) |
| Build | main, develop | [![build](https://github.com/[owner]/lms/workflows/Build/badge.svg)](https://github.com/[owner]/lms/actions) |
| Security | all | [![security](https://github.com/[owner]/lms/workflows/Security/badge.svg)](https://github.com/[owner]/lms/actions) |
| Deploy | main | [![deploy](https://github.com/[owner]/lms/workflows/Deploy/badge.svg)](https://github.com/[owner]/lms/actions) |

## 🆘 Troubleshooting

### Workflow Won't Run
```bash
# Check syntax
yamllint .github/workflows/*.yml

# Check if file exists
ls -la .github/workflows/

# Verify branch name matches trigger
git branch -a
```

### Tests Failing
```bash
# Run locally first
npm ci
npm run test

# Check environment
cat .env
echo $DATABASE_URL

# Run with debugging
NODE_DEBUG=* npm run test
```

### Docker Build Failing
```bash
# Build locally
docker build -t lms:test .

# Check Dockerfile
cat Dockerfile

# View build logs
docker build -t lms:test . --progress=plain
```

### Deployment Not Triggering
- Check branch name (must be `main` or matching tags)
- Verify branch protection rules
- Check if all status checks passed
- Review deployment logs in Actions

## 🔐 Managing Secrets

### Add Secret
1. Go to Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Name: `SECRET_NAME`
4. Value: paste secret value
5. Click "Add secret"

### Use Secret in Workflow
```yaml
- name: Deploy
  env:
    DEPLOY_HOST: ${{ secrets.DEPLOY_HOST }}
    DEPLOY_KEY: ${{ secrets.DEPLOY_KEY }}
  run: |
    # Use $DEPLOY_HOST and $DEPLOY_KEY
```

### Rotate Secrets
```bash
# Generate new value
openssl rand -base64 32

# Update in GitHub Settings
# Update in environment/server if needed
```

## 📈 Performance Optimization

### Speed Up Builds
```bash
# Use npm ci instead of npm install
npm ci

# Cache node_modules
# (Already configured in workflows)

# Use --prefer-offline
npm ci --prefer-offline

# Parallel test execution
npm run test -- --maxWorkers=4
```

### Reduce Image Size
```dockerfile
# Use alpine base (done in Dockerfile)
FROM node:20-alpine

# Only install production deps
RUN npm ci --only=production

# Use multi-stage builds (done in Dockerfile)
```

## 📋 Environment Variables

### Local Development
```bash
# Copy example
cp .env.example .env

# Edit with your values
nano .env

# Source in shell
source .env
```

### GitHub Actions
Secrets: `Settings → Secrets and variables → Actions`

Variables: `Settings → Variables → Repository variables`

```yaml
env:
  NODE_ENV: production
  NODE_OPTIONS: --max-old-space-size=4096

jobs:
  test:
    runs-on: ubuntu-latest
    env:
      DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

## 🔄 Deployment Rollback

### Manual Rollback
```bash
# View deployment history
git log --oneline | head -20

# Revert to previous version
git revert <commit-hash>
git push origin main

# Or checkout previous tag
git checkout v1.0.0
git push origin HEAD:main
```

### Docker Rollback
```bash
# See previous images
docker image ls

# Deploy previous image
docker pull ghcr.io/[owner]/lms:v1.0.0
docker run -p 3000:3000 ghcr.io/[owner]/lms:v1.0.0
```

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| [README.md](./README.md) | Overview and getting started |
| [CI-CD-GUIDE.md](./CI-CD-GUIDE.md) | Detailed CI/CD documentation |
| [DOCKER.md](./DOCKER.md) | Docker configuration guide |
| [SETUP-CHECKLIST.md](./SETUP-CHECKLIST.md) | Setup verification checklist |

## 💡 Tips & Tricks

### View Logs
```bash
# GitHub CLI (if installed)
gh run list
gh run view <run-id>

# Or in browser
https://github.com/[owner]/lms/actions
```

### Test Locally Before Pushing
```bash
# Run all checks locally
npm run lint && npm run test:cov && npm run build

# Test Docker locally
docker-compose up
docker-compose exec app npm run test
```

### Skip CI Temporarily
```bash
# Skip all workflows
git commit -m "WIP: testing something [skip ci]"

# Or in commit message
git commit -m "docs: update README

[skip ci]"
```

### Force Refresh Workflows
```bash
# Close and reopen PR
# This triggers all checks again

# Or run workflow manually
# GitHub Actions → Choose workflow → Run workflow
```

## 🎓 Learning Resources

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [NestJS Docs](https://docs.nestjs.com)
- [Prisma Docs](https://www.prisma.io/docs)
- [Docker Docs](https://docs.docker.com)
- [GitHub CLI Docs](https://cli.github.com/manual)

---

**Last Updated:** January 2026

For detailed information, see [CI-CD-GUIDE.md](./CI-CD-GUIDE.md)
