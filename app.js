/* Prompt Forge — all logic runs in the browser. No backend, no API calls. */

const STACKS = {
  auto: {
    label: "Let Claude decide",
    tree: [],
    commands: { install: "(Claude: choose & document this)", dev: "(Claude: choose & document this)", test: "(Claude: choose & document this)" },
  },
  "react-vite": {
    label: "React + Vite (frontend)",
    tree: ["src/main.jsx", "src/App.jsx", "src/components/", "src/styles/index.css", "index.html", "package.json", "vite.config.js", "README.md"],
    commands: { install: "npm install", dev: "npm run dev", test: "npm run test" },
  },
  nextjs: {
    label: "Next.js (full-stack)",
    tree: ["app/layout.tsx", "app/page.tsx", "app/api/", "components/", "lib/", "public/", "package.json", "next.config.js", "README.md"],
    commands: { install: "npm install", dev: "npm run dev", test: "npm run test" },
  },
  "node-express": {
    label: "Node + Express (API)",
    tree: ["src/index.js", "src/routes/", "src/controllers/", "src/middleware/", "src/models/", "package.json", ".env.example", "README.md"],
    commands: { install: "npm install", dev: "npm run dev", test: "npm run test" },
  },
  fastapi: {
    label: "Python + FastAPI (API)",
    tree: ["app/main.py", "app/routers/", "app/models/", "app/schemas/", "tests/", "requirements.txt", ".env.example", "README.md"],
    commands: { install: "pip install -r requirements.txt", dev: "uvicorn app.main:app --reload", test: "pytest" },
  },
  "python-cli": {
    label: "Python CLI tool",
    tree: ["src/cli.py", "src/core/", "tests/", "pyproject.toml", "README.md"],
    commands: { install: "pip install -e .", dev: "python -m src.cli", test: "pytest" },
  },
  static: {
    label: "Static HTML / CSS / JS",
    tree: ["index.html", "css/style.css", "js/main.js", "assets/", "README.md"],
    commands: { install: "(none)", dev: "open index.html  # or use a local server", test: "(manual)" },
  },
};

const INTENT = {
  feature: "Implement the following",
  bug: "Find and fix the following bug",
  refactor: "Refactor the following without changing behavior",
  explain: "Explain the following part of this codebase",
  review: "Review the following and suggest improvements",
};

function generateQuick(d) {
  const task = (d.task || "").trim();
  if (!task) return "Add a short description of what you want done.";

  const area = (d.area || "").trim();
  const constraints = (d.constraints || "").trim();
  const wantPlan = !!d.plan;
  const wantTests = !!d.tests;
  const workType = (d.work_type || "feature").trim();
  const intent = INTENT[workType] || "Help with the following";

  const parts = [];
  parts.push(`## Task\n${intent}:\n\n${task}`);

  if (area) parts.push(`## Where to look\nRelevant files / area of the codebase:\n${area}`);

  const steps = [];
  if (wantPlan) steps.push("Start by outlining your approach in a few bullet points before writing any code. Wait for nothing — just proceed once the plan is clear.");
  if (workType === "bug") steps.push("Reproduce or locate the cause first, then make the smallest change that fixes it.");
  if (wantTests) steps.push("Add or update tests that cover this, then run the test suite and confirm it passes.");
  steps.push("Keep changes focused on this task and avoid touching unrelated code.");
  parts.push("## How to proceed\n" + steps.map((s, i) => `${i + 1}. ${s}`).join("\n"));

  if (constraints) {
    const lines = constraints.split("\n").map((c) => c.trim()).filter(Boolean);
    parts.push("## Constraints\n" + lines.map((c) => `- ${c}`).join("\n"));
  }

  parts.push("## When you're done\nGive me a short summary of what you changed and why, and call out anything I should review or test manually.");
  return parts.join("\n\n");
}

function generateScaffold(d) {
  const name = (d.name || "").trim() || "My Project";
  let desc = (d.desc || "").trim();
  const stackKey = (d.stack || "auto").trim();
  const stack = STACKS[stackKey] || STACKS.auto;
  const featuresRaw = (d.features || "").trim();

  const features = featuresRaw.split("\n").map((f) => f.trim().replace(/^[-•*]\s*/, "").trim()).filter(Boolean);
  if (!desc) desc = "TODO: describe what this product does and who it is for.";

  const cmd = stack.commands;
  const featBlock = features.length ? features.map((f) => `- ${f}`).join("\n") : "- TODO: list the core features";
  const treeBlock = stack.tree.length ? stack.tree.join("\n") : "(to be proposed by Claude during scaffolding)";

  const claudeMd = `# ${name}

## Overview
${desc}

## Core features
${featBlock}

## Tech stack
${stack.label}

## Project structure
\`\`\`
${treeBlock}
\`\`\`

## Commands
\`\`\`bash
# Install dependencies
${cmd.install}

# Run locally
${cmd.dev}

# Run tests
${cmd.test}
\`\`\`

## Conventions for Claude
- Keep functions small and named for what they do.
- Match the existing file structure and naming when adding code.
- Prefer clear, readable code over clever code; add comments only where intent isn't obvious.
- Update this CLAUDE.md when you add a new command, dependency, or top-level folder.
- Don't add libraries without noting them here and in the dependency file.

## Definition of done
- The feature works end to end and is reachable from the UI / entry point.
- Tests (where they exist) pass.
- README and CLAUDE.md reflect any new setup steps.
`;

  const featInline = features.length ? features.map((f) => `  - ${f}`).join("\n") : "  - (none specified — propose sensible defaults)";
  const structLine = stack.tree.length
    ? "Use roughly this structure as a starting point (adjust where it genuinely improves things):\n" + stack.tree.map((t) => `  ${t}`).join("\n")
    : "Propose a clean, conventional structure for this stack and explain it briefly before creating files.";

  const scaffoldPrompt = `## Goal
Scaffold a new project called "${name}".

What it is:
${desc}

Core features to support:
${featInline}

Preferred stack: ${stack.label}

## What I want you to do
1. First, create a \`CLAUDE.md\` at the project root. I'll paste my draft below — use it as the source of truth and refine it if you spot gaps.
2. ${structLine}
3. Create the starter files with minimal working boilerplate — enough that the dev command runs and shows something, but no half-built features.
4. Add a \`README.md\` with setup and run instructions, and a dependency file appropriate to the stack.
5. Don't implement the features yet. Stop after the skeleton runs, then list the suggested order for building the features above.

## Constraints
- Keep the initial commit small and runnable.
- Note any tool or version assumptions in the README.
- Ask me before adding anything heavy (auth, database, paid services) that isn't implied above.

---
Here is my draft CLAUDE.md to start from:

${claudeMd}`;

  return { claude_md: claudeMd, scaffold_prompt: scaffoldPrompt };
}

/* ---- Example ideas shown in the sidebar ---- */
const EXAMPLES = {
  quick: [
    { label: "Fix a bug", fill: { work_type: "bug", task: "Users get logged out at random after a few minutes — find out why and fix it.", area: "the session / auth handling", plan: true, tests: true } },
    { label: "Add a feature", fill: { work_type: "feature", task: "Add a dark mode toggle that remembers the user's choice between visits.", area: "", plan: true, tests: true } },
    { label: "Refactor", fill: { work_type: "refactor", task: "This file has grown into one giant function. Split it into smaller, well-named pieces.", area: "the file I have open", plan: true, tests: false } },
    { label: "Explain the codebase", fill: { work_type: "explain", task: "Walk me through how a request flows through this app, from entry point to response.", area: "", plan: false, tests: false } },
  ],
  scaffold: [
    { label: "Hike-logging app", fill: { name: "Trailhead", stack: "react-vite", desc: "A web app where casual hikers log trails they've finished and get suggestions for what to try next.", features: "Log a completed hike\nBrowse nearby trails\nGet recommendations" } },
    { label: "Todo REST API", fill: { name: "Tasky", stack: "fastapi", desc: "A simple REST API for managing todo lists, meant to back a mobile app.", features: "Create and list todos\nMark a todo done\nGroup todos into lists" } },
    { label: "CLI tool", fill: { name: "Tidy", stack: "python-cli", desc: "A command-line tool that organizes a messy downloads folder into sorted subfolders.", features: "Sort files by type\nDry-run preview\nUndo last run" } },
    { label: "Portfolio site", fill: { name: "My Portfolio", stack: "static", desc: "A personal portfolio site to show off projects and link to my socials.", features: "Project gallery\nAbout section\nContact links" } },
  ],
};

/* ---- DOM wiring (skipped when loaded in Node for tests) ---- */
if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", () => {
    const $ = (id) => document.getElementById(id);
    const val = (id) => $(id).value;

    // stack dropdown
    const sel = $("s-stack");
    for (const [k, v] of Object.entries(STACKS)) {
      const o = document.createElement("option");
      o.value = k; o.textContent = v.label; sel.appendChild(o);
    }

    // tabs
    const tabs = {
      quick: { btn: $("tab-quick"), panel: $("panel-quick") },
      scaffold: { btn: $("tab-scaffold"), panel: $("panel-scaffold") },
    };
    function activate(key) {
      for (const [k, t] of Object.entries(tabs)) {
        const on = k === key;
        t.btn.setAttribute("aria-selected", on);
        t.panel.classList.toggle("hidden", !on);
      }
    }
    tabs.quick.btn.onclick = () => activate("quick");
    tabs.scaffold.btn.onclick = () => activate("scaffold");

    // build sidebar examples
    const exWrap = $("examples");
    function group(title, items, mode) {
      const h = document.createElement("div");
      h.className = "ex-group-title";
      h.textContent = title;
      exWrap.appendChild(h);
      items.forEach((ex) => {
        const b = document.createElement("button");
        b.className = "ex";
        b.textContent = ex.label;
        b.onclick = () => applyExample(mode, ex.fill);
        exWrap.appendChild(b);
      });
    }
    group("Quick request", EXAMPLES.quick, "quick");
    group("Scaffold a project", EXAMPLES.scaffold, "scaffold");

    function applyExample(mode, fill) {
      activate(mode);
      if (mode === "quick") {
        $("q-task").value = fill.task || "";
        $("q-type").value = fill.work_type || "feature";
        $("q-area").value = fill.area || "";
        $("q-constraints").value = fill.constraints || "";
        $("q-plan").checked = !!fill.plan;
        $("q-tests").checked = !!fill.tests;
        runQuick();
      } else {
        $("s-name").value = fill.name || "";
        $("s-stack").value = fill.stack || "auto";
        $("s-desc").value = fill.desc || "";
        $("s-features").value = fill.features || "";
        runScaffold();
      }
      $("sidebar").classList.remove("open"); // close drawer on mobile
    }

    // helpers
    function escapeHtml(s) { return s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c])); }
    function panelHtml(name, dotColor, text) {
      return `<div class="panel">
        <div class="panel-bar">
          <span class="dot" style="background:${dotColor}"></span>
          <span class="dot" style="background:#3A4258"></span>
          <span class="panel-name">${name}</span>
          <button class="copy">Copy</button>
        </div>
        <pre>${escapeHtml(text)}</pre>
      </div>`;
    }
    function wireCopy(container) {
      container.querySelectorAll(".copy").forEach((btn) => {
        btn.onclick = () => {
          const text = btn.closest(".panel").querySelector("pre").textContent;
          navigator.clipboard.writeText(text).then(() => {
            const old = btn.textContent; btn.textContent = "Copied ✓";
            setTimeout(() => (btn.textContent = old), 1400);
          });
        };
      });
    }
    function reveal(el) { el.classList.remove("show"); void el.offsetWidth; el.classList.add("show"); el.scrollIntoView({ behavior: "smooth", block: "nearest" }); }

    function runQuick() {
      const prompt = generateQuick({
        task: val("q-task"), work_type: val("q-type"), area: val("q-area"),
        constraints: val("q-constraints"), plan: $("q-plan").checked, tests: $("q-tests").checked,
      });
      const out = $("q-out");
      out.innerHTML = panelHtml("your-prompt.md", "#F0A536", prompt);
      wireCopy(out); reveal(out);
    }
    function runScaffold() {
      const res = generateScaffold({
        name: val("s-name"), stack: val("s-stack"), desc: val("s-desc"), features: val("s-features"),
      });
      const out = $("s-out");
      out.innerHTML = panelHtml("CLAUDE.md", "#5EC26A", res.claude_md) + panelHtml("scaffold-prompt.md", "#F0A536", res.scaffold_prompt);
      wireCopy(out); reveal(out);
    }

    $("q-go").onclick = runQuick;
    $("s-go").onclick = runScaffold;

    // mobile sidebar toggle
    $("menu").onclick = () => $("sidebar").classList.toggle("open");
  });
}

if (typeof module !== "undefined") module.exports = { generateQuick, generateScaffold, STACKS, EXAMPLES };
