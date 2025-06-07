# 🔧 Configuration des Variables d'Environnement

Ce projet utilise des fichiers d'environnement séparés pour le développement et la production afin d'assurer une meilleure sécurité et organisation.

## 📁 Fichiers disponibles

### `env.exemple`
- **Fichier de référence** avec toutes les variables nécessaires
- **Documentation complète** de chaque variable
- **Ne pas modifier** - utilisé comme template

### `.env.dev`
- **Environnement de développement**
- Valeurs par défaut pour le développement local
- Base de données locale, clés Stripe TEST, etc.

### `.env.prod`
- **Environnement de production**
- Configuration sécurisée pour la production
- Clés Stripe LIVE, base de données de production, etc.

## 🚀 Utilisation

### Pour le développement
```bash
# Copiez le fichier de développement
cp .env.dev .env

# Éditez les valeurs selon vos besoins
nano .env
```

### Pour la production
```bash
# Copiez le fichier de production
cp .env.prod .env

# ⚠️ IMPORTANT : Remplissez TOUTES les valeurs requises
nano .env
```

## ⚠️ Sécurité

### Variables critiques à configurer en production :
- `BETTER_AUTH_SECRET` : Générez avec `openssl rand -base64 32`
- `DATABASE_URL` : URL de votre base de données de production
- `STRIPE_SECRET_KEY` : Utilisez la clé LIVE (sk_live_...)
- `AWS_ACCESS_KEY_ID` et `AWS_SECRET_ACCESS_KEY` : Clés de production

### Bonnes pratiques :
1. **Ne jamais commiter** les fichiers `.env*` avec de vraies valeurs
2. **Utiliser des mots de passe forts** et uniques
3. **Séparer les environnements** (buckets S3, bases de données, etc.)
4. **Surveiller les accès** et logs d'erreur
5. **Faire des sauvegardes** régulières

## 🔄 Migration depuis l'ancien système

Si vous aviez déjà un fichier `.env` :

```bash
# Sauvegardez votre ancien fichier
mv .env .env.backup

# Choisissez le bon template selon votre environnement
cp .env.dev .env  # pour le développement
# OU
cp .env.prod .env  # pour la production

# Copiez vos anciennes valeurs depuis .env.backup
```

## 📋 Variables par catégorie

### 🗄️ Base de données
- `DATABASE_URL` : Connexion PostgreSQL
- `DIRECT_URL` : URL directe Prisma (optionnel)

### 🔐 Authentification
- `BETTER_AUTH_SECRET` : Clé secrète (obligatoire)
- `BETTER_AUTH_URL` : URL de base de l'app

### 🌐 OAuth
- `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET`
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`

### 📧 Email
- `GMAIL_USER` / `GMAIL_APP_PASSWORD`

### 💳 Stripe
- `STRIPE_SECRET_KEY` : Clé secrète (TEST/LIVE)
- `STRIPE_WEBHOOK_SECRET` : Secret webhook
- Prix IDs et URLs publiques

### 📦 Stockage S3
- `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY`
- `S3_BUCKET_NAME` : Nom du bucket
- `AWS_ENDPOINT_URL_S3` : Endpoint (Tigris par défaut)

### 🐳 Docker
- `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB`

## 🆘 Aide

En cas de problème :
1. Vérifiez que toutes les variables obligatoires sont remplies
2. Consultez les logs d'erreur de l'application
3. Vérifiez les permissions des services externes (Stripe, S3, etc.)
4. Assurez-vous que les URLs sont correctes (HTTP vs HTTPS)