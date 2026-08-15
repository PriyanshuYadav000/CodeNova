-- Add the column as nullable so existing problems can be backfilled safely.
ALTER TABLE "problems" ADD COLUMN "normalized_title" VARCHAR(255);

-- Match the application normalization rule: trim, lowercase, and collapse whitespace.
UPDATE "problems"
SET "normalized_title" = lower(regexp_replace(btrim("title"), '\\s+', ' ', 'g'));

ALTER TABLE "problems" ALTER COLUMN "normalized_title" SET NOT NULL;

CREATE UNIQUE INDEX "problems_normalized_title_key" ON "problems"("normalized_title");
