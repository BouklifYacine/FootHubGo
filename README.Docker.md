# Guide Docker pour FootHubGo

Ce guide explique comment utiliser Docker pour développer et déployer l'application FootHubGo.

## Prérequis

- Docker et Docker Compose installés sur votre machine
- Un fichier `.env` configuré (basé sur `env.exemple`)

## Configuration de l'environnement

Avant de lancer l'application avec Docker, assurez-vous de configurer votre fichier `.env` avec les variables nécessaires :

```bash
# Copiez le fichier d'exemple
cp env.exemple .env

# Éditez le fichier .env avec vos propres valeurs
```

### Variables essentielles pour Docker :

**Base de données :**
- `DATABASE_URL` : URL de connexion PostgreSQL
- `DIRECT_URL` : URL directe pour Prisma (optionnel)

**Authentification :**
- `BETTER_AUTH_SECRET` : Clé secrète pour Better Auth
- `BETTER_AUTH_URL` : URL de votre application (ex: http://localhost:3000)

**OAuth (optionnel) :**
- `GOOGLE_CLIENT_ID` et `GOOGLE_CLIENT_SECRET`
- `GITHUB_CLIENT_ID` et `GITHUB_CLIENT_SECRET`

**Email (optionnel) :**
- `GMAIL_USER` et `GMAIL_PASS` pour l'envoi d'emails

**Stockage S3/Tigris (optionnel) :**
- `S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_BUCKET_NAME`, `S3_ENDPOINT`

**Stripe (optionnel) :**
- `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`

**Docker :**
- `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` pour le conteneur PostgreSQL

## Commandes Docker simplifiées

### Mode Développement

```bash
# Démarrer l'application en mode développement
docker compose -f docker-compose.dev.yml up --build -d

# Arrêter l'application
docker compose -f docker-compose.dev.yml down

# Voir les logs
docker logs -f devgo-dev

# Exécuter des commandes dans le conteneur (ex: Prisma)
docker exec -it devgo-dev npx prisma migrate dev
```

### Mode Production

```bash
# Démarrer l'application en mode production
docker compose up --build -d

# Arrêter l'application
docker compose down

# Voir les logs
docker logs -f devgo-prod

# Exécuter des commandes dans le conteneur (ex: Prisma)
docker exec -it devgo-prod npx prisma migrate deploy
```

## Caractéristiques des images Docker

### Image de développement (1.78GB)

- Nom du conteneur: `devgo-dev`
- Nom de l'image: `foothubgo-dev:latest`
- **Hot reload** activé avec Turbopack
- **Variables d'environnement** de développement
- **Outils de debugging** disponibles
- **Volume monté** pour le code source
- **Prisma Studio** accessible
- **Support complet** des fonctionnalités de développement
- Base de données PostgreSQL accessible sur le port 5432

### Image de production (319MB)

- Nom du conteneur: `devgo-prod`
- Nom de l'image: `foothubgo-prod:latest`
- **Application optimisée** et minifiée avec Next.js
- **Variables d'environnement** de production sécurisées
- **Sécurité renforcée** avec utilisateur non-root
- **Taille d'image réduite** avec multi-stage build
- **Performance optimisée** pour la production
- **Support S3/Tigris** pour le stockage de fichiers
- **Intégration Stripe** pour les paiements
- **Système d'email** configuré

## Accès à l'application

Une fois les conteneurs démarrés, vous pouvez accéder à :

- **Application principale** : http://localhost:3000
- **Base de données PostgreSQL** : localhost:5432
  - Utilisateur : tel que défini dans votre fichier `.env`
  - Mot de passe : tel que défini dans votre fichier `.env`
  - Base de données : tel que défini dans votre fichier `.env`

## Fonctionnalités disponibles avec Docker

### 🔐 Authentification complète
- Inscription/Connexion avec email/mot de passe
- Authentification OAuth (Google, GitHub)
- Gestion des sessions sécurisées
- Réinitialisation de mot de passe par email

### 👤 Gestion des profils utilisateurs
- Upload de photo de profil vers S3/Tigris
- Modification des informations personnelles
- Changement de mot de passe
- Suppression de compte

### 💳 Système de paiement Stripe
- Abonnements mensuels et annuels
- Gestion des paiements sécurisés
- Webhooks Stripe intégrés
- Dashboard des revenus

### 📊 Dashboard administrateur
- Statistiques des utilisateurs
- Gestion des rôles et permissions
- Suivi des abonnements et revenus
- Interface d'administration complète

### 📧 Système d'email transactionnel
- Emails de bienvenue
- Notifications de paiement
- Réinitialisation de mot de passe
- Templates React Email

### 🎨 Interface moderne
- Thème sombre/clair avec next-themes
- Composants shadcn/ui
- Design responsive
- Animations Framer Motion

## Différences principales entre développement et production

| Fonctionnalité | Développement | Production |
|----------------|---------------|------------|
| Hot-reload | ✅ | ❌ |
| Taille de l'image | 1.78GB | 319MB |
| Volumes montés | ✅ | ❌ |
| Optimisation | ❌ | ✅ |
| Utilisateur non-root | ❌ | ✅ |
| Fichier Docker | dockerfile.dev | dockerfile |
| Fichier Compose | docker-compose.dev.yml | compose.yaml |

## Dépannage

### Problèmes de connexion à la base de données

Si l'application ne peut pas se connecter à la base de données, vérifiez :

1. Que les variables d'environnement dans le fichier `.env` sont correctes
2. Que le conteneur de la base de données est bien démarré : `docker ps | grep db`
3. Que vous pouvez vous connecter à la base de données : `docker exec -it devgo-prod-db psql -U postgres`

### Problèmes de migration Prisma

Pour appliquer les migrations Prisma :

```bash
# En développement
docker exec -it devgo-dev npx prisma migrate dev

# En production
docker exec -it devgo-prod npx prisma migrate deploy
```

### Redémarrer les conteneurs

```bash
# En développement
docker restart devgo-dev devgo-dev-db

# En production
docker restart devgo-prod devgo-prod-db
```