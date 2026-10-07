# Changelog

Toutes les évolutions notables de FootHubGo sont listées ici.

Format : [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/). Versions : [Semantic Versioning](https://semver.org/lang/fr/)
(`MAJEUR.MINEUR.CORRECTIF` : MAJEUR = changement incompatible, MINEUR = nouvelle fonctionnalité, CORRECTIF = correction).

Publier une version : déplacer le contenu de « Non publié » sous un nouveau titre `## [X.Y.Z] - AAAA-MM-JJ`,
mettre la même version dans `package.json`, fusionner dans `main`, puis pousser le tag `vX.Y.Z`.
Le workflow `Release` crée alors la release GitHub avec ces notes et publie l'image Docker.

## [Non publié]

## [1.0.0] - 2026-10-10

Première version stable : nouvelle architecture, corrections de sécurité et nouvelles fonctionnalités.

### Ajouté

- **Sondages d'équipe** : le coach publie un sondage (choix unique ou multiple, date de fin optionnelle),
  toute l'équipe est notifiée, vote et voit les résultats (votes nominatifs). Clôture et suppression par le coach.
- **Rappels d'événements** : la veille d'un événement, notification + email aux joueurs concernés
  (convoqués ayant confirmé ou pas encore répondu pour un match, joueurs non absents pour un entraînement).
- **Entraînements récurrents** : répétition hebdomadaire jusqu'à une date (52 maximum), même heure locale
  au changement d'heure ; suppression d'une occurrence ou de la série à venir.
- **Convocations depuis le calendrier** : sélection de plusieurs joueurs et envoi groupé depuis la fenêtre du match.
- **Description des événements** (consignes, matériel, rendez-vous).
- **Chat** : messages en temps réel, salon de l'équipe synchronisé avec l'effectif, réglages de groupe
  (renommer, ajouter, retirer), indicateur de saisie, compteur de messages non lus dans le menu.
- **Calendrier** FullCalendar (vues mois, semaine, liste, filtres par type, glisser-déposer réservé au coach).
- Tests unitaires (`bun test`) et intégration continue GitHub Actions (typecheck, lint, tests, migrations, build).
- Workflow de publication : release GitHub + image Docker sur GHCR à chaque tag `vX.Y.Z`.

### Modifié

- Architecture par fonctionnalité en anglais (`features/<domaine>`), interface en français ; anciennes URL
  françaises redirigées. Lectures via routes `GET`, écritures via server actions (voir `ARCHITECTURE.md`).
- Paramètres du compte sur `/settings` (plus d'identifiant dans l'URL) ; changement d'email ou de mot de passe
  déconnecte toutes les sessions.
- Suppression de compte : annule l'abonnement Stripe ; impossible tant que l'utilisateur est dans un club.
- Webhook Stripe découpé par type d'événement.
- **PostgreSQL 18** (Docker Compose et CI) ; nouveau volume `pg18_data` (voir `README.Docker.md`).
- Code réduit de 60 % (32 894 → ~13 000 lignes), duplication de 10,35 % à 0,4 %.

### Corrigé

- L'historique de migrations ne créait pas les tables du chat (créées autrefois avec `db push`) : une base neuve
  ne pouvait pas être construite. Migration de rattrapage `20261007190000_chat_tables_catch_up` ; toute la chaîne
  s'applique désormais sur une base vide (vérifié en CI).
- L'image Docker de production ne se construisait pas sans les secrets.

### Sécurité

- Contrôles d'accès centralisés (`requireUser`, `requireMember`, `requireCoach`, `requireAdmin`) : plus de
  comparaison avec un identifiant indéfini ni d'identifiant codé en dur.
- Toutes les données sont filtrées par le club de l'utilisateur (accès aux blessures, demandes d'adhésion et
  comptes d'autres utilisateurs corrigés) ; codes d'invitation visibles du coach uniquement.
- Temps réel : identité issue de la session, accès aux salons vérifié, événements clients limités et validés,
  blocages appliqués, aucun contenu de message dans les logs.
- Upload d'avatar validé côté serveur (type et taille) ; vérification du rôle administrateur corrigée.

[Non publié]: https://github.com/BouklifYacine/FootHubGo/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/BouklifYacine/FootHubGo/releases/tag/v1.0.0
