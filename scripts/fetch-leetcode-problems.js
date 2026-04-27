#!/usr/bin/env node
// One-time script: fetch all LeetCode problems and write src/data/leetcode-problems.json
// Run: node scripts/fetch-leetcode-problems.js

import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, '../src/data/leetcode-problems.json');

// Step 1: REST API for full problem list (title, slug, difficulty, paid_only) - all 3900+
async function fetchAllRest() {
  const res = await fetch('https://leetcode.com/api/problems/all/', {
    headers: { 'Referer': 'https://leetcode.com', 'User-Agent': 'Mozilla/5.0' },
  });
  if (!res.ok) throw new Error(`REST API ${res.status}`);
  const j = await res.json();
  const DIFF = { 1: 'Easy', 2: 'Medium', 3: 'Hard' };
  const db = {};
  for (const item of j.stat_status_pairs) {
    const num = String(item.stat.frontend_question_id);
    if (!num || isNaN(Number(num))) continue;
    db[num] = {
      title: item.stat.question__title,
      slug: item.stat.question__title_slug,
      difficulty: DIFF[item.difficulty.level] || 'Medium',
      tags: [],
    };
  }
  return db;
}

// Step 2: GraphQL for tags — server caps at 100/page so use skip=0,100,200,...
async function fetchTagsPage(skip) {
  const res = await fetch('https://leetcode.com/graphql/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Referer': 'https://leetcode.com', 'User-Agent': 'Mozilla/5.0' },
    body: JSON.stringify({
      query: `query { questionList(categorySlug:"",limit:100,skip:${skip},filters:{}) { data { questionFrontendId topicTags { name } } } }`,
    }),
  });
  if (!res.ok) throw new Error(`GraphQL ${res.status}`);
  const j = await res.json();
  return j.data.questionList.data;
}

async function main() {
  console.log('Step 1: Fetching all problems via REST API...');
  const db = await fetchAllRest();
  console.log(`  Got ${Object.keys(db).length} problems`);

  console.log('Step 2: Fetching topic tags via GraphQL (100/page)...');
  const total = Object.keys(db).length;
  let tagged = 0;
  for (let skip = 0; skip < total + 200; skip += 100) {
    process.stdout.write(`  skip=${skip}...`);
    const items = await fetchTagsPage(skip);
    if (items.length === 0) { console.log(' done (empty page)'); break; }
    for (const item of items) {
      const num = String(Number(item.questionFrontendId));
      if (db[num] && item.topicTags.length > 0) {
        db[num].tags = item.topicTags.map(t => t.name);
        tagged++;
      }
    }
    console.log(` ${items.length} items`);
    await new Promise(r => setTimeout(r, 150));
  }
  console.log(`  Tagged ${tagged} problems`);

  writeFileSync(OUT, JSON.stringify(db, null, 0));
  console.log(`\nWrote ${Object.keys(db).length} problems to ${OUT}`);
}

main().catch(e => { console.error(e); process.exit(1); });
