# LMS CI/CD Pipeline Documentation

## Overview
This document describes the CI/CD setup for the LMS (Learning Management System) project. The pipeline includes automated testing, building, security checks, and deployment workflows.

## Workflows

### 1. Test Workflow (`.github/workflows/test.yml`)
Runs on every push and pull request to `main` and `develop` branches.

**Steps:**
- Install dependencies
- Run ESLint for code quality
- Generate Prisma Client
- Run database migrations on test database
- Execute unit tests with coverage reports
- Upload coverage to Codecov
- Run E2E tests

**Triggers:** Push, Pull Request

### 2. Build Workflow (`.github/workflows/build.yml`)
Builds and pushes Docker images to GitHub Container Registry.

**Features:**
- Multi-stage Docker build (production target)
- Automatic tagging based on git refs and semantic versioning
- Docker layer caching
- Only pushes to registry on merge (not on PR)

**Triggers:** Push, Pull Request

**Tags Generated:**
- `develop` (branch)
- `main` (branch)
- `v1.0.0` (semantic version tags)
- `sha-xxx` (commit hash)

### 3. Security Workflow (`.github/workflows/security.yml`)
Runs dependency checks and CodeQL analysis.

**Features:**
- NPM audit for vulnerable dependencies
- GitHub CodeQL analysis for security vulnerabilities
- Scheduled daily runs at 2 AM UTC
- Runs on every push and PR

**Triggers:** Push, Pull Request, Daily Schedule (2 AM UTC)

### 4. Deploy Workflow (`.github/workflows/deploy.yml`)
Prepares and deploys application to production.

**Triggers:** Push to `main` branch or when a version tag is created

**Current Setup:** Template with TODO items for deployment configuration
- Build application
- Run tests
- Deployment notification

**Next Steps:** Configure deployment based on your infrastructure:
- SSH deployment to VPS
- Kubernetes deployment
- Docker Swarm deployment
- Cloud providers (AWS, GCP, Azure, DigitalOcean, Heroku, etc.)

## Environment Variables & Secrets

### Required Secrets (Configure in GitHub)
Add these in your repository settings (Settings → Secrets and variables → Actions):

#### For Deployment
- `DEPLOY_HOST`: IP or hostname of your production server
- `DEPLOY_USER`: SSH username for deployment server
- `DEPLOY_KEY`: Private SSH key for authentication

#### For Docker Registry (optional)
- `DOCKER_USERNAME`: Docker Hub username
- `DOCKER_PASSWORD`: Docker Hub password

#### For Notifications (optional)
- `SLACK_WEBHOOK`: Slack webhook URL for notifications
- `DISCORD_WEBHOOK`: Discord webhook URL for notifications
- `GMAIL_APP_PASSWORD`: Gmail app password for email notifications

### Repository Variables (Configure in GitHub)
Settings → Variables → Repository variables:
- `DOCKER_REGISTRY`: Docker registry URL (default: ghcr.io)
- `DEPLOY_ENVIRONMENT`: Production environment name

## Local Development

### Code Quality
```bash
# Format code
npm run format

# Run linter
npm run lint

# Run all checks
npm run lint && npm run format
```

### Testing
```bash
# Run unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:cov

# Run E2E tests
npm run test:e2e
```

### Building
```bash
# Build for production
npm run build

# Test production build locally
docker build -t lms:test .
docker run -p 3000:3000 lms:test
```

## Branch Protection Rules (Recommended)

Configure in GitHub repository settings:

1. **Main Branch:**
   - Require status checks to pass (test, build, security)
   - Require code reviews before merging (2-3 approvals)
   - Dismiss stale pull request approvals
   - Require branches to be up to date before merging

2. **Develop Branch:**
   - Require status checks to pass
   - Require at least 1 code review
   - Allow auto-merge after checks pass

## Deployment Steps (To Configure)

### Option 1: VPS/Dedicated Server
```bash
# SSH into server and run:
cd /app
git pull origin main
npm ci
npm run build
npx prisma migrate deploy
pm2 restart lms
```

### Option 2: Docker Swarm
1. Push image to registry
2. Update service with new image
3. Rollback if issues detected

### Option 3: Kubernetes
1. Push image to registry
2. Update deployment manifests
3. Apply with kubectl
4. Monitor rollout status

### Option 4: Cloud Platforms
- **Heroku:** Auto-deploy from GitHub
- **Railway/Render:** Connect Git repo
- **AWS ECS:** Update task definition
- **Google Cloud Run:** Deploy from container registry

## Health Checks

All workflows include:
- PostgreSQL health check (wait for DB to be ready)
- Test database cleanup after tests
- Docker layer caching for faster builds

## Monitoring & Alerts

Consider adding:
- Slack notifications for failed deployments
- Email alerts for security vulnerabilities
- Discord bot for CI/CD status updates
- Sentry for error tracking in production
- DataDog or New Relic for performance monitoring

## Troubleshooting

### Common Issues

**Tests failing locally but passing in CI:**
- Ensure `.env` matches test environment
- Check database state
- Verify Node version matches (20.x)

**Docker build failing:**
- Check Docker context (should be repository root)
- Ensure `.dockerignore` is configured
- Verify all dependencies in `package*.json`

**Deployment not triggering:**
- Check branch protection rules
- Verify workflow file syntax (`yamllint`)
- Confirm secrets are configured

**Database migrations failing:**
- Check `DATABASE_URL` is correct
- Ensure database is accessible
- Verify migration files exist in `prisma/migrations/`

## Maintenance

### Regular Tasks
- Review and update dependencies monthly
- Audit security vulnerabilities
- Clean up old Docker images
- Monitor CI/CD execution times
- Update Node.js version annually

### Version Updates
```bash
# Check for updates
npm outdated

# Update dependencies
npm update

# Update to latest major versions
npm install -g npm-check-updates
ncu -u
npm install
```

## References

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [NestJS Best Practices](https://docs.nestjs.com/)
- [Docker Multi-stage Builds](https://docs.docker.com/build/building/multi-stage/)
- [Prisma Migrations](https://www.prisma.io/docs/orm/prisma-migrate/understanding-prisma-migrate/overview)
- [GitHub Container Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
