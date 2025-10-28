#!/bin/bash
# Script de deployment para frontend a S3

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Deploy Frontend a S3${NC}"

# Variables
S3_BUCKET="${S3_BUCKET:-}"
CLOUDFRONT_DISTRIBUTION_ID="${CLOUDFRONT_DISTRIBUTION_ID:-}"
BACKEND_URL="${BACKEND_URL:-http://localhost:8080}"

# Validar
if [ -z "$S3_BUCKET" ]; then
  echo -e "${RED}❌ Error: S3_BUCKET no configurado${NC}"
  echo "Ejecuta: export S3_BUCKET=tu-bucket-name"
  exit 1
fi

# Build
echo -e "${YELLOW}📦 Compilando...${NC}"
export VITE_API_BASE_URL="$BACKEND_URL"

npm install
npm run build

echo -e "${GREEN}✅ Build completado${NC}"

# Deploy
echo -e "${YELLOW}📤 Subiendo a S3...${NC}"
aws s3 sync dist/ "s3://${S3_BUCKET}/" --delete

echo -e "${GREEN}✅ Upload completado${NC}"

# Invalidate CloudFront
if [ ! -z "$CLOUDFRONT_DISTRIBUTION_ID" ]; then
  echo -e "${YELLOW}♻️  Invalidando cache...${NC}"
  aws cloudfront create-invalidation \
    --distribution-id "$CLOUDFRONT_DISTRIBUTION_ID" \
    --paths "/*" > /dev/null
  echo -e "${GREEN}✅ Cache invalidado${NC}"
fi

# Get URLs
if [ ! -z "$CLOUDFRONT_DISTRIBUTION_ID" ]; then
  DOMAIN=$(aws cloudfront get-distribution \
    --id "$CLOUDFRONT_DISTRIBUTION_ID" \
    --query 'Distribution.DomainName' \
    --output text)
  echo -e "${GREEN}Frontend disponible en: https://${DOMAIN}${NC}"
else
  echo -e "${GREEN}Frontend disponible en: http://${S3_BUCKET}.s3-website-us-east-1.amazonaws.com${NC}"
fi

