# ⚽ Foothubgo - Plateforme de Gestion pour Clubs Amateurs

**Solution tout-en-un** pour révolutionner la gestion des clubs de football amateurs. Développée avec **Next.js 15**, **React 19**, **Prisma** et **PostgreSQL**.

[![Demo](https://img.shields.io/badge/LIVE_DEMO-footygogo.com-brightgreen)](https://footygogo.com)
[![License](https://img.shields.io/badge/License-MIT-blue)](LICENSE)


## 🚀 Foothubgo (v1.0 - Entièrement Fonctionnel)

### 🏆 Gestion de Club
- ✅ **Création de club** en 2 clics - Utilisateur devient automatiquement entraîneur
- ✅ **Système d'invitation** avec codes uniques (génération/régénération/suppression)
- ✅ **Gestion des rôles** (entraîneur/joueur) et postes avec permissions granulaire
- ✅ **Tableau des membres** avec filtres dynamiques et recherche instantanée
- ✅ **Modification/suppression** des clubs en 1 clic

### 📅 Événements & Présences
- ✅ **Création de matchs/entraînements** avec adversaire obligatoire pour les matchs
- ✅ **Système de présence** en 1 clic (✅/❌) avec historique complet
- ✅ **Gestion complète** : Modification/suppression des événements par l'entraîneur
- ✅ **Visualisation des présences** par joueur et par équipe

### 📊 Statistiques Avancées
- ✅ **Saisie des stats** pour joueurs et matchs par l'entraîneur
- ✅ **Tableaux de bord interactifs** avec Chart.js (20+ graphiques différents)
- ✅ **Fiches détaillées** pour chaque joueur et chaque équipe
- ✅ **Export des données** en PDF/CSV pour analyse externe

### 🌐 Annonces Publiques
- ✅ **Classement public** des équipes et joueurs
- ✅ **Fiche club publique** avec présentation et statistiques
- ✅ **Système de visibilité** contrôlable par l'entraîneur

## ⚙️ Stack Technique
- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Base de Données**: PostgreSQL (Neon.tech)
- **Realtime**: WebSockets (Socket.io)
- **Stockage**: AWS S3
- **DevOPS**: Docker Coolify





## 🚀 Déploiement
1. **Variables d'environnement**:
   ```env
   DATABASE_URL="postgresql://..."
   NEXT_PUBLIC_SOCKET_URL="wss://..."
   ```
2. **Installation**:
   ```bash
   npm install
   npx prisma generate
   npx prisma migrate dev
   ```
3. **Lancement**:
   ```bash
   npm run dev
   ```

## 📄 License
MIT License - Copyright (c) 2025 Yacine Bouklif 