-- Ajoute la période annuelle (le code du webhook Stripe l'utilise déjà)
ALTER TYPE "PlanAbonnement" ADD VALUE IF NOT EXISTS 'annee';
