# Portfolio — Gary Hocking / Cloudio Consulting

A developer-facing mirror of the project, prototype and case-study content on [cloudioconsulting.com/Portfolio](https://cloudioconsulting.com/Portfolio). The live site is the canonical, publicly-editable version (built on Base44); this repo is a version-controlled, machine-readable copy of the same content aimed at anyone browsing GitHub directly — recruiters, engineers, collaborators.

Each entry here is kept in sync by hand whenever a new item is added to the site, so the two should always tell the same story, just in different formats.

## Structure

| Folder | Content type | Mirrors |
|---|---|---|
| [`projects/`](./projects) | Working apps, websites, prototypes, GitHub repos | `PortfolioItem` entity |
| [`case-studies/`](./case-studies) | Deeper narrative write-ups of client/employer engagements (some anonymised) | `CaseStudy` entity |
| [`concepts/`](./concepts) | Speculative feature/product concepts designed for named companies | `ConceptPrototype` entity |
| [`schema/`](./schema) | JSON Schema for each content type above, matching the field definitions used on the live site | — |

Each item is a folder named after its `slug`, containing:

- **`data.json`** — the structured, machine-readable record (validated against the matching schema in `schema/`)
- **`README.md`** — the same content rendered as a human-readable case study, for anyone browsing on GitHub

A `_template` folder under each of `projects/`, `case-studies/` and `concepts/` shows the expected shape for a new entry — copy it, rename to your slug, and fill it in.

## Machine-readable index

[`index.json`](./index.json) at the repo root aggregates every **published** entry across all three types into one file — useful if you ever want to pull this portfolio into another site, a résumé generator, or a script, without scraping individual folders. It's regenerated automatically:

```bash
node scripts/build-index.js
```

The script also does a lightweight validation pass against `schema/*.schema.json` (required fields present, enum values valid, string length limits respected) and will exit non-zero if an entry fails — run it before committing a new or edited entry.

## Adding a new entry

1. Copy the relevant `_template` folder (e.g. `projects/_template`) to a new folder named after your slug (e.g. `projects/canonical-maas-provisioning`).
2. Fill in `data.json`, set `slug` to match the folder name, and set `status`/`published` to `"published"` / `true` once it's ready to go live in `index.json`.
3. Fill in the matching `README.md`.
4. Run `node scripts/build-index.js` to regenerate `index.json` and check for validation errors.
5. Commit and open a PR.
