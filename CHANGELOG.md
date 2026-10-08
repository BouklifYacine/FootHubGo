# Changelog

Toutes les évolutions notables de FootHubGo sont listées ici.

Format : [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/). Versions : [Semantic Versioning](https://semver.org/lang/fr/)
(`MAJEUR.MINEUR.CORRECTIF` : MAJEUR = changement incompatible, MINEUR = nouvelle fonctionnalité, CORRECTIF = correction).

Publier une version : sur `dev`, déplacer le contenu de « Non publié » sous un nouveau titre
`## [X.Y.Z] - AAAA-MM-JJ` et mettre la même version dans `package.json`, puis fusionner `dev` dans `main`.
Le workflow `Release` crée alors le tag `vX.Y.Z`, la release GitHub avec ces notes et l'image Docker.

## [Non publié]

### Ajouté

- **Navigation mobile** : barre d'onglets en bas de l'écran (Accueil, Agenda, Équipe, Messages, Plus) avec
  pastilles (messages non lus, convocations à répondre, demandes d'adhésion), barre du haut avec le titre de la
  page, le club et la section (changement de section d'un geste) et la cloche. Sur ordinateur, le menu latéral
  reprend les mêmes entrées. Nouvelle page « Plus » : statistiques, blessures, sondages, demandes d'adhésion,
  gestion du club, paramètres, thème (Clair / Sombre / Auto), « Revoir le tutoriel », déconnexion.
- **Accueil selon le rôle** : le prochain rendez-vous avec, pour le joueur, les boutons « Je suis dispo /
  Pas dispo » (ou « Je viens / Je ne viens pas » pour un entraînement) et, pour l'entraîneur, qui a répondu et
  le bouton « Convoquer » ; une liste « À faire » (convocations, présences, demandes d'adhésion, matchs sans
  convocation, scores à saisir) ; une liste « Bien démarrer » pour l'entraîneur (inviter les joueurs, premier
  événement, premières convocations, premier message). Sans club : « J'ai un code d'invitation » et
  « Créer mon club ».
- **Agenda** : Événements et Calendrier fusionnés. Liste des événements à venir par défaut (par semaine,
  filtres Matchs / Entraînements, passés), calendrier en option, bouton « Nouvel événement » visible ; après
  la création d'un match, « Convoquer maintenant ».
- **Lien d'invitation** (`/join/<code>`) avec « Partager le lien » (WhatsApp, SMS... via le partage du
  téléphone) et « Copier le lien » ; la personne invitée crée son compte ou se connecte puis rejoint la section
  d'un geste, le code est déjà rempli. Page « J'ai un code » et second bouton sur la page d'accueil du site.
- **Tutoriel guidé** (driver.js) pour l'entraîneur et pour le joueur, 6 étapes maximum, affiché une fois à
  la première arrivée (mémorisé par compte, sur tous les appareils), à revoir depuis « Plus ».
- Les notifications ouvrent leur page (convocation et rappel : l'événement, demande d'adhésion, sondage) ;
  la notification en direct propose « Voir ».
- Script de données de démonstration pour le développement local : `bun run db:seed` (jamais en production).

- **Clubs et sections** : un club regroupe des sections (Seniors, Vétérans, Loisir, par ex. « Seniors A »).
  Rôles du club : propriétaire (un seul, il paie l'abonnement), administrateurs, membres ; rôles de section :
  entraîneur ou joueur. On peut être dans plusieurs sections du même club (entraîneur dans l'une, joueur dans
  l'autre). Un seul club par utilisateur pour l'instant.
- **Sélecteur de section** en haut du menu (« Club · Section ») : la section active est mémorisée et toutes les
  pages affichent ses données.
- **Page « Club »** (propriétaire et administrateurs) : informations du club, sections (créer, renommer,
  supprimer une section vide, code d'invitation), membres et rôles du club, nomination des entraîneurs par
  section, transfert de propriété, abonnement du club.
- **Événements « Tout le club »** créés par le propriétaire ou un administrateur : visibles dans toutes les
  sections, sans convocation ni présence ; le rappel part à tous les membres du club.
- **Salon de discussion du club** (tous les membres) en plus du salon de chaque section.
- Annuaire des clubs avec leurs sections : la demande d'adhésion vise une section et est traitée par ses
  entraîneurs ou par les administrateurs du club.
- Tests unitaires : matrice des droits du club, section active, transfert de propriété, départ, exclusion.

- **Préférences de notification** : section « Notifications » dans les paramètres pour couper les rappels
  d'événements par email (la notification dans l'application est toujours envoyée).
- **Lien de désabonnement** dans les emails de rappel : un clic, sans être connecté, coupe ces emails
  (jeton signé) ; en-têtes `List-Unsubscribe` / `List-Unsubscribe-Post` pour le bouton des messageries.
- Variable d'environnement `TRUSTED_IP_HEADER` (en-tête du reverse proxy portant l'IP du client, voir
  `README.Docker.md`).
- Tests unitaires : limiteur de tentatives, codes d'invitation, jetons signés, changement d'email, résolution
  de l'IP, type d'image, en-têtes de sécurité, règles de groupe et d'administration.

### Modifié

- **Interface pensée pour le téléphone** : boutons et champs d'au moins 44 px, formulaires dans des panneaux
  qui montent du bas de l'écran, dates et heures avec le sélecteur du téléphone, menu des messages toujours
  visible, tableaux remplacés par des listes de cartes sur mobile (effectif, convocations, statistiques des
  joueurs, présences, blessures), statuts écrits en toutes lettres avec une icône.
- **Réponse à une convocation modifiable** jusqu'à 3 h avant le match (avant : réponse définitive), depuis
  l'accueil, l'agenda ou la page du match ; l'entraîneur est prévenu du changement.
- **Page d'un événement** : un seul tableau d'affichage du score, « Ma convocation » pour le joueur, résumé
  des réponses et « Convoquer » pour l'entraîneur, « Modifier » et « Supprimer » sur la page.
- **Tutoiement partout** (écrans, messages, emails) et vocabulaire unifié : Agenda, « Je suis dispo / Pas dispo »,
  Présent / Absent / En attente, Demandes d'adhésion (au lieu de « Transfert »).
- Paramètres dans l'application (`/app/settings`) ; après l'inscription on est connecté directement ; après
  la création d'un club ou l'arrivée dans une section on arrive sur l'accueil.
- Confirmation avant toute action destructrice (quitter le club, supprimer un événement, retirer une
  convocation, supprimer le lien d'invitation, refuser une demande, clôturer un sondage, « Supprimer pour
  tous »...) dans une fenêtre unique au lieu de la fenêtre du navigateur.
- Couleurs corrigées en mode clair et sombre (textes secondaires, fonds, notifications), le bouton de thème
  suit le thème réellement affiché ; une seule façon d'écrire les dates ; titre de l'onglet propre à chaque page.

- **Migration des données** : chaque équipe devient un club (même nom, logo, description, visibilité) avec une
  section « Seniors » portant son nom ; son plus ancien entraîneur devient propriétaire, les autres entraîneurs
  administrateurs, les joueurs membres. Le salon de l'équipe devient celui de la section et un salon
  « Tout le club » est créé. Les codes d'invitation existants restent valables (ils visent la section).
- **Abonnement payé par le club** (propriétaire) : l'abonnement d'un propriétaire est rattaché à son club ;
  celui d'un utilisateur sans club reste sur son compte. Pour supprimer son compte, le propriétaire doit
  d'abord transférer la propriété du club ou le supprimer ; un autre membre est simplement retiré du club.
- Le code d'invitation fait rejoindre une section précise (et le club) ; un membre peut rejoindre une autre
  section de son club avec son code.
- Quitter sa dernière section revient à quitter le club ; l'exclusion par un entraîneur retire le joueur de la
  section (du club si c'était sa seule section).
- Messages privés et groupes : entre membres du même club (toutes sections).

- **Codes d'invitation** de 12 caractères (`ABCD-EFGH-JKMN`, sans caractères ambigus), saisis avec ou sans
  tirets. Les anciens codes à 6 chiffres sont remplacés par la migration : les coachs doivent partager le
  nouveau code affiché dans « Code d'invitation ».
- **Changement d'email** en deux étapes : un code est envoyé à la nouvelle adresse, l'email ne change
  qu'après sa saisie. Les emails sont enregistrés en minuscules (migration des adresses existantes).
- Mot de passe : 8 à 128 caractères (les mots de passe existants plus courts restent valides).
- Page d'accueil : logos de clubs professionnels, photos d'entraîneurs et avis invérifiables retirés,
  section « Pensé pour le football amateur », grille tarifaire en français (abonnement club mensuel ou annuel).
- Les joueurs voient qu'un coéquipier est blessé, plus le détail de la blessure (réservé au coach).
- Le classement n'affiche plus les clubs privés (sauf le sien).
- Un membre qui quitte un club quitte aussi les groupes de discussion de ce club et ne peut plus écrire en
  privé à ses anciens coéquipiers (l'historique reste lisible).
- Docker Compose : l'application n'est publiée que sur `127.0.0.1:3000` (à placer derrière un reverse proxy).

### Corrigé

- Un message envoyé avant la fin du chargement d'une conversation n'apparaissait pas pour son auteur avant
  un rechargement.
- « Nouvelle conversation » ne proposait que les membres de la section active : elle liste tout le club.
- Le menu mobile restait ouvert après avoir choisi une page.
- La zone de saisie du chat pouvait passer sous la barre du navigateur sur iPhone.

- Webhook Stripe : chaque événement n'est traité qu'une fois (table `stripe_event`), plus de double email
  de confirmation lors des renvois de Stripe.
- La suppression d'un compte par un administrateur supprime ses avatars et refuse de laisser un club sans
  entraîneur.
- Un message « supprimé pour tous » est réellement effacé en base.

### Sécurité

- Seuls le propriétaire et les administrateurs gèrent le club (informations, sections, entraîneurs, membres) ;
  seul le propriétaire supprime le club ou change les rôles du club : un co-entraîneur ne peut plus supprimer
  le club ni rétrograder les autres entraîneurs (audit L6).
- « Un club par utilisateur » et « une fois par section » sont garantis par la base (index uniques) : deux
  adhésions simultanées ne créent plus de double appartenance (audit L13).

- Limites de tentatives (en mémoire, une seule instance) : code d'invitation (5 par utilisateur et 20 par IP
  en 10 min), mot de passe actuel dans les paramètres (5 en 15 min puis déconnexion partout), connexion
  (verrouillage du compte après 10 échecs en 15 min), demandes d'adhésion, sondages, conversations, avatars.
- IP du client déterminée par le serveur (connexion TCP ou en-tête du proxy configuré) : `X-Forwarded-For`
  envoyé par un client n'est plus pris en compte par les limites de better-auth.
- Points d'accès better-auth inutilisés désactivés (`/update-user`, `/change-password`, `/change-email`) ;
  seuls les avatars `avatars/<id>/` de l'utilisateur peuvent être supprimés du stockage.
- Socket.IO : dépendances corrigées (engine.io, socket.io-parser, ws), connexions d'une autre origine
  refusées, taille des messages limitée ; les sockets sont fermés à la déconnexion, au changement de mot de
  passe ou d'email et à la suppression du compte.
- En-têtes HTTP : CSP, HSTS (production), `X-Frame-Options`, `nosniff`, `Referrer-Policy`,
  `Permissions-Policy` ; optimiseur d'images limité aux hôtes des avatars.
- Avatars : type vérifié sur le contenu du fichier. Journaux d'erreurs sans les arguments des requêtes Prisma.
- Dépendances : `defu` et `mysql2` mis à jour via `overrides`.

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
