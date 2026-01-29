#!/usr/bin/env bash
set -e

# Deploy script per Surge — usa dominio sbobinamente.it

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT_DIR"

# Nuova modalità: ./deploy.sh check
if [ "$1" = "check" ]; then
  echo "=== SURGE / DOMINIO DIAGNOSTICS ==="
  echo ""
  echo "-- Surge account (whoami) --"
  npx surge whoami || echo "(not logged in or surge not installed)"
  echo ""
  echo "-- Last publish check (Surge will not overwrite in check mode) --"
  echo "Checking surge.sites (attempting simple status via curl)..."
  curl -I https://sbobinamente.it 2>/dev/null || true
  echo ""
  curl -I https://sbobinamente.surge.sh 2>/dev/null || true
  echo ""
  echo "-- DNS resolution --"
  dig +short sbobinamente.it || true
  echo ""
  nslookup sbobinamente.it || true
  echo ""
  echo "-- Files present in project root --"
  ls -la
  echo ""
  echo "-- Check CNAME file (if any) --"
  if [ -f CNAME ]; then
    echo "CNAME content:"
    cat CNAME
  else
    echo "No CNAME file found."
  fi
  echo ""
  echo "-- Check for build/ or dist/ directories --"
  [ -d build ] && echo "build/ exists" || echo "no build/"
  [ -d dist ] && echo "dist/ exists" || echo "no dist/"
  echo ""
  echo "-- Check index.html in root and in build/ (if exists) --"
  [ -f index.html ] && echo "index.html present in root" || echo "index.html NOT present in root"
  [ -f build/index.html ] && echo "index.html present in build/" || echo "index.html NOT present in build/"
  echo ""
  echo "=== END DIAGNOSTICS ==="
  exit 0
fi

# Nuova modalità: ./deploy.sh ssl-check
if [ "$1" = "ssl-check" ]; then
  DOMAIN="sbobinamente.it"
  MAX_TRIES=30        # tentativi
  SLEEP_SEC=10        # intervallo tra i tentativi
  echo "Checking TLS certificate for $DOMAIN (max $((MAX_TRIES*SLEEP_SEC))s)..."

  i=0
  while [ $i -lt $MAX_TRIES ]; do
    ((i++))
    echo "Attempt $i/$MAX_TRIES..."
    # estrai certificato e cerca Subject Alternative Name / Common Name
    CERT_TEXT="$(openssl s_client -connect ${DOMAIN}:443 -servername ${DOMAIN} </dev/null 2>/dev/null | openssl x509 -noout -text 2>/dev/null || true)"
    if [ -n "$CERT_TEXT" ]; then
      # cerca SAN
      SAN_LINE="$(echo "$CERT_TEXT" | sed -n '/Subject Alternative Name/,$p' | sed -n '1,5p' || true)"
      CN_LINE="$(echo "$CERT_TEXT" | sed -n '1,40p' | grep 'Subject:' || true)"

      echo "Certificate found. Checking SAN/CN..."
      echo "$SAN_LINE" | grep -q "$DOMAIN" && { echo "OK: $DOMAIN present in SAN."; exit 0; }
      echo "$CN_LINE" | grep -q "$DOMAIN" && { echo "OK: $DOMAIN present in CN."; exit 0; }

      echo "Not yet valid for $DOMAIN. Waiting $SLEEP_SEC seconds..."
    else
      echo "No certificate returned (server may not be ready). Waiting $SLEEP_SEC seconds..."
    fi

    sleep $SLEEP_SEC
  done

  echo "Timeout: certificate not valid for $DOMAIN after $((MAX_TRIES*SLEEP_SEC)) seconds."
  echo "Controlla DNS/nameserver e la dashboard Surge; può richiedere più tempo per emettere il certificato."
  exit 1
fi

echo "Deploy: SbobinaMente (directory: $ROOT_DIR)"

# If package.json has a build script, run it and deploy build/ or dist/
if [ -f package.json ] && grep -q '"build"' package.json; then
  echo "Found package.json with build script. Running npm install && npm run build..."
  npm install
  npm run build

  if [ -d build ]; then
    PUBLISH_DIR="build"
  elif [ -d dist ]; then
    PUBLISH_DIR="dist"
  else
    echo "Build completed but no build/ or dist/ directory found — deploying root instead."
    npx surge ./ --domain sbobinamente.it
    exit 0
  fi

  echo "Publishing directory: $PUBLISH_DIR"
  npx surge "$PUBLISH_DIR" --domain sbobinamente.it
  exit 0
fi

# No build step — publish current directory
echo "No build step detected. Publishing project root..."
npx surge ./ --domain sbobinamente.it