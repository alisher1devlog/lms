#!/bin/bash
# GitHub Actions Health Check Script

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🔍 CI/CD Pipeline Health Check"
echo "=============================="

# Check 1: Workflow files exist
echo -e "\n${YELLOW}✓ Checking workflow files...${NC}"
workflows=(
  ".github/workflows/test.yml"
  ".github/workflows/build.yml"
  ".github/workflows/security.yml"
  ".github/workflows/lint.yml"
  ".github/workflows/deploy.yml"
  ".github/workflows/manual-deploy.yml"
)

for workflow in "${workflows[@]}"; do
  if [ -f "$workflow" ]; then
    echo -e "${GREEN}✓${NC} $workflow exists"
  else
    echo -e "${RED}✗${NC} $workflow missing"
  fi
done

# Check 2: Configuration files
echo -e "\n${YELLOW}✓ Checking configuration files...${NC}"
configs=(
  ".github/dependabot.yml"
  "Dockerfile"
  "docker-compose.yml"
  "package.json"
  "prisma/schema.prisma"
)

for config in "${configs[@]}"; do
  if [ -f "$config" ]; then
    echo -e "${GREEN}✓${NC} $config exists"
  else
    echo -e "${RED}✗${NC} $config missing"
  fi
done

# Check 3: Documentation files
echo -e "\n${YELLOW}✓ Checking documentation...${NC}"
docs=(
  ".github/README.md"
  ".github/CI-CD-GUIDE.md"
  ".github/DOCKER.md"
  ".github/SETUP-CHECKLIST.md"
  ".github/QUICK-REFERENCE.md"
)

for doc in "${docs[@]}"; do
  if [ -f "$doc" ]; then
    echo -e "${GREEN}✓${NC} $doc exists"
  else
    echo -e "${RED}✗${NC} $doc missing"
  fi
done

# Check 4: YAML syntax
echo -e "\n${YELLOW}✓ Checking YAML syntax...${NC}"
if command -v yamllint &> /dev/null; then
  yamllint .github/workflows/ .github/dependabot.yml 2>/dev/null && \
    echo -e "${GREEN}✓${NC} YAML syntax is valid" || \
    echo -e "${RED}✗${NC} YAML syntax errors found"
else
  echo -e "${YELLOW}⚠${NC} yamllint not installed (install with: npm install -g @stoplight/spectral-cli)"
fi

# Check 5: Required scripts in package.json
echo -e "\n${YELLOW}✓ Checking package.json scripts...${NC}"
required_scripts=(
  "build"
  "test"
  "test:cov"
  "test:e2e"
  "lint"
  "format"
)

for script in "${required_scripts[@]}"; do
  if grep -q "\"$script\"" package.json; then
    echo -e "${GREEN}✓${NC} Script '$script' exists"
  else
    echo -e "${RED}✗${NC} Script '$script' missing"
  fi
done

# Check 6: Environment setup
echo -e "\n${YELLOW}✓ Checking environment configuration...${NC}"
if [ -f ".env" ]; then
  echo -e "${GREEN}✓${NC} .env file exists"
else
  if [ -f ".env.example" ]; then
    echo -e "${YELLOW}⚠${NC} .env file missing (copy from .env.example)"
  else
    echo -e "${RED}✗${NC} Neither .env nor .env.example found"
  fi
fi

# Check 7: Git configuration
echo -e "\n${YELLOW}✓ Checking Git configuration...${NC}"
if git rev-parse --git-dir > /dev/null 2>&1; then
  echo -e "${GREEN}✓${NC} Git repository initialized"
  current_branch=$(git rev-parse --abbrev-ref HEAD)
  echo -e "${GREEN}✓${NC} Current branch: $current_branch"
else
  echo -e "${RED}✗${NC} Not a Git repository"
fi

# Check 8: Node.js version
echo -e "\n${YELLOW}✓ Checking Node.js setup...${NC}"
if command -v node &> /dev/null; then
  node_version=$(node -v)
  echo -e "${GREEN}✓${NC} Node.js $node_version installed"
else
  echo -e "${RED}✗${NC} Node.js not found"
fi

# Check 9: Dependencies installed
echo -e "\n${YELLOW}✓ Checking npm dependencies...${NC}"
if [ -d "node_modules" ]; then
  echo -e "${GREEN}✓${NC} node_modules directory exists"
else
  echo -e "${YELLOW}⚠${NC} node_modules not found (run: npm install)"
fi

# Summary
echo -e "\n${YELLOW}=============================${NC}"
echo "Health check complete!"
echo ""
echo "Next steps:"
echo "1. Push to GitHub: git push origin main"
echo "2. Configure secrets: Settings → Secrets and variables → Actions"
echo "3. Enable branch protection: Settings → Branches"
echo "4. View workflows: GitHub → Actions tab"
echo ""
echo "Documentation:"
echo "- README.md - Getting started"
echo "- CI-CD-GUIDE.md - Detailed guide"
echo "- SETUP-CHECKLIST.md - Setup verification"
echo "- QUICK-REFERENCE.md - Quick commands"
