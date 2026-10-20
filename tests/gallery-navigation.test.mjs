import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

// Execute the actual TSX handlers/effects with a small deterministic hook/JSX
// fixture. This is a source-level behavioral regression, not a DOM renderer,
// layout, real React scheduling, native keyboard or browser assertion.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const packageRequire = createRequire(path.join(root, "gallery/package.json"));
const ts = packageRequire("typescript");
const elements = (node) => {
  if (!node || typeof node !== "object") return [];
  if (Array.isArray(node)) return node.flatMap(elements);
  return [node, ...elements(node.props?.children)];
};

class Media extends EventTarget {
  matches = false;
  listeners = new Set();
  addEventListener(type, listener, options) {
    if (type === "change") this.listeners.add(listener);
    super.addEventListener(type, listener, options);
  }
  removeEventListener(type, listener, options) {
    if (type === "change") this.listeners.delete(listener);
    super.removeEventListener(type, listener, options);
  }
  change(matches) {
    this.matches = matches;
    this.dispatchEvent(new Event("change"));
  }
}

function fixture(locale = "en", desktop = false) {
  const media = new Media(); media.matches = desktop;
  const document = Object.assign(new EventTarget(), { body: { style: { overflow: "auto" } }, activeElement: null });
  const queries = [];
  const window = Object.assign(new EventTarget(), { scrollY: 0, matchMedia(query) { queries.push(query); return media; } });
  const lang = { lang: locale, biz: { shortName: "Concept", phone: "", phoneHref: "" }, hasPhone: false, layout: {}, t: { nav: { menu: "Menu", about: "About", gallery: "Gallery", visit: "Visit", order: "Try the demo" } } };
  const slots = [], referenceNodes = new WeakMap(), cache = new Map();
  let cursor = 0, dirty = false, pendingEffects = [], tree, Component;
  const node = (name) => ({ name, focus() { document.activeElement = this; }, querySelectorAll() { return [first, last]; } });
  const first = node("menu-first"), last = node("menu-last");
  const react = {
    useState(initial) {
      const index = cursor++;
      if (!slots[index]) slots[index] = { type: "state", value: typeof initial === "function" ? initial() : initial };
      return [slots[index].value, (next) => {
        const value = typeof next === "function" ? next(slots[index].value) : next;
        if (!Object.is(value, slots[index].value)) { slots[index].value = value; dirty = true; }
      }];
    },
    useRef(initial) {
      const index = cursor++;
      if (!slots[index]) slots[index] = { type: "ref", value: { current: initial } };
      return slots[index].value;
    },
    useEffect(callback, dependencies) {
      const index = cursor++, previous = slots[index];
      if (!previous || dependencies.some((value, i) => !Object.is(value, previous.dependencies[i]))) {
        pendingEffects.push(() => { previous?.cleanup?.(); slots[index] = { type: "effect", dependencies, cleanup: callback() }; });
      }
    },
  };
  const jsx = (type, props) => ({ type, props });
  function load(relative) {
    const file = path.join(root, "gallery", relative);
    if (cache.has(file)) return cache.get(file);
    const compiled = ts.transpileModule(readFileSync(file, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } }).outputText;
    const module = { exports: {} }; cache.set(file, module.exports);
    const require = (specifier) => {
      if (specifier === "react") return react;
      if (specifier === "react/jsx-runtime") return { jsx, jsxs: jsx, Fragment: "fragment" };
      if (specifier === "motion/react") return { motion: new Proxy({}, { get: (_, name) => "motion." + String(name) }), AnimatePresence: "animate-presence" };
      if (specifier === "@/components/LanguageProvider") return { useLang: () => lang };
      if (specifier === "@/components/icons") return { Phone: "phone-icon", Menu: "menu-icon", Close: "close-icon" };
      if (specifier.startsWith("@/lib/")) return load(specifier.slice(2) + ".ts");
      throw new Error("Unmocked module forbidden: " + specifier);
    };
    vm.runInNewContext(compiled, { module, exports: module.exports, require, window, document }, { filename: file, timeout: 2000 });
    cache.set(file, module.exports); return module.exports;
  }
  function flush() {
    let renders = 0;
    do {
      assert.ok(++renders < 12, "Hook fixture render must settle");
      dirty = false; cursor = 0; pendingEffects = []; tree = Component();
      for (const slot of slots) if (slot.type === "ref") slot.value.current = null;
      for (const element of elements(tree)) {
        const reference = element.props?.ref;
        if (!reference || typeof reference !== "object") continue;
        if (!referenceNodes.has(reference)) referenceNodes.set(reference, node(element.props.role === "dialog" ? "panel" : element.type === "a" ? "brand" : "opener"));
        reference.current = referenceNodes.get(reference);
      }
      for (const effect of pendingEffects) effect();
    } while (dirty);
    return tree;
  }
  function mount() { Component = load("components/Nav.tsx").Nav; return flush(); }
  const opener = () => elements(tree).find((element) => element.type === "button" && "aria-expanded" in (element.props || {}));
  return { media, document, queries, load, mount, flush, opener, open() { opener().props.onClick(); flush(); }, unmount() { for (const slot of slots) if (slot.type === "effect") slot.cleanup?.(); } };
}

for (const locale of ["en", "es"]) {
  test(`${locale}: opening on phone then desktop closes menu and restores scroll/focus`, () => {
    const f = fixture(locale); f.mount();
    try {
      f.open(); assert.equal(f.opener().props["aria-expanded"], true); assert.equal(f.document.body.style.overflow, "hidden");
      assert.equal(f.queries.at(-1), "(min-width: 64rem)", "Listener matches the CSS lg breakpoint");
      f.media.change(true); f.flush();
      assert.equal(f.opener().props["aria-expanded"], false);
      assert.equal(f.document.body.style.overflow, "auto");
      assert.equal(f.document.activeElement.name, "brand", "Desktop close focuses visible wordmark, not hidden mobile opener");
      assert.equal(f.media.listeners.size, 0);
      f.media.change(false); f.flush(); assert.equal(f.opener().props["aria-expanded"], false);
      f.open(); assert.equal(f.opener().props["aria-expanded"], true);
    } finally { f.unmount(); }
  });
}
test("Escape closes and restores previous overflow plus mobile opener focus", () => {
  const f = fixture(); f.mount();
  try {
    f.open(); const event = new Event("keydown", { cancelable: true }); event.key = "Escape";
    f.document.dispatchEvent(event); f.flush();
    assert.equal(f.opener().props["aria-expanded"], false); assert.equal(f.document.body.style.overflow, "auto"); assert.equal(f.document.activeElement.name, "opener"); assert.equal(f.media.listeners.size, 0);
  } finally { f.unmount(); }
});
test("a still-mobile media event keeps the menu open", () => {
  const f = fixture(); f.mount();
  try { f.open(); f.media.change(false); f.flush(); assert.equal(f.opener().props["aria-expanded"], true); assert.equal(f.document.body.style.overflow, "hidden"); }
  finally { f.unmount(); }
});
test("a desktop opening attempt does not leave scroll locked", () => {
  const f = fixture("en", true); f.mount();
  try { f.open(); assert.equal(f.opener().props["aria-expanded"], false); assert.equal(f.document.body.style.overflow, "auto"); assert.equal(f.document.activeElement.name, "brand"); }
  finally { f.unmount(); }
});
test("unmount restores scroll and removes breakpoint reaction", () => {
  const f = fixture(); f.mount(); f.open(); f.unmount();
  assert.equal(f.document.body.style.overflow, "auto"); assert.equal(f.media.listeners.size, 0);
});
for (const [locale, home, contact] of [["en", "https://razonworks.com/", "https://razonworks.com/contact/"], ["es", "https://razonworks.com/es/", "https://razonworks.com/es/contacto/"]]) {
  test(`${locale}: actual notice links return to matching RazonWorks locale`, () => {
    const f = fixture(locale), tree = f.load("components/DemoNotice.tsx").DemoNotice();
    const anchors = elements(tree).filter((element) => element.type === "a");
    assert.equal(anchors[0].props.href, "/", "All designs remains an internal gallery anchor");
    assert.equal(anchors[1].props.href, home); assert.equal(anchors[2].props.href, contact);
    assert.equal(anchors[2].props.children, locale === "es" ? "Contactar RazonWorks" : "Contact RazonWorks");
    assert.equal(elements(tree).filter((element) => ["form", "input", "textarea"].includes(element.type)).length, 0);
  });
}
