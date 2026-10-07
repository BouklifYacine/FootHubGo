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

## Variables principales

- `DATABASE_URL` : URL utilisée par l’application et par défaut par Prisma.
- `DIRECT_URL` : URL directe utilisée par Prisma si elle est définie.
- `BETTER_AUTH_SECRET` et `BETTER_AUTH_URL` : authentification.
- `RESEND_API_KEY` et `RESEND_FROM_EMAIL` : emails transactionnels.
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `AWS_ENDPOINT_URL_S3` et `S3_BUCKET_NAME` : stockage S3 compatible.
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` et `STRIPE_YEARLY_PRICE_ID` : Stripe.
- `POSTGRES_USER`, `POSTGRES_PASSWORD` et `POSTGRES_DB` : base PostgreSQL du Compose local.

La liste de référence et les commentaires sont dans `env.exemple`. Ne placez pas de secrets dans l’image ou dans le dépôt.
