const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const OpenAI = require('openai');
require('dotenv').config();

if (!process.env.OPENAI_API_KEY) {
  console.error('❌ OPENAI_API_KEY in .env is missing!');
  process.exit(1);
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function slugify(text) {
  return text.toString()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue')
    .replace(/Ä/g, 'Ae').replace(/Ö/g, 'Oe').replace(/Ü/g, 'Ue')
    .replace(/ß/g, 'ss')
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

let selectors = [];
try {
  if (fs.existsSync('./selectors.json')) {
    const content = fs.readFileSync('./selectors.json', 'utf-8');
    selectors = content.trim() ? JSON.parse(content) : [];
  }
} catch (e) {
  console.warn('⚠️ Could not load selectors.json:', e.message);
}

function enhanceExpectBlocks(code) {
  return code.replace(
    /await expect\(([^)]+)\)\.to([a-zA-Z]+)\(([^)]+)\);/g,
    (match, value, assertion, expected) => {
      const cleanExpected = expected.replace(/['"`]/g, '');
      return `
try {
  await expect(${value}).to${assertion}(${expected});
} catch (err) {
  throw new Error("❌ Expected: ${assertion} with '${cleanExpected}'\\nActual: " + ${value} + "\\n" + err.message);
}`;
    }
  );
}

function wrapWithErrorLogging(code, slug) {
  return code.replace(
    /test\(([^,]+),\s*async\s*\(\{\s*page\s*\}\)\s*=>\s*\{/,
    `test($1, async ({ page }) => {
  try {`
  ).replace(
    /\}\);?\s*$/,
    `  } catch (err) {
    const fs = require('fs');
    const path = require('path');
    const dir = path.join(__dirname, 'test-results', 'errors');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, '${slug}.txt'), err.stack || err.message);
    throw err;
  }
});`
  );
}

async function getQuizLinks() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://www.saucedemo.com');

  // Since saucedemo doesn't have quiz links, for demonstration let's just use the homepage
  // You can customize this for your real target URLs
  const links = [ 'https://www.saucedemo.com/' ];

  await browser.close();
  return Array.from(new Set(links));
}

// Neu: Liest vorhandene Testtitel aus bestehenden Spec-Dateien
function getExistingTestTitles() {
  const dir = './generated';
  if (!fs.existsSync(dir)) return [];
  const files = fs.readdirSync(dir);
  const titles = [];
  for (const file of files) {
    if (file.endsWith('.spec.js')) {
      const content = fs.readFileSync(path.join(dir, file), 'utf-8');
      const match = content.match(/\/\/ Goal:\s*(.+)/i);
      if (match) {
        titles.push(match[1].trim().toLowerCase());
      }
    }
  }
  return titles;
}

// Optimized GPT prompt: adds login, uses proper Playwright syntax, and step structure
function promptForTest(url, selectors, index) {
  return `
You are an experienced QA engineer and Playwright test generator.

Generate a Playwright test script for the URL: ${url}

Use the following known UI selectors from this list:

${JSON.stringify(selectors, null, 2)}

Requirements:
- Begin with a login step to https://www.saucedemo.com using username "standard_user" and password "secret_sauce".
- Use "await test.step('description', async () => { ... })" for all logical steps.
- Use "await expect(...).toHaveURL(...)" to verify navigation.
- Use "await expect(page.locator(...)).toHaveCount(...)" to check element counts.
- Include adding multiple items to cart, verifying cart content, removing items, and checking results.
- Do NOT add extra comments except the header line like "// Goal: ..."
- Use "const { test, expect } = require('@playwright/test');" and async test functions.
- Make sure all awaits are correct and the test can run end-to-end without errors.

This is test number ${index}.
`;
}

async function generate() {
  try {
    fs.mkdirSync('./generated', { recursive: true });

    const existingTitles = getExistingTestTitles();

    const quizLinks = await getQuizLinks();
    if (quizLinks.length === 0) {
      console.log('⚠️ No quiz links found.');
      return;
    }
    console.log('🔍 Found quiz links:', quizLinks);

    for (let i = 0; i < quizLinks.length; i++) {
      const url = quizLinks[i];
      const prompt = promptForTest(url, selectors, i + 1);

      const codeRes = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
      });

      let code = codeRes.choices[0].message.content.trim();
      code = code.replace(/```(?:js|javascript)?\n?/g, '').replace(/```$/, '').trim();

      const titleMatch = code.match(/\/\/ Goal:\s*(.+)/i);
      const title = titleMatch ? titleMatch[1].trim() : `test-${i + 1}`;
      const slug = slugify(title);

      // Prüfen, ob Testtitel schon existiert — falls ja, überspringen
      if (existingTitles.includes(title.toLowerCase())) {
        console.log(`⚠️ Test mit Titel "${title}" existiert bereits. Überspringe...`);
        continue;
      }
      existingTitles.push(title.toLowerCase());

      const enhancedCode = enhanceExpectBlocks(code);
      const finalCode = wrapWithErrorLogging(enhancedCode, slug);

      const filename = `./generated/${slug}.spec.js`;
      const descFilename = `./generated/${slug}.txt`;

      fs.writeFileSync(filename, finalCode);

      // Generate description of the test actions and expectations
      const descPrompt = `
Here is the goal of the test:
${title}

Describe step by step the actions performed and the expected results.

Provide the title as header:
=== Test Goal ===
${title}

Test code:
${code}
`;

      const descRes = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: descPrompt }],
      });

      const description = descRes.choices[0].message.content.trim();
      fs.writeFileSync(descFilename, description);

      console.log(`✅ Test for ${url} saved as ${filename}`);
      console.log(`📝 Description saved as ${descFilename}`);
    }
  } catch (err) {
    console.error('❌ Error generating tests:', err);
  }
}

generate();
