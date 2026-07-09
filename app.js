/* seedforge — private, reproducible fake data generator.
   All logic runs in the browser. No network calls of any kind. */
"use strict";

/* ============================================================
   Deterministic PRNG
   cyrb53 string hash -> uint32 seed -> mulberry32 generator.
   Same (seed + schema + rowCount) => byte-identical output.
   ============================================================ */

function cyrb53(str, seed = 0) {
  let h1 = 0xdeadbeef ^ seed;
  let h2 = 0x41c6ce57 ^ seed;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}

function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* A small deterministic RNG object with convenience helpers.
   Each field draws from the same stream so output stays reproducible. */
function makeRng(seedString) {
  const seed = cyrb53(String(seedString)) >>> 0;
  const next = mulberry32(seed);
  return {
    next,
    int(min, max) { return Math.floor(next() * (max - min + 1)) + min; },
    float(min, max) { return next() * (max - min) + min; },
    pick(arr) { return arr[Math.floor(next() * arr.length)]; },
    bool() { return next() < 0.5; },
    hex(n) {
      let s = "";
      for (let i = 0; i < n; i++) s += "0123456789abcdef"[Math.floor(next() * 16)];
      return s;
    },
  };
}

/* ============================================================
   Inline data pools (no external files)
   ============================================================ */

const FIRST_INTL = [
  "James", "Maria", "Wei", "Aisha", "Liam", "Sofia", "Noah", "Olga", "Kenji", "Fatima",
  "Lucas", "Emma", "Arjun", "Chloe", "Mateo", "Yuki", "Ivan", "Nadia", "Omar", "Ingrid",
  "Diego", "Zara", "Hugo", "Amara", "Felix", "Leila", "Marcus", "Priya", "Elena", "Tariq",
  "Anders", "Mei", "Rafael", "Nour", "Sven", "Ava", "Kwame", "Lin", "Pablo", "Hana",
];
const LAST_INTL = [
  "Smith", "Garcia", "Chen", "Khan", "Muller", "Rossi", "Kim", "Novak", "Tanaka", "Silva",
  "Nguyen", "Ivanov", "Okafor", "Andersson", "Hassan", "Dubois", "Wang", "Costa", "Yilmaz", "Berg",
  "Popov", "Mbeki", "Fischer", "Kowalski", "Haddad", "Sato", "Moreno", "Larsson", "Petrov", "Cruz",
];

/* Filipino set for local flavor */
const FIRST_FIL = [
  "Jose", "Maria", "Andres", "Corazon", "Emilio", "Josefa", "Ramon", "Imelda", "Antonio", "Luzviminda",
  "Rodrigo", "Gloria", "Benigno", "Aurora", "Manuel", "Cristina", "Eduardo", "Rosario", "Fernando", "Divina",
  "Reynaldo", "Marilou", "Alfredo", "Editha", "Danilo", "Analyn", "Rogelio", "Jocelyn", "Nestor", "Melinda",
];
const LAST_FIL = [
  "Santos", "Reyes", "Cruz", "Bautista", "Ocampo", "Garcia", "Mendoza", "Torres", "Aquino", "Ramos",
  "Villanueva", "Del Rosario", "Castillo", "Aguilar", "Domingo", "Gonzales", "Flores", "Delos Reyes", "Mercado", "Salazar",
  "Pascual", "Rivera", "Manalo", "Dizon", "Espiritu", "Navarro", "Tolentino", "Magno", "Bacani", "Lansangan",
];

const CITIES = [
  "Springfield", "Riverton", "Lakeside", "Fairview", "Georgetown", "Kingston", "Bridgeport", "Ashford",
  "Manila", "Cebu", "Davao", "Quezon City", "Berlin", "Lisbon", "Osaka", "Nairobi",
  "Toronto", "Bergen", "Valencia", "Chiang Mai", "Cusco", "Galway", "Hobart", "Ghent",
];
const COUNTRIES = [
  "United States", "Philippines", "Japan", "Germany", "Brazil", "Kenya", "Canada", "Norway",
  "Spain", "Thailand", "Peru", "Ireland", "Australia", "Belgium", "Portugal", "India",
  "Mexico", "Sweden", "Vietnam", "Nigeria",
];
const STREETS = [
  "Maple", "Oak", "Cedar", "Rizal", "Bonifacio", "Mabini", "Harbor", "Sunset", "Willow", "Birch",
  "Market", "Union", "Pearl", "Acacia", "Ironwood", "Foundry", "Kiln", "Anvil", "Ember", "Forge",
];
const STREET_SUFFIX = ["St", "Ave", "Rd", "Blvd", "Ln", "Way", "Ct", "Dr"];

const COMPANIES = [
  "Ironclad Systems", "Bright Harbor Labs", "Northwind Trading", "Cobalt & Co", "Meridian Works",
  "Everforge Group", "Pinecrest Digital", "Kiln Analytics", "Ember Logistics", "Anvil Software",
  "Cascade Robotics", "Lighthouse Media", "Basalt Ventures", "Willow Grove Foods", "Halcyon Aerospace",
  "Redwood Freight", "Solstice Textiles", "Granite Financial", "Marigold Studios", "Vantage Dynamics",
];
const JOBS = [
  "Software Engineer", "Product Manager", "Data Analyst", "UX Designer", "DevOps Engineer",
  "Account Executive", "Marketing Lead", "QA Engineer", "Operations Manager", "Solutions Architect",
  "Content Strategist", "Support Specialist", "Finance Analyst", "Recruiter", "Site Reliability Engineer",
  "Business Analyst", "Project Coordinator", "Research Scientist", "Sales Engineer", "Technical Writer",
];
const DOMAINS = ["example.com", "mail.test", "inbox.dev", "sample.org", "demo.io", "noreply.test"];
const LOREM = [
  "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit", "sed", "do",
  "eiusmod", "tempor", "incididunt", "labore", "magna", "aliqua", "enim", "veniam", "quis", "nostrud",
  "ullamco", "nisi", "aliquip", "commodo", "consequat", "aute", "irure", "voluptate", "velit", "esse",
  "cillum", "fugiat", "nulla", "pariatur", "excepteur", "occaecat", "cupidatat", "proident", "culpa", "mollit",
];

/* Field type catalog: label + option schema + generator.
   `gen(rng, opts, ctx)` — ctx carries per-row state (name/email linkage). */
const TYPES = {
  uuid: {
    label: "uuid", group: "Identity", opts: [],
    gen(rng) {
      const h = rng.hex(32).split("");
      h[12] = "4";
      h[16] = "89ab"[Math.floor(rng.next() * 4)];
      const s = h.join("");
      return `${s.slice(0, 8)}-${s.slice(8, 12)}-${s.slice(12, 16)}-${s.slice(16, 20)}-${s.slice(20, 32)}`;
    },
  },
  fullName: {
    label: "full name", group: "Identity", opts: [],
    gen(rng, o, ctx) { ensureName(rng, ctx); return `${ctx._first} ${ctx._last}`; },
  },
  firstName: {
    label: "first name", group: "Identity", opts: [],
    gen(rng, o, ctx) { ensureName(rng, ctx); return ctx._first; },
  },
  lastName: {
    label: "last name", group: "Identity", opts: [],
    gen(rng, o, ctx) { ensureName(rng, ctx); return ctx._last; },
  },
  email: {
    label: "email", group: "Identity", opts: [],
    gen(rng, o, ctx) {
      ensureName(rng, ctx);
      const user = `${ctx._first}.${ctx._last}`.toLowerCase().replace(/[^a-z0-9.]/g, "");
      return `${user}${rng.int(1, 99)}@${rng.pick(DOMAINS)}`;
    },
  },
  username: {
    label: "username", group: "Identity", opts: [],
    gen(rng, o, ctx) {
      ensureName(rng, ctx);
      const base = (ctx._first[0] + ctx._last).toLowerCase().replace(/[^a-z0-9]/g, "");
      return `${base}${rng.int(10, 9999)}`;
    },
  },
  phone: {
    label: "phone", group: "Identity", opts: [],
    gen(rng) { return `+1-555-${String(rng.int(100, 999))}-${String(rng.int(1000, 9999))}`; },
  },
  street: {
    label: "street address", group: "Location", opts: [],
    gen(rng) { return `${rng.int(10, 9999)} ${rng.pick(STREETS)} ${rng.pick(STREET_SUFFIX)}`; },
  },
  city: { label: "city", group: "Location", opts: [], gen(rng) { return rng.pick(CITIES); } },
  country: { label: "country", group: "Location", opts: [], gen(rng) { return rng.pick(COUNTRIES); } },
  company: { label: "company", group: "Business", opts: [], gen(rng) { return rng.pick(COMPANIES); } },
  jobTitle: { label: "job title", group: "Business", opts: [], gen(rng) { return rng.pick(JOBS); } },
  price: {
    label: "price", group: "Business",
    opts: [
      { key: "symbol", label: "sym", def: "$", w: "narrow" },
      { key: "min", label: "min", def: 1, type: "number" },
      { key: "max", label: "max", def: 999, type: "number" },
    ],
    gen(rng, o) {
      const min = num(o.min, 1), max = num(o.max, 999);
      return `${o.symbol || "$"}${rng.float(min, max).toFixed(2)}`;
    },
  },
  integer: {
    label: "integer", group: "Numbers",
    opts: [
      { key: "min", label: "min", def: 0, type: "number" },
      { key: "max", label: "max", def: 1000, type: "number" },
    ],
    gen(rng, o) { return rng.int(num(o.min, 0), num(o.max, 1000)); },
  },
  decimal: {
    label: "decimal", group: "Numbers",
    opts: [
      { key: "min", label: "min", def: 0, type: "number" },
      { key: "max", label: "max", def: 100, type: "number" },
      { key: "precision", label: "prec", def: 2, type: "number", w: "narrow" },
    ],
    gen(rng, o) {
      const p = Math.max(0, Math.min(10, num(o.precision, 2)));
      return Number(rng.float(num(o.min, 0), num(o.max, 100)).toFixed(p));
    },
  },
  boolean: { label: "boolean", group: "Numbers", opts: [], gen(rng) { return rng.bool(); } },
  date: {
    label: "date", group: "Time",
    opts: [
      { key: "start", label: "from", def: "2020-01-01", type: "date", w: "wide" },
      { key: "end", label: "to", def: "2025-12-31", type: "date", w: "wide" },
    ],
    gen(rng, o) { return isoDate(randDate(rng, o.start, o.end)).slice(0, 10); },
  },
  datetime: {
    label: "datetime", group: "Time",
    opts: [
      { key: "start", label: "from", def: "2020-01-01", type: "date", w: "wide" },
      { key: "end", label: "to", def: "2025-12-31", type: "date", w: "wide" },
    ],
    gen(rng, o) { return randDate(rng, o.start, o.end).toISOString().replace(/\.\d{3}Z$/, "Z"); },
  },
  enum: {
    label: "enum", group: "Custom",
    opts: [{ key: "values", label: "values (comma-separated)", def: "active,pending,churned", w: "wide" }],
    gen(rng, o) {
      const list = String(o.values || "").split(",").map((s) => s.trim()).filter(Boolean);
      return list.length ? rng.pick(list) : "";
    },
  },
  lorem: {
    label: "lorem", group: "Custom",
    opts: [{ key: "words", label: "words", def: 6, type: "number", w: "narrow" }],
    gen(rng, o) {
      const n = Math.max(1, Math.min(200, num(o.words, 6)));
      const out = [];
      for (let i = 0; i < n; i++) out.push(rng.pick(LOREM));
      const s = out.join(" ");
      return s.charAt(0).toUpperCase() + s.slice(1);
    },
  },
  ipv4: {
    label: "ipv4", group: "Tech", opts: [],
    gen(rng) { return `${rng.int(1, 254)}.${rng.int(0, 255)}.${rng.int(0, 255)}.${rng.int(1, 254)}`; },
  },
  color: {
    label: "color hex", group: "Tech", opts: [],
    gen(rng) { return "#" + rng.hex(6); },
  },
  creditCard: {
    label: "credit-card (fake)", group: "Tech", opts: [],
    gen(rng) {
      // Non-functional test pattern — 4111 series, clearly fake.
      return `4111-${String(rng.int(1000, 9999))}-${String(rng.int(1000, 9999))}-${String(rng.int(1000, 9999))}`;
    },
  },
};

const TYPE_ORDER = [
  "uuid", "fullName", "firstName", "lastName", "email", "username", "phone",
  "street", "city", "country", "company", "jobTitle", "price",
  "integer", "decimal", "boolean", "date", "datetime",
  "enum", "lorem", "ipv4", "color", "creditCard",
];

/* Helpers ------------------------------------------------- */
function ensureName(rng, ctx) {
  if (ctx._first) return;
  // ~35% Filipino flavor, rest international; deterministic via rng.
  if (rng.next() < 0.35) {
    ctx._first = rng.pick(FIRST_FIL);
    ctx._last = rng.pick(LAST_FIL);
  } else {
    ctx._first = rng.pick(FIRST_INTL);
    ctx._last = rng.pick(LAST_INTL);
  }
}
function num(v, d) { const n = Number(v); return Number.isFinite(n) ? n : d; }
function randDate(rng, start, end) {
  const s = Date.parse(start || "2020-01-01");
  const e = Date.parse(end || "2025-12-31");
  const a = Number.isFinite(s) ? s : Date.parse("2020-01-01");
  const b = Number.isFinite(e) ? e : Date.parse("2025-12-31");
  const lo = Math.min(a, b), hi = Math.max(a, b);
  return new Date(lo + Math.floor(rng.next() * (hi - lo + 1)));
}
function isoDate(d) { return d.toISOString(); }

/* ============================================================
   State
   ============================================================ */

const STORAGE_KEY = "seedforge.v1";
let uid = 0;
const newId = () => `f${++uid}`;

const EXAMPLE_SCHEMA = () => [
  { id: newId(), name: "id", type: "uuid", opts: {} },
  { id: newId(), name: "full_name", type: "fullName", opts: {} },
  { id: newId(), name: "email", type: "email", opts: {} },
  { id: newId(), name: "country", type: "country", opts: {} },
  { id: newId(), name: "signup_date", type: "date", opts: { start: "2020-01-01", end: "2025-12-31" } },
  { id: newId(), name: "is_active", type: "boolean", opts: {} },
  { id: newId(), name: "credits", type: "integer", opts: { min: 0, max: 5000 } },
];

const state = {
  seed: "42",
  rows: 500,
  fields: EXAMPLE_SCHEMA(),
  sqlTable: "users",
  activeFmt: "csv",
  data: [],
};

/* default option values for a type */
function defaultOpts(type) {
  const o = {};
  (TYPES[type].opts || []).forEach((op) => { o[op.key] = op.def; });
  return o;
}

/* ============================================================
   Generation
   ============================================================ */

function generate() {
  const rng = makeRng(`${state.seed}::${state.rows}::${schemaSignature()}`);
  const rows = [];
  const n = clamp(state.rows, 1, 5000);
  for (let i = 0; i < n; i++) {
    const ctx = {};
    const row = {};
    for (const f of state.fields) {
      const name = f.name || f.type;
      row[name] = TYPES[f.type].gen(rng, f.opts || {}, ctx);
    }
    rows.push(row);
  }
  state.data = rows;
}

function schemaSignature() {
  return state.fields.map((f) => `${f.name}:${f.type}:${JSON.stringify(f.opts || {})}`).join("|");
}
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

/* ============================================================
   Exporters
   ============================================================ */

function columns() { return state.fields.map((f) => f.name || f.type); }

function csvEscape(v) {
  const s = v === null || v === undefined ? "" : String(v);
  if (/[",\n\r]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
  return s;
}
function toCSV() {
  const cols = columns();
  const lines = [cols.map(csvEscape).join(",")];
  for (const row of state.data) {
    lines.push(cols.map((c) => csvEscape(row[c])).join(","));
  }
  return lines.join("\n");
}

function toJSON() { return JSON.stringify(state.data, null, 2); }

function sqlValue(v) {
  if (v === null || v === undefined || v === "") return "NULL";
  if (typeof v === "boolean") return v ? "TRUE" : "FALSE";
  if (typeof v === "number") return String(v);
  return "'" + String(v).replace(/'/g, "''") + "'";
}
function toSQL() {
  const cols = columns();
  const table = (state.sqlTable || "users").trim() || "users";
  const colList = cols.map((c) => `"${c}"`).join(", ");
  const out = [];
  for (const row of state.data) {
    const vals = cols.map((c) => sqlValue(row[c])).join(", ");
    out.push(`INSERT INTO ${table} (${colList}) VALUES (${vals});`);
  }
  return out.join("\n");
}

function exportText(fmt) {
  if (fmt === "json") return toJSON();
  if (fmt === "sql") return toSQL();
  return toCSV();
}

/* ============================================================
   DOM rendering — schema
   ============================================================ */

const $ = (id) => document.getElementById(id);
const els = {
  fields: $("fields"),
  emptyState: $("empty-state"),
  addField: $("add-field"),
  loadExample: $("load-example"),
  emptyLoad: $("empty-load-example"),
  seed: $("seed"),
  rowsRange: $("rows-range"),
  rowsNumber: $("rows-number"),
  cast: $("cast"),
  castLabel: $("cast-label"),
  tableHead: $("table-head"),
  tableBody: $("table-body"),
  tableWrap: $("table-wrap"),
  exportOut: $("export-out"),
  tabs: [$("tab-csv"), $("tab-json"), $("tab-sql")],
  sqlTable: $("sql-table"),
  sqlLabel: $("sql-table-label"),
  copyBtn: $("copy-btn"),
  downloadBtn: $("download-btn"),
  previewSub: $("preview-sub"),
  toast: $("toast"),
};

function optGroupsHTML() {
  const groups = {};
  for (const t of TYPE_ORDER) {
    const g = TYPES[t].group;
    (groups[g] = groups[g] || []).push(t);
  }
  return groups;
}

function renderFields() {
  els.fields.innerHTML = "";
  const isEmpty = state.fields.length === 0;
  els.emptyState.hidden = !isEmpty;
  els.fields.hidden = isEmpty;

  const groups = optGroupsHTML();

  state.fields.forEach((f) => {
    const row = document.createElement("div");
    row.className = "field-row";
    row.setAttribute("role", "listitem");
    row.dataset.id = f.id;

    // name input
    const name = document.createElement("input");
    name.className = "field-name";
    name.type = "text";
    name.value = f.name;
    name.setAttribute("aria-label", "Column name");
    name.spellcheck = false;
    name.autocomplete = "off";
    name.addEventListener("input", () => { f.name = name.value; scheduleSave(); });

    // type select
    const sel = document.createElement("select");
    sel.className = "field-type";
    sel.setAttribute("aria-label", "Field type");
    for (const [gname, list] of Object.entries(groups)) {
      const og = document.createElement("optgroup");
      og.label = gname;
      for (const t of list) {
        const opt = document.createElement("option");
        opt.value = t;
        opt.textContent = TYPES[t].label;
        if (t === f.type) opt.selected = true;
        og.appendChild(opt);
      }
      sel.appendChild(og);
    }
    sel.addEventListener("change", () => {
      f.type = sel.value;
      f.opts = defaultOpts(f.type);
      renderFields();
      scheduleSave();
    });

    // remove
    const rm = document.createElement("button");
    rm.className = "field-remove";
    rm.type = "button";
    rm.textContent = "✕";
    rm.setAttribute("aria-label", `Remove field ${f.name || f.type}`);
    rm.addEventListener("click", () => {
      state.fields = state.fields.filter((x) => x.id !== f.id);
      renderFields();
      scheduleSave();
    });

    row.appendChild(name);
    row.appendChild(sel);
    row.appendChild(rm);

    // options body
    const optDefs = TYPES[f.type].opts || [];
    if (optDefs.length) {
      const body = document.createElement("div");
      body.className = "field-body";
      optDefs.forEach((op) => {
        const wrap = document.createElement("label");
        wrap.className = "opt";
        const lab = document.createElement("span");
        lab.className = "opt-label";
        lab.textContent = op.label;
        const inp = document.createElement("input");
        inp.className = "opt-input" + (op.w === "wide" ? " wide" : op.w === "narrow" ? " narrow" : "");
        inp.type = op.type || "text";
        inp.value = f.opts[op.key] !== undefined ? f.opts[op.key] : op.def;
        inp.autocomplete = "off";
        inp.addEventListener("input", () => { f.opts[op.key] = inp.value; scheduleSave(); });
        wrap.appendChild(lab);
        wrap.appendChild(inp);
        body.appendChild(wrap);
      });
      row.appendChild(body);
    }

    els.fields.appendChild(row);
  });
}

/* ============================================================
   DOM rendering — preview table
   ============================================================ */

const PREVIEW_ROWS = 12;

function classifyCell(v) {
  if (v === null || v === undefined || v === "") return "cell-null";
  if (typeof v === "number") return "cell-num";
  if (typeof v === "boolean") return "cell-bool";
  return "";
}

function renderTable(animate) {
  const cols = columns();
  els.tableHead.innerHTML = "";
  els.tableBody.innerHTML = "";

  const htr = document.createElement("tr");
  cols.forEach((c) => {
    const th = document.createElement("th");
    th.textContent = c;
    htr.appendChild(th);
  });
  els.tableHead.appendChild(htr);

  const slice = state.data.slice(0, PREVIEW_ROWS);
  slice.forEach((row, i) => {
    const tr = document.createElement("tr");
    tr.style.setProperty("--r", i);
    cols.forEach((c) => {
      const td = document.createElement("td");
      const v = row[c];
      const cls = classifyCell(v);
      if (cls) td.className = cls;
      td.textContent = v === null || v === undefined || v === "" ? "—" : String(v);
      tr.appendChild(td);
    });
    els.tableBody.appendChild(tr);
  });

  els.previewSub.textContent =
    `Showing ${slice.length} of ${state.data.length.toLocaleString()} rows. Export uses every row.`;

  if (animate) pour();
  refreshExport();
}

function pour() {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) return;
  els.tableWrap.classList.remove("is-pouring");
  // force reflow so the animation restarts
  void els.tableWrap.offsetWidth;
  els.tableWrap.classList.add("is-pouring");
  els.cast.classList.remove("is-casting");
  void els.cast.offsetWidth;
  els.cast.classList.add("is-casting");
  window.setTimeout(() => els.tableWrap.classList.remove("is-pouring"), 1600);
}

/* ============================================================
   Export panel
   ============================================================ */

function refreshExport() {
  const text = exportText(state.activeFmt);
  // cap preview text for very large sets to keep the DOM light
  const MAX = 60000;
  els.exportOut.textContent = text.length > MAX
    ? text.slice(0, MAX) + `\n… (${state.data.length.toLocaleString()} rows total — Download for the full file)`
    : text;

  const showSql = state.activeFmt === "sql";
  els.sqlTable.hidden = !showSql;
  els.sqlLabel.hidden = !showSql;
  els.downloadBtn.textContent = `Download ${state.activeFmt.toUpperCase()}`;
}

function setFormat(fmt) {
  state.activeFmt = fmt;
  els.tabs.forEach((t) => {
    const on = t.dataset.fmt === fmt;
    t.classList.toggle("is-active", on);
    t.setAttribute("aria-selected", on ? "true" : "false");
  });
  refreshExport();
}

function download() {
  const fmt = state.activeFmt;
  const text = exportText(fmt);
  const mime = fmt === "json" ? "application/json" : fmt === "sql" ? "application/sql" : "text/csv";
  const table = (state.sqlTable || "seedforge").trim() || "seedforge";
  const base = fmt === "sql" ? table : "seedforge";
  const blob = new Blob([text], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${base}.${fmt}`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  toast(`Downloaded ${state.data.length.toLocaleString()} rows as .${fmt}`);
}

async function copyOut() {
  const text = exportText(state.activeFmt);
  try {
    await navigator.clipboard.writeText(text);
    toast(`Copied ${state.activeFmt.toUpperCase()} to clipboard`);
  } catch (e) {
    // Clipboard API can be blocked; fall back to a manual selection.
    const r = document.createRange();
    r.selectNodeContents(els.exportOut);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(r);
    toast("Select all + copy from the output box");
  }
}

let toastTimer = null;
function toast(msg) {
  els.toast.textContent = msg;
  els.toast.hidden = false;
  void els.toast.offsetWidth;
  els.toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    els.toast.classList.remove("show");
  }, 1900);
}

/* ============================================================
   Cast / labels / gauge
   ============================================================ */

function updateCastLabel() {
  els.castLabel.textContent = `Cast ${clamp(state.rows, 1, 5000).toLocaleString()} rows`;
}
function updateGaugeFill() {
  const pct = ((state.rows - 1) / (5000 - 1)) * 100;
  els.rowsRange.style.setProperty("--fill", pct + "%");
}

function cast() {
  generate();
  renderTable(true);
  scheduleSave();
}

function setRows(v) {
  state.rows = clamp(Math.round(Number(v) || 1), 1, 5000);
  els.rowsRange.value = state.rows;
  els.rowsNumber.value = state.rows;
  updateCastLabel();
  updateGaugeFill();
  scheduleSave();
}

/* ============================================================
   Persistence
   ============================================================ */

let saveTimer = null;
function scheduleSave() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(save, 250);
}
function save() {
  try {
    const payload = {
      seed: state.seed,
      rows: state.rows,
      sqlTable: state.sqlTable,
      activeFmt: state.activeFmt,
      fields: state.fields.map((f) => ({ name: f.name, type: f.type, opts: f.opts })),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (e) { /* storage may be unavailable; app still works */ }
}
function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const p = JSON.parse(raw);
    if (!p || !Array.isArray(p.fields)) return false;
    state.seed = typeof p.seed === "string" ? p.seed : String(p.seed ?? "42");
    state.rows = clamp(Number(p.rows) || 500, 1, 5000);
    state.sqlTable = p.sqlTable || "users";
    state.activeFmt = ["csv", "json", "sql"].includes(p.activeFmt) ? p.activeFmt : "csv";
    state.fields = p.fields
      .filter((f) => f && TYPES[f.type])
      .map((f) => ({ id: newId(), name: String(f.name || f.type), type: f.type, opts: f.opts || defaultOpts(f.type) }));
    return true;
  } catch (e) { return false; }
}

/* ============================================================
   Wiring
   ============================================================ */

function loadExample() {
  state.fields = EXAMPLE_SCHEMA();
  state.seed = "42";
  setRows(500);
  els.seed.value = state.seed;
  renderFields();
  cast();
  toast("Loaded example schema");
}

function init() {
  const restored = load();

  els.seed.value = state.seed;
  setRows(state.rows);
  els.sqlTable.value = state.sqlTable;

  renderFields();
  setFormat(state.activeFmt);

  // events
  els.seed.addEventListener("input", () => { state.seed = els.seed.value; scheduleSave(); });
  els.rowsRange.addEventListener("input", () => setRows(els.rowsRange.value));
  els.rowsNumber.addEventListener("input", () => setRows(els.rowsNumber.value));
  els.addField.addEventListener("click", () => {
    state.fields.push({ id: newId(), name: `field_${state.fields.length + 1}`, type: "fullName", opts: {} });
    renderFields();
    scheduleSave();
  });
  els.loadExample.addEventListener("click", loadExample);
  els.emptyLoad.addEventListener("click", loadExample);
  els.cast.addEventListener("click", cast);
  els.tabs.forEach((t) => t.addEventListener("click", () => { setFormat(t.dataset.fmt); scheduleSave(); }));
  els.sqlTable.addEventListener("input", () => { state.sqlTable = els.sqlTable.value; refreshExport(); scheduleSave(); });
  els.copyBtn.addEventListener("click", copyOut);
  els.downloadBtn.addEventListener("click", download);

  // Generate immediately so the app (and screenshot) look complete on load.
  generate();
  renderTable(false);
}

document.addEventListener("DOMContentLoaded", init);
