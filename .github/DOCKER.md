# LMS Application - Docker Compose for Development

This directory contains Docker configuration files for the LMS application.

## Files

- **Dockerfile** - Multi-stage Docker build configuration
  - `builder` stage: Compiles the TypeScript application
  - `production` stage: Minimal production image
  - `development` stage: Development environment with watch mode

- **docker-compose.yml** - Development environment with PostgreSQL and Prisma Studio

- **docker-compose.prod.yml** - Production environment configuration

## Quick Start

```bash
# Start development environment
docker-compose up -d

# View logs
docker-compose logs -f app

# Access the application
curl http://localhost:3000

# Stop containers
docker-compose down
```

## Building Docker Images

```bash
# Build for development
docker build --target development -t lms:dev .

# Build for production
docker build --target production -t lms:latest .

# Run production image
docker run -p 3000:3000 -e DATABASE_URL=postgresql://... lms:latest
```

## GitHub Actions Workflows

The following CI/CD workflows are configured:

1. **test.yml** - Run tests, linting, and coverage
2. **build.yml** - Build and push Docker images to GitHub Container Registry
3. **security.yml** - Security checks and CodeQL analysis
4. **deploy.yml** - Deployment to production (template)
5. **lint.yml** - Code quality checks

## Configuration

All Docker services use environment variables from `.env` file or GitHub Secrets.

See `.env.example` for required environment variables.
