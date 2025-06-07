# 🚀 NextJS Projet Boilerplate

Une boilerplate moderne et complète pour construire des applications web full-stack avec Next.js 15, conçue pour une expérience de développement optimale et permettre de se concentrer sur les fonctionnalités métier.

## ✨ Fonctionnalités Principales

### 🔐 Authentification & Autorisation & Profil
- **Authentification complète** avec email/mot de passe (Better Auth)
- **Connexion via providers** (Google, GitHub) avec OAuth
- **Gestion complète du profil utilisateur** :
  - Modification de l'email avec notification
  - Changement de mot de passe sécurisé + notification par email
  - Mise à jour du pseudo + notification par email
  - Upload et gestion de photo de profil (S3/Tigris)
  - Suppression de compte + notification par email
- **Système de réinitialisation** de mot de passe avec code unique par email (expiration 1h)
- **Routes protégées** et gestion des sessions sécurisées
- **Gestion des rôles** (Admin/Utilisateur) avec middleware
- **Protection CSRF** et validation des données
- **Rate limiting** intégré

### 📧 Système d'Emails Transactionnels
- **Templates d'emails** personnalisables avec React Email
- **Emails automatiques** :
  - Bienvenue à l'inscription
  - Confirmation de changement de mot de passe
  - Notification de changement d'email
  - Notification de changement de pseudo
  - Confirmation de suppression de compte
  - Codes de vérification pour actions sensibles
- **Support Gmail SMTP** avec mots de passe d'application

### 💳 Système de Paiement et Abonnements
- **Intégration complète Stripe** :
  - Abonnements mensuels et annuels
  - Webhooks pour synchronisation des paiements
  - Portail client pour gestion des abonnements
  - Historique des transactions
- **Gestion des plans** (Free/Pro) avec restrictions
- **Mise à niveau/rétrogradation** des abonnements
- **Calculs automatiques** des revenus et MRR

### 📊 Dashboard Admin Complet
- **Sidebar responsive** avec navigation intuitive
- **Statistiques en temps réel** :
  - Nombre total d'utilisateurs
  - Nombre d'abonnés Pro
  - Revenus totaux et MRR (Monthly Recurring Revenue)
  - Revenus moyens par utilisateur
  - Répartition abonnements mensuels/annuels
- **Gestion des utilisateurs** :
  - Tableau avec pagination dynamique
  - Filtres avancés (Admin, Abonnement, Type d'abonnement)
  - Recherche par pseudo en temps réel
  - Modification des rôles utilisateurs
  - Suppression en masse d'utilisateurs
- **Interface moderne** avec états de chargement et animations

### 📁 Système de Stockage et Upload
- **Intégration S3/Tigris** pour le stockage de fichiers
- **Upload de photos de profil** avec :
  - Drag & drop intuitif
  - Prévisualisation en temps réel
  - Compression et optimisation automatique
  - Suppression sécurisée des anciens fichiers
- **URLs pré-signées** pour uploads sécurisés
- **Gestion des erreurs** et validation des types de fichiers

### 🎨 Interface Utilisateur Moderne
- **Design responsive** avec Tailwind CSS
- **Composants réutilisables** avec shadcn/ui :
  - Formulaires avec validation (React Hook Form + Zod)
  - Notifications Toast élégantes
  - Modales et dialogues
  - Badges et indicateurs de statut
  - Avatars avec états en ligne/hors ligne
- **Thème sombre/clair** avec next-themes
- **Animations fluides** avec Framer Motion
- **États de chargement** et skeletons
- **Gestion d'erreurs** utilisateur-friendly

### 🛡️ Sécurité et Performance
- **Protection XSS** intégrée
- **Rate limiting** sur les API
- **Validation serveur et client** avec Zod
- **En-têtes de sécurité** optimisés
- **Sessions sécurisées** avec Better Auth
- **Middleware de protection** des routes
- **Hachage sécurisé** des mots de passe (Argon2)
- **Gestion des erreurs** centralisée

## 🛠️ Stack Technique

### Frontend
- **Next.js 15+** avec App Router et Turbopack
- **TypeScript** pour la sécurité des types
- **React 19** avec les dernières fonctionnalités
- **Tailwind CSS 4** pour le styling
- **shadcn/ui** pour les composants UI
- **React Hook Form** + **Zod** pour la validation
- **TanStack Query** pour la gestion d'état serveur
- **Framer Motion** pour les animations
- **next-themes** pour le thème sombre/clair
- **Lucide React** pour les icônes
- **React Dropzone** pour les uploads
- **React Hot Toast** pour les notifications

### Backend & Base de Données
- **Next.js API Routes** pour l'API REST
- **Prisma ORM** avec adaptateur Neon
- **PostgreSQL** comme base de données principale
- **Better Auth** pour l'authentification moderne
- **Argon2** pour le hachage des mots de passe
- **Rate limiting** intégré

### Services Externes
- **Stripe** pour les paiements et abonnements
- **AWS S3/Tigris** pour le stockage de fichiers
- **Gmail SMTP** pour l'envoi d'emails
- **React Email** pour les templates d'emails
- **OAuth** (Google, GitHub) pour l'authentification sociale

### Outils de Développement
- **ESLint** pour la qualité du code
- **Vitest** pour les tests
- **Docker** pour la containerisation
- **Prisma Studio** pour la gestion de la base de données

## 📦 Installation

### Prérequis
- Node.js 18+
- PostgreSQL
- Compte Stripe
- Compte Gmail 

### Configuration Initiale

1. **Cloner et installer**
```bash
git clone [votre-repo]
cd [nom-projet]
npm install
```

2. **Configuration des variables d'environnement**
```bash
cp .env.example .env
```

3. **Variables d'environnement requises**
```env
# Base de données
DATABASE_URL="postgresql://user:password@localhost:5432/db_name"

# Auth
AUTH_SECRET="votre-secret"
NEXTAUTH_URL="http://localhost:3000"

# Providers
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""

# Email
SMTP_USER="votre-email@gmail.com"
SMTP_PASSWORD="mot-de-passe-app"
# OU
RESEND_API_KEY=""

# Stripe
STRIPE_SECRET_KEY=""
STRIPE_WEBHOOK_SECRET=""
STRIPE_PRICE_ID=""

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Configuration de la Base de Données

1. **Initialisation de Prisma**
```bash
npx prisma generate
npx prisma db push
```

### Configuration des Services

#### 1. Stripe
- Créer un compte Stripe
- Configurer un produit d'abonnement
- Noter le PRICE_ID
- Configurer le webhook (URL: `/api/webhook`)

#### 2. Email
**Option Gmail:**
- Activer 2FA
- Générer un mot de passe d'application

#### 3. Stockage Tigris (S3)
**Configuration requise pour l'upload de fichiers :**

1. **Créer un compte Tigris**
   - Aller sur [fly.io/docs/reference/tigris/](https://fly.io/docs/reference/tigris/)
   - Créer un compte et un bucket

2. **Récupérer les clés API**
   - Dans le dashboard Tigris, aller dans "Access Keys"
   - Créer une nouvelle clé d'accès
   - Noter l'`Access Key ID` et la `Secret Access Key`

3. **⚠️ Configuration CORS OBLIGATOIRE**
   ```json
   {
     "CORSRules": [
       {
         "AllowedOrigins": [
           "http://localhost:3000",
           "https://votre-domaine.com"
         ],
         "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
         "AllowedHeaders": ["*"],
         "MaxAgeSeconds": 3000
       }
     ]
   }
   ```
   **Sans cette configuration CORS, les uploads ne fonctionneront pas !**

4. **Variables d'environnement Tigris**
   ```env
   AWS_ACCESS_KEY_ID="votre-access-key-id"
   AWS_SECRET_ACCESS_KEY="votre-secret-access-key"
   AWS_REGION="auto"
   AWS_ENDPOINT_URL_S3="https://fly.storage.tigris.dev"
   S3_BUCKET_NAME="votre-nom-de-bucket"
   ```
- le rentrer ensuite dans le .env : SMTP_PASSWORD="mot-de-passe-app"



## Démarrage

1. **Développement**
```bash
npm run dev
```

2. **Webhook Stripe (développement)**
```bash
stripe listen --forward-to localhost:3000/api/webhook
```

##  Personnalisation

### Modification des Templates Email
Les templates sont dans `app/(emails)/`
```tsx
// Exemple de modification
<Text>Personnalisez votre message ici</Text>
```
Les changer ensuite la ou ces emails sont utilisés checkez les API de bienvenue 

### Ajout de Plans d'Abonnement
1. Créer le plan dans Stripe
2. Ajouter le plan dans `prisma/schema.prisma`
3. Mettre à jour les composants UI

### Ajout de produits Stripe dans notre application 
1. Aller sur mode Compte Stripe dans catalogue produits 
2. Cliquez sur Créer un produit valider quand tout est bon 
3. Aller dans catalogue de produit et cliquer sur l'id du produit que vous voulez récuperez 
4. En mode test copier l'id du produit en cliquant sur les 3 petits point en mode dev copier directement l'id du produit afficher 
5 Aller dans le .env et copier votre produit selon son type d'abonnement ici par mois STRIPE_MONTHLY_PRICE_ID="blabla"
6. utiliser le .env dans votre code pour ne pas afficher le secret avec le proces.env.STRIPE_MONTHLY_PRICE_ID


🚀Version 1.0 a venir (Début du développement en Mai 2025)
🛠️ Architecture & Tech

- Dark Mode
- (Zustand pour state management)
- Architecture modulaires
- CI/CD (Github Actions)
- Tests complets (Unitaire, E2E, Integration)

🔒 Migration système d'authentification
- Passage de AuthJS a BetterAuth 

🎨 Personnalisation

- Design System
- Système marque blanche
- Couleurs personnalisables
- Polices configurables

🔒 Sécurité

- 2FA (email)
- Rate limiting
- Super Admin unique

👤 ESPACE UTILISATEUR
Profil & Préférences

- Upload photo de profil
- Paramètres notifications
- Préférences emails
- Export données personnelles
- Système de feedback/bug

📊 DASHBOARD ADMIN
🏠 Page d'Accueil
Stats Aujourd'hui

- Inscriptions du jour
- Revenus journaliers
- Utilisateurs actifs
- Nouveaux abonnements

Vue Hebdomadaire

- Graphique inscriptions
- Total revenus semaine
- Comparaison semaine -1

👥 Gestion Utilisateurs
- Filtres Avancés

- Période (aujourd'hui/7j/30j)
- Source (Email/Google/GitHub)

Actions

- Export CSV
- Ban/Unban
- Gestion rôles
- Vue détaillée

💰 Section Revenus
- Stats Mensuelles
- Total du mois
- Comparaison M-1
- Graphique journalier
- Top 3 meilleurs jours

Abonnements

- Répartition (camembert)
- Liste derniers abonnés

📝 Section Activité
- Timeline

- Nouvelles inscriptions
- Nouveaux abonnements
- Changes de rôles
- Actions importantes

🔔 Notifications

- Nouveaux abonnés
- Feedbacks reçus
- Utilisateurs bannis
- Emails Admin
- Rapport hebdo inscriptions
- Rapport hebdo revenus

🎨 UI/UX

- Design System
- Plus de composants réutilisables
- Animations fluides
- Tooltips contextuels
- Skeleton loading

⚡ PERFORMANCE

- Images optimisées
- Améliorer les requetes Prisma
- Lazy loading

📚 DOCUMENTATION
Guides

Installation détaillée
Guide développeur
Guide customisation
Bonnes pratiques
Doc API complète


### Problèmes Courants

1. **Erreur de Base de Données**
- Vérifier la connexion PostgreSQL
- Valider DATABASE_URL
- Exécuter `npx prisma db push`

2. **Problèmes d'Email**
- Vérifier les credentials SMTP
- Consulter les logs email
- Tester avec Resend

3. **Erreurs Stripe**
- Vérifier les clés API
- Confirmer le webhook
- Consulter les logs Stripe

##  Documentation

Pour plus de détails, consultez :
- [Auth.js](https://authjs.dev/)
- [Prisma](https://www.prisma.io/docs/)
- [Stripe](https://stripe.com/docs)
- [Next.js](https://nextjs.org/docs)

##  Support

Pour toute question :
1. Consulter les issues GitHub
2. Créer une nouvelle issue
3. Consulter la documentation des packages

## 📝 License

MIT