#!/usr/bin/env node
/**
 * Rebuilds the root index.json from every projects/<slug>/data.json,
 * case-studies/<slug>/data.json and concepts/<slug>/data.json file.
 *
 * Also does a lightweight required-field / enum check against the
 * schema/*.schema.json files (not full JSON Schema validation — just
 * enough to catch typos and missing fields before they go live).
 *
 * Usage: node scripts/build-index.js
 * Exits non-zero if any data.json fails validation.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

const SOURCES = [
  { dir: 'projects', schema: 'portfolio-item.schema.json', key: 'projects', publishedFlag: (d) => (d.status ?? 'published') === 'published' },
  { dir: 'case-studies', schema: 'case-study.schema.json', key: 'case_studies', publishedFlag: (d) => d.published === true },
  { dir: 'concepts', schema: 'concept-prototype.schema.json', key: 'concepts', publishedFlag: (d) => (d.status ?? 'published') === 'published' },
];

function loadSchema(name) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, 'schema', name), 'utf8'));
}

function validate(data, schema, label) {
  const errors = [];
  for (const field of schema.required || []) {
    if (data[field] === undefined || data[field] === null || data[field] === '') {
      errors.push(`missing required field "${field}"`);
    }
  }
  for (const [field, def] of Object.entries(schema.properties || {})) {
    if (def.enum && data[field] !== undefined && !def.enum.includes(data[field])) {
      errors.push(`field "${field}" = ${JSON.stringify(data[field])} is not one of ${JSON.stringify(def.enum)}`);
    }
    if (def.maxLength && typeof data[field] === 'string' && data[field].length > def.maxLength) {
      errors.push(`field "${field}" exceeds maxLength ${def.maxLength} (got ${data[field].length})`);
    }
  }
  if (errors.length) {
    console.error(`✗ ${label}:\n  - ${errors.join('\n  - ')}`);
  }
  return errors.length === 0;
}

let hadErrors = false;
const index = { generated_at: new Date().toISOString(), projects: [], case_studies: [], concepts: [] };

for (const source of SOURCES) {
  const schema = loadSchema(source.schema);
  const dirPath = path.join(ROOT, source.dir);
  if (!fs.existsSync(dirPath)) continue;

  const entries = fs.readdirSync(dirPath, { withFileTypes: true })
    .filter((e) => e.isDirectory() && !e.name.startsWith('_')); // folders prefixed with "_" (e.g. _template) are skipped

  const items = [];
  for (const entry of entries) {
    const dataPath = path.join(dirPath, entry.name, 'data.json');
    if (!fs.existsSync(dataPath)) continue;

    const raw = fs.readFileSync(dataPath, 'utf8');
    let data;
    try {
      data = JSON.parse(raw);
    } catch (err) {
      console.error(`✗ ${source.dir}/${entry.name}/data.json: invalid JSON — ${err.message}`);
      hadErrors = true;
      continue;
    }

    const label = `${source.dir}/${entry.name}/data.json`;
    if (data.slug && data.slug !== entry.name) {
      console.error(`✗ ${label}: "slug" (${data.slug}) does not match folder name (${entry.name})`);
      hadErrors = true;
      continue;
    }
    if (!validate(data, schema, label)) {
      hadErrors = true;
      continue;
    }

    if (source.publishedFlag(data)) {
      items.push(data);
    } else {
      console.log(`ℹ ${label}: draft — excluded from index.json`);
    }
  }

  items.sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0) || a.title.localeCompare(b.title));
  index[source.key] = items;
}

fs.writeFileSync(path.join(ROOT, 'index.json'), JSON.stringify(index, null, 2) + '\n');
console.log(`\nWrote index.json — ${index.projects.length} project(s), ${index.case_studies.length} case study(ies), ${index.concepts.length} concept(s).`);

if (hadErrors) {
  console.error('\nOne or more entries failed validation — see above. index.json was still written for the entries that passed.');
  process.exit(1);
}
