# Fichier d'exemple pour l'environnement de développement
# Copiez ce fichier vers .env et remplissez vos valeurs

# === BASE DE DONNÉES ===
DATABASE_URL="postgresql://postgres:password@localhost:5432/nextjs_boilerplate_dev"
DIRECT_URL="postgresql://postgres:password@localhost:5432/nextjs_boilerplate_dev"

# === AUTHENTIFICATION (Better Auth) ===
BETTER_AUTH_SECRET="dev-secret-key-change-in-production"
BETTER_AUTH_URL="http://localhost:3000"

# === PROVIDERS OAUTH ===
# GitHub OAuth (optionnel)
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""

# Google OAuth (optionnel)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# === EMAILS (Gmail SMTP) ===
GMAIL_USER=""
GMAIL_APP_PASSWORD=""

# === APPLICATION ===
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# === STRIPE (Paiements) - MODE TEST ===
STRIPE_SECRET_KEY=""
STRIPE_WEBHOOK_SECRET=""

# IDs des produits Stripe TEST
STRIPE_MONTHLY_PRICE_ID=""
STRIPE_YEARLY_PRICE_ID=""

# URLs publiques Stripe TEST
NEXT_PUBLIC_STRIPE_LINK_MONTHLY_PRICE_ID=""
NEXT_PUBLIC_STRIPE_LINK_YEARLY_PRICE_ID=""
NEXT_PUBLIC_STRIPE_CUSTOMER_PORTAL_URL=""

# === STOCKAGE S3 (AWS/Tigris) ===
AWS_ACCESS_KEY_ID=""
AWS_SECRET_ACCESS_KEY=""
AWS_REGION="auto"
AWS_ENDPOINT_URL_S3="https://fly.storage.tigris.dev"
S3_BUCKET_NAME="nextjs-boilerplate-dev"

# === DOCKER (Base de données locale) ===
POSTGRES_PASSWORD="password"
POSTGRES_USER="postgres"
POSTGRES_DB="nextjs_boilerplate_dev"