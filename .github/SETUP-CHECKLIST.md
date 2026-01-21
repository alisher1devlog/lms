# CI/CD Setup Checklist

Complete this checklist to fully set up the CI/CD pipeline for your LMS project.

## ✅ Phase 1: GitHub Repository Setup

- [ ] Repository is public or private (as desired)
- [ ] Repository has main branch protection enabled
- [ ] `.github/workflows/` directory is committed and pushed
- [ ] All workflow files are present:
  - [ ] `test.yml`
  - [ ] `build.yml`
  - [ ] `security.yml`
  - [ ] `lint.yml`
  - [ ] `deploy.yml`
  - [ ] `manual-deploy.yml`
- [ ] `dependabot.yml` is in `.github/`
- [ ] Documentation files are committed:
  - [ ] `CI-CD-GUIDE.md`
  - [ ] `DOCKER.md`
  - [ ] `README.md`

## ✅ Phase 2: Secrets Configuration

Go to **Settings → Secrets and variables → Actions**

### Deployment Secrets (Optional, for deploy.yml)
- [ ] `DEPLOY_HOST` - Add your server hostname/IP
- [ ] `DEPLOY_USER` - Add your SSH username
- [ ] `DEPLOY_KEY` - Add your private SSH key

### Docker Registry Secrets (If using private registry)
- [ ] `DOCKER_USERNAME` - Docker Hub username
- [ ] `DOCKER_PASSWORD` - Docker Hub token/password

### Notification Secrets (Optional)
- [ ] `SLACK_WEBHOOK` - Slack webhook URL
- [ ] `DISCORD_WEBHOOK` - Discord webhook URL

## ✅ Phase 3: Branch Protection Rules

Go to **Settings → Branches → Branch protection rules**

### For `main` branch:
- [ ] Require status checks to pass before merging
- [ ] Select required status checks:
  - [ ] `test`
  - [ ] `lint`
  - [ ] `build`
  - [ ] `security`
- [ ] Require code reviews before merging (recommend: 2)
- [ ] Dismiss stale pull request approvals
- [ ] Require branches to be up to date before merging
- [ ] Include administrators in restrictions (optional)

### For `develop` branch (optional):
- [ ] Require status checks to pass
- [ ] Require 1 code review
- [ ] Allow auto-merge with "squash and merge"

## ✅ Phase 4: Codecov Integration (Optional)

- [ ] Visit [codecov.io](https://codecov.io)
- [ ] Sign in with GitHub
- [ ] Authorize Codecov app
- [ ] Repository should appear in dashboard
- [ ] Coverage reports will auto-upload from CI

## ✅ Phase 5: Project Configuration

### Ensure project files are correct:
- [ ] `package.json` has required scripts:
  - [ ] `build`
  - [ ] `test`
  - [ ] `test:cov`
  - [ ] `test:e2e`
  - [ ] `lint`
  - [ ] `format`
- [ ] `Dockerfile` exists with multi-stage build
- [ ] `.dockerignore` exists
- [ ] `.eslintrc.js` exists
- [ ] `jest.config.js` exists
- [ ] `tsconfig.json` exists
- [ ] `prisma/schema.prisma` exists
- [ ] Database migrations are in `prisma/migrations/`

### Environment Configuration:
- [ ] `.env.example` file exists with template
- [ ] `.env` is in `.gitignore`
- [ ] GitHub Secrets match `.env` variables

## ✅ Phase 6: Local Testing

Run these commands locally to verify everything works:

```bash
# Install dependencies
npm ci

# Run linting
npm run lint

# Run unit tests
npm run test

# Generate coverage
npm run test:cov

# Build the project
npm run build

# Build Docker image
docker build -t lms:test .

# Run E2E tests (ensure DB is running)
npm run test:e2e
```

Verify outputs:
- [ ] No ESLint errors
- [ ] All tests pass
- [ ] Coverage report generated
- [ ] Build completes without errors
- [ ] Docker build succeeds

## ✅ Phase 7: First Pipeline Run

1. [ ] Push changes: `git push origin main`
2. [ ] Go to **Actions** tab in GitHub
3. [ ] Watch workflows execute in order:
   - [ ] `test` workflow runs and passes
   - [ ] `lint` workflow runs and passes
   - [ ] `build` workflow runs and passes
   - [ ] `security` workflow runs and passes
4. [ ] Check artifact uploads (coverage, etc.)
5. [ ] Verify Docker image is pushed to registry

## ✅ Phase 8: Configure Deployment (If Needed)

Choose your deployment method and configure:

### Option A: Manual Deployment
- [ ] Edit `.github/workflows/deploy.yml`
- [ ] Add SSH deployment steps
- [ ] Configure deployment secrets
- [ ] Test manual deployment from Actions tab

### Option B: VPS/Dedicated Server
- [ ] Set up SSH key pair
- [ ] Add public key to `~/.ssh/authorized_keys` on server
- [ ] Configure deploy secrets in GitHub
- [ ] Add deployment script to workflow

### Option C: Cloud Platform
Choose and configure one:
- [ ] **Railway:** Connect GitHub repo in dashboard
- [ ] **Render:** Create Web Service and connect repo
- [ ] **Heroku:** Connect GitHub app in settings
- [ ] **AWS ECS:** Set up task definition and service
- [ ] **Google Cloud Run:** Configure Cloud Build trigger
- [ ] **DigitalOcean:** Set up App Platform

### Option D: Kubernetes
- [ ] Set up cluster (local or cloud)
- [ ] Configure kubectl credentials
- [ ] Create deployment manifests
- [ ] Add kubectl deployment steps to workflow

## ✅ Phase 9: Monitoring Setup (Optional)

- [ ] Set up Codecov badge in README
- [ ] Configure GitHub Actions badge in README
- [ ] Set up workflow notifications:
  - [ ] Email notifications on failure
  - [ ] Slack channel for CI/CD updates
  - [ ] Discord server webhook
- [ ] Monitor build times and optimize
- [ ] Track test coverage trends

## ✅ Phase 10: Team Communication

- [ ] Share this checklist with team
- [ ] Document deployment procedure
- [ ] Create team wiki/docs with:
  - [ ] How to deploy manually
  - [ ] How to rollback
  - [ ] Incident response procedure
  - [ ] Emergency contacts
- [ ] Add CI/CD badge to main README.md

## 📋 Verification Steps

Run these to verify everything is working:

### GitHub Actions
```bash
# Navigate to Actions tab and verify:
- All workflow files appear in sidebar
- Recent runs show proper status
- Logs are available for each job
```

### Docker Registry
```bash
# Verify images were pushed
docker pull ghcr.io/[owner]/lms:main

# Run the image
docker run -p 3000:3000 ghcr.io/[owner]/lms:main
```

### Branch Protection
```bash
# Try to push directly to main (should fail)
git push origin HEAD:main  # Should be rejected

# Create PR and verify checks run
git push origin feature-branch
# Create PR on GitHub
# Verify all status checks pass before merge
```

## 🚨 Emergency Procedures

### If CI/CD is broken:
1. [ ] Check recent commits in `.github/workflows/`
2. [ ] Verify all YAML files are valid
3. [ ] Check if any secrets were removed
4. [ ] Review error logs in GitHub Actions
5. [ ] Roll back workflow changes if needed

### If deployment fails:
1. [ ] Check deployment logs in GitHub Actions
2. [ ] Verify server connectivity
3. [ ] Check if deployment secrets are configured
4. [ ] Review server error logs
5. [ ] Use manual deploy to recover if needed

### If tests are failing:
1. [ ] Run tests locally to reproduce
2. [ ] Check if environment variables are correct
3. [ ] Verify database migrations ran
4. [ ] Check for flaky tests
5. [ ] Review test logs in GitHub Actions

## 📊 Success Criteria

Your CI/CD setup is complete and working when:

- ✅ All workflows execute successfully on push
- ✅ Status checks prevent merging to main
- ✅ Code reviews are enforced
- ✅ Docker images are built and pushed
- ✅ Coverage reports are generated
- ✅ Security checks run daily
- ✅ Team can deploy with confidence
- ✅ Rollback procedures are documented

## 📝 Next Steps

1. [ ] Set up monitoring and alerting
2. [ ] Configure auto-deployment for production
3. [ ] Implement health checks
4. [ ] Set up log aggregation
5. [ ] Create runbooks for common issues
6. [ ] Schedule team training on CI/CD
7. [ ] Review and optimize pipeline monthly

---

**Documentation:** See [CI-CD-GUIDE.md](./CI-CD-GUIDE.md) for detailed information.

**Questions?** Check the troubleshooting section or review workflow logs in GitHub Actions.
