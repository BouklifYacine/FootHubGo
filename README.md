# FootHubGo

FootHubGo aide les clubs de football amateur à gérer leurs équipes et leur activité : effectif, événements, présences, statistiques, convocations, messagerie et notifications.

## Stack

| Domaine | Technologies |
| --- | --- |
| Application | Next.js 16.4, React 19.3, TypeScript 6.0, Tailwind CSS 4 |
| Formulaires et données | TanStack Form 1.33, TanStack Query 5, Zod 4 |
| Serveur | Serveur personnalisé `server.ts` avec Next.js et Socket.IO 4 |
| Authentification | Better Auth 1.7 |
| Base de données | PostgreSQL, Prisma ORM et CLI 7.10 |
| Services | Stripe 23, Resend 6, stockage compatible AWS S3 |

Les dépendances sont gérées avec Bun et le lockfile `bun.lock`. Node.js 22 ou supérieur est requis par certaines dépendances.

## Fonctionnalités présentes

- Gestion du club et de l’effectif, invitations et demandes d’adhésion.
- Calendrier, événements, convocations et suivi des présences.
- Statistiques d’équipe et de joueurs.
- Messagerie en temps réel, notifications et gestion des blessures.
- Authentification par email, récupération du mot de passe et connexion Google/GitHub.
- Paramètres du compte, profil et abonnements Stripe.

## Routes principales

| URL | Usage |
| --- | --- |
| `/` | Page d’accueil publique |
| `/connexion`, `/inscription` | Authentification |
| `/app/*` | Espace principal du club |
| `/dashboard` | Administration |

Les anciennes URL `/dashboardfoothub/*` redirigent de façon permanente vers `/app/*`.

## Prérequis

- Node.js 22 ou supérieur.
- Bun 1.3 ou supérieur.
- Une base PostgreSQL.
- Des identifiants AWS S3 ou compatibles pour l’envoi d’images.

## Installation locale

```bash
bun install --frozen-lockfile
cp env.exemple .env
```

Renseignez les variables nécessaires dans `.env`. `DATABASE_URL` sert à la connexion de l’application. `DIRECT_URL` sert aux opérations Prisma qui nécessitent une connexion directe ; si elle est absente, `prisma.config.ts` reprend `DATABASE_URL`.

```bash
bun run db:generate
bun run db:migrate
bun run dev
```

L’application démarre sur `http://localhost:3000`. Le serveur personnalisé démarre via `tsx server.ts` afin de conserver Socket.IO.

## Scripts Bun

| Commande | Action |
| --- | --- |
| `bun run dev` | Démarre le serveur personnalisé en mode développement |
| `bun run dev:next` | Démarre Next.js sans le serveur Socket.IO personnalisé |
| `bun run build` | Construit l’application Next.js |
| `bun run start` | Démarre `server.ts` avec `tsx` |
| `bun run typecheck` | Vérifie les types TypeScript |
| `bun run lint` | Lance ESLint |
| `bun run db:generate` | Génère le client Prisma |
| `bun run db:migrate` | Crée/applique les migrations en développement |
| `bun run db:deploy` | Applique les migrations déjà créées |
| `bun run db:push` | Synchronise le schéma sans créer de migration |
| `bun run db:studio` | Ouvre Prisma Studio |

Prisma 7 lit la configuration depuis `prisma.config.ts` ; l’URL de connexion n’est donc plus définie dans le bloc `datasource` de `prisma/schema.prisma`. La version du CLI et des paquets Prisma est épinglée à 7.10.0.

## Variables d’environnement

Le fichier `env.exemple` répertorie les variables utilisées par l’application : base de données (`DATABASE_URL`, `DIRECT_URL`), Better Auth, OAuth, Resend, S3, Stripe et port du serveur. Ne commitez jamais de secrets réels.
