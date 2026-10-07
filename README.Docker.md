# Docker — FootHubGo

Ce guide décrit les environnements Docker de développement et de production. Les images utilisent Node.js 24 et Bun 1.3.14; Bun installe les dépendances depuis `bun.lock`.

## Prérequis

- Docker avec Docker Compose.
- Un fichier `.env` pour le développement ou `.env.production.local` pour la production.
- Une base PostgreSQL et les variables requises dans `env.exemple`.

## Développement

```bash
cp env.exemple .env
docker compose -f docker-compose.dev.yml up --build -d
docker compose -f docker-compose.dev.yml logs -f app
docker compose -f docker-compose.dev.yml down
```

Compose démarre PostgreSQL et l’application. Les variables `DATABASE_URL` et `DIRECT_URL` de l’application ciblent le service `db`. Le conteneur régénère le client Prisma puis démarre `bun run dev`.

Pour créer/appliquer des migrations de développement :

```bash
docker compose -f docker-compose.dev.yml exec app bun run db:migrate
```

## Production

Renseignez `.env.production.local`, puis lancez :

```bash
docker compose up --build -d
docker compose logs -f app
docker compose down
```

Au démarrage, le conteneur exécute `bun run db:deploy` avec le CLI Prisma local 7.10.0, puis démarre `server.ts` via `bun run start` (`tsx server.ts`). Le serveur personnalisé conserve Socket.IO; le build standalone de Next.js n’est pas utilisé.

## PostgreSQL 18

Les Compose utilisent `postgres:18-alpine` avec le volume `pg18_data` (l'image 18 se monte sur
`/var/lib/postgresql`). L'ancien volume `db_data` (PostgreSQL 16) n'est plus utilisé : il n'est ni lu ni supprimé.

Les données d'un volume 16 ne sont pas lisibles par la 18. Deux options en local :

- **Repartir de zéro** (données de test) : `docker compose -f docker-compose.dev.yml up -d db`, puis
  `bun run db:deploy` crée tout le schéma. Supprimer l'ancien volume quand vous n'en avez plus besoin :
  `docker volume ls` puis `docker volume rm <projet>_db_data`.
- **Garder les données** : avant de changer d'image, `pg_dump` depuis l'ancien conteneur 16, puis
  restauration (`psql` ou `pg_restore`) dans le nouveau conteneur 18.

## Variables principales

- `DATABASE_URL` : URL utilisée par l’application et par défaut par Prisma.
- `DIRECT_URL` : URL directe utilisée par Prisma si elle est définie.
- `BETTER_AUTH_SECRET` et `BETTER_AUTH_URL` : authentification.
- `RESEND_API_KEY` et `RESEND_FROM_EMAIL` : emails transactionnels.
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `AWS_ENDPOINT_URL_S3` et `S3_BUCKET_NAME` : stockage S3 compatible.
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` et `STRIPE_YEARLY_PRICE_ID` : Stripe.
- `POSTGRES_USER`, `POSTGRES_PASSWORD` et `POSTGRES_DB` : base PostgreSQL du Compose local.

La liste de référence et les commentaires sont dans `env.exemple`. Ne placez pas de secrets dans l’image ou dans le dépôt.
