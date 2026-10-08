-- Playing time sheet: a player row can exist before the coach rates the player or sets a position.
ALTER TABLE "statistique_joueur" ALTER COLUMN "note" DROP NOT NULL,
ALTER COLUMN "note" DROP DEFAULT,
ALTER COLUMN "poste" DROP NOT NULL;
