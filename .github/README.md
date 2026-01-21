# LMS - CI/CD Pipeline Setup

A complete continuous integration and deployment pipeline for the LMS (Learning Management System) NestJS application.

## 📋 Overview

This CI/CD setup includes:

- ✅ **Automated Testing** - Unit, integration, and E2E tests on every push/PR
- 🔍 **Code Quality** - ESLint, Prettier, and YAML linting
- 🔐 **Security Checks** - Dependency vulnerabilities and CodeQL analysis
- 🐳 **Docker Build & Registry** - Multi-stage builds pushed to GitHub Container Registry
- 📦 **Dependency Management** - Dependabot for automated updates
- 🚀 **Deployment** - Automated deployment to production
- 🔔 **Health Checks** - Database readiness verification

## 📁 Workflow Files

```
.github/
├── workflows/
│   ├── test.yml              # Testing pipeline
│   ├── build.yml             # Docker build & push
│   ├── security.yml          # Security & vulnerability checks
│   ├── deploy.yml            # Production deployment
│   ├── manual-deploy.yml     # Manual deployment trigger
│   └── lint.yml              # Code quality checks
├── dependabot.yml            # Automated dependency updates
├── CI-CD-GUIDE.md            # Detailed CI/CD documentation
└── DOCKER.md                 # Docker configuration guide
```

## 🚀 Getting Started

### 1. Push to GitHub

```bash
git add .
git commit -m "feat: add CI/CD pipeline"
git push origin main
```

### 2. Configure Repository Secrets

Go to **Settings → Secrets and variables → Actions** and add:

#### For Deployment
- `DEPLOY_HOST` - Your server IP/hostname
- `DEPLOY_USER` - SSH username
- `DEPLOY_KEY` - Private SSH key

#### For Docker Registry (if using private registry)
- `DOCKER_USERNAME` - Docker credentials
- `DOCKER_PASSWORD` - Docker credentials

#### For Notifications (optional)
- `SLACK_WEBHOOK` - For Slack notifications
- `DISCORD_WEBHOOK` - For Discord notifications

### 3. Configure Branch Protection Rules

Go to **Settings → Branches → Branch protection rules**

For `main` branch:
- ✓ Require status checks to pass (test, build, security)
- ✓ Require code reviews (2+ approvals recommended)
- ✓ Require branches to be up to date
- ✓ Dismiss stale reviews on push

## 📊 Workflow Status

Each workflow has different triggers:

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| **test.yml** | Push, PR | Run tests & coverage |
| **lint.yml** | Push, PR | Code quality checks |
| **build.yml** | Push, PR | Build Docker image |
| **security.yml** | Push, PR, Daily | Security analysis |
| **deploy.yml** | Push to main | Deploy to production |
| **manual-deploy.yml** | Manual dispatch | Deploy anytime |

## 🔄 Pipeline Flow

```
Push to GitHub
    ↓
├─→ Tests (unit, integration, E2E)
├─→ Linting (ESLint, Prettier, YAML)
├─→ Security (npm audit, CodeQL)
├─→ Build Docker Image
    ↓
All checks pass?
    ↓
├─→ NO → Fail & notify developer
└─→ YES → Ready to merge
         ↓
    Merge to main?
         ↓
    Trigger Production Deployment
```

## 📝 Workflow Details

### Test Workflow
Runs comprehensive testing suite:
- Installs dependencies
- Generates Prisma Client
- Runs database migrations on test DB
- Executes unit tests with coverage
- Uploads coverage to Codecov
- Runs E2E tests

**Services:**
- PostgreSQL 16 (test database)

### Build Workflow
Builds Docker images and pushes to registry:
- Uses multi-stage Dockerfile (production target)
- Implements layer caching for speed
- Auto-generates tags (branch, semver, commit)
- Only pushes on successful merge (not on PR)

**Registry:** `ghcr.io/[owner]/[repo]`

### Security Workflow
Proactive security monitoring:
- NPM audit for dependencies
- CodeQL analysis for code vulnerabilities
- Daily scheduled runs (2 AM UTC)
- Reports to GitHub Security tab

### Lint Workflow
Code quality enforcement:
- ESLint for JavaScript/TypeScript
- Prettier for code formatting
- YAML linting for workflows
- Hadolint for Dockerfile

### Deploy Workflow
Production deployment (template):
- Builds application
- Runs tests
- Sends deployment notification
- **TODO:** Configure for your infrastructure

### Manual Deploy Workflow
On-demand deployment control:
- Choose environment (staging/production)
- Optional version specification
- Requires workflow_dispatch trigger
- Full audit trail in GitHub

## 🎯 Key Features

### Automated Testing
```bash
# Local: Run the same tests as CI
npm run test:cov        # Unit tests with coverage
npm run test:e2e        # End-to-end tests
npm run lint            # Code quality checks
```

### Docker Image Management
```bash
# Pull images from registry
docker pull ghcr.io/[owner]/lms:main

# Run production image
docker run -p 3000:3000 ghcr.io/[owner]/lms:main
```

### Dependency Updates
Dependabot automatically:
- Checks for updates weekly
- Creates pull requests for new versions
- Runs CI checks on update PRs
- Auto-merges patch updates (optional)

## 🔐 Security Best Practices

1. **Branch Protection**
   - Require status checks before merge
   - Require code reviews
   - Dismiss stale reviews
   - Require up-to-date branches

2. **Secrets Management**
   - Never commit `.env` files
   - Use GitHub Secrets for sensitive data
   - Rotate keys regularly
   - Use personal access tokens with minimal scope

3. **Container Security**
   - Use specific Node version (20.x)
   - Alpine base image (smaller attack surface)
   - Regular dependency updates
   - Security scanning in CI

## 📈 Monitoring & Observability

### Coverage Tracking
Coverage reports are uploaded to Codecov automatically.

Visit: `https://codecov.io/gh/[owner]/lms`

### Build Metrics
Monitor in GitHub Actions:
- Workflow execution time
- Test coverage trends
- Failure rates
- Most common errors

### Performance
The setup includes:
- Docker layer caching (faster builds)
- Parallel job execution
- Node modules caching
- Optimized test setup

## 🛠️ Customization

### Add Slack Notifications

```yaml
- name: Slack notification
  uses: 8398a7/action-slack@v3
  if: failure()
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### Add Email Notifications

```yaml
- name: Send email
  uses: dawidd6/action-send-mail@v3
  if: failure()
  with:
    server_address: smtp.gmail.com
    server_port: 465
    username: ${{ secrets.GMAIL_USER }}
    password: ${{ secrets.GMAIL_PASSWORD }}
```

### Deploy to Specific Infrastructure

Edit `.github/workflows/deploy.yml` and add your deployment steps:

**VPS/Dedicated Server:**
```yaml
- name: Deploy via SSH
  uses: appleboy/ssh-action@master
  with:
    host: ${{ secrets.DEPLOY_HOST }}
    username: ${{ secrets.DEPLOY_USER }}
    key: ${{ secrets.DEPLOY_KEY }}
    script: |
      cd /app && git pull && npm ci && npm run build && npx prisma migrate deploy
```

**Kubernetes:**
```yaml
- name: Deploy to K8s
  run: |
    kubectl set image deployment/lms-app lms-app=ghcr.io/[owner]/lms:latest
    kubectl rollout status deployment/lms-app
```

**Cloud Platforms:**
- **Railway/Render:** Connect Git repo directly
- **Heroku:** Use `akhileshns/heroku-deploy@v3.12.12`
- **AWS ECS:** Use `aws-actions/ecs-deploy-task-definition`
- **Google Cloud Run:** Use `google-github-actions/deploy-cloudrun`

## ❓ Troubleshooting

### Tests Fail Locally but Pass in CI
- Check `.env` file configuration
- Verify database state
- Ensure Node version matches
- Clear node_modules: `rm -rf node_modules && npm ci`

### Workflows Not Running
- Verify workflow syntax (use `yamllint`)
- Check branch protection settings
- Ensure workflow file is in `.github/workflows/`
- Verify file permissions (should be readable)

### Docker Build Failures
- Check `.dockerignore` excludes unnecessary files
- Verify all required files are in context
- Check `Dockerfile` for typos
- Ensure base image is accessible

### Database Connection Issues
- Verify `DATABASE_URL` format
- Check PostgreSQL container is healthy
- Review migration files in `prisma/migrations/`
- Check database credentials

### Deployment Fails
- Verify secrets are configured
- Check server connectivity
- Review deployment script syntax
- Check logs: `docker logs <container_id>`

## 📚 Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [NestJS Deployment Guide](https://docs.nestjs.com/deployment/introduction)
- [Prisma Migrations](https://www.prisma.io/docs/orm/prisma-migrate/understanding-prisma-migrate/overview)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Container Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)

## 🤝 Contributing

When contributing:
1. Create feature branch: `git checkout -b feature/name`
2. Make changes and commit
3. Push to GitHub: `git push origin feature/name`
4. Create Pull Request
5. Wait for CI/CD checks to pass
6. Request code review
7. Merge when approved

## 📞 Support

For issues or questions:
1. Check the [CI-CD-GUIDE.md](.github/CI-CD-GUIDE.md)
2. Review [DOCKER.md](.github/DOCKER.md)
3. Check GitHub Issues
4. Review workflow logs in GitHub Actions

---

**Last Updated:** January 2026
**Maintainer:** LMS Team
