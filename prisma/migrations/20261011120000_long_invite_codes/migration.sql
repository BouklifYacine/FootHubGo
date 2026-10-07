-- Invite codes: the old 6-digit codes could be enumerated. Every existing code is replaced by a
-- 12-character code (48 random bits from gen_random_uuid(), hex digits 0/1 mapped to X/Y so the code
-- only uses the app's unambiguous alphabet). Coaches see the new code in the invite dialog;
-- codes shared before this migration stop working.
UPDATE "equipe"
SET "codeInvitation" = translate(upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12)), '01', 'XY')
WHERE "codeInvitation" IS NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "equipe_codeInvitation_key" ON "equipe"("codeInvitation");
