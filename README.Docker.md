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

### Reverse proxy et adresse IP des clients

Les limites de tentatives (connexion, code d'invitation, mot de passe) sont calculées par adresse IP.
Le serveur (`server.ts`) détermine cette IP **une seule fois** et ignore les en-têtes envoyés par le client :

- `TRUSTED_IP_HEADER` vide (défaut) : adresse TCP de la connexion. Correct si l'application est exposée
  directement, mais derrière un proxy tous les utilisateurs auraient l'IP du proxy.
- Derrière un reverse proxy : `TRUSTED_IP_HEADER` = l'en-tête écrit par **votre** proxy
  (`x-real-ip` pour Nginx/Caddy configurés ainsi, `fly-client-ip` sur Fly.io, `cf-connecting-ip` derrière
  Cloudflare ; avec `x-forwarded-for`, la dernière valeur de la liste est utilisée).

Dans ce second cas, le port de l'application **ne doit être joignable que par le proxy** : sinon un client
peut envoyer l'en-tête lui-même et contourner les limites. Le `docker-compose.yaml` publie donc le port sur
`127.0.0.1:3000` uniquement (le proxy tourne sur l'hôte) ; pour un proxy dans Compose, retirez `ports` et
placez les deux services sur le même réseau.

Exemple Caddy (sur l'hôte) :

```
foothubgo.example.fr {
  reverse_proxy 127.0.0.1:3000 {
    header_up X-Real-IP {remote_host}
  }
}
```

avec `TRUSTED_IP_HEADER="x-real-ip"`. Les compteurs sont en mémoire : ils supposent **une seule instance**
de l'application (voir `lib/rate-limit.ts`).

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
- `TRUSTED_IP_HEADER` : en-tête du reverse proxy qui porte l'IP du client (voir plus haut).

La liste de référence et les commentaires sont dans `env.exemple`. Ne placez pas de secrets dans l’image ou dans le dépôt.
