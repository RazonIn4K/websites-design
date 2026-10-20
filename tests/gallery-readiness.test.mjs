import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const packageRequire = createRequire(path.join(root, "gallery/package.json"));
const ts = packageRequire("typescript");
const React = packageRequire("react");
const runtime = packageRequire("react/jsx-runtime");
const { renderToStaticMarkup } = packageRequire("react-dom/server");

const elements = (node) => !node || typeof node !== "object" ? []
  : Array.isArray(node) ? node.flatMap(elements)
    : [node, ...elements(node.props?.children)];
const text = (node) => typeof node === "string" ? node
  : Array.isArray(node) ? node.map(text).join("")
    : node && typeof node === "object" ? text(node.props?.children) : "";

function language(locale, menuKind = "default") {
  return {
    lang: locale,
    imgBase: "/unused-local-fixture",
    blur: {},
    layout: { menuKind },
    t: {
      nav: { menu: "Categories" },
      menu: {
        heading: "Synthetic catalog",
        categories: ["first", "second", "third"].map((id) => ({
          id, name: `${locale}-${id}`, blurb: `${id} details`,
          items: [{ name: `${id} item`, desc: "Synthetic description", price: "$1", tags: [] }],
        })),
      },
    },
  };
}

// Actual component/hook source is transpiled locally. Rendering below uses real
// ReactDOMServer; client checks use controlled hooks, not a browser or ReactDOM
// hydration scheduler. Imports fail closed outside this explicit fixture.
function modules(react, jsxRuntime, context) {
  const cache = new Map();
  function load(relative) {
    const file = path.join(root, "gallery", relative);
    if (cache.has(file)) return cache.get(file);
    const compiled = ts.transpileModule(readFileSync(file, "utf8"), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
    }).outputText;
    const module = { exports: {} };
    const require = (specifier) => {
      if (specifier === "react") return react;
      if (specifier === "react/jsx-runtime") return jsxRuntime;
      if (specifier === "@/components/LanguageProvider") return { useLang: () => context };
      if (specifier === "@/lib/use-hydrated") return load("lib/use-hydrated.ts");
      if (specifier === "next/image") return { __esModule: true, default: "img" };
      if (specifier === "motion/react") return { motion: { span: ({ children, className }) => jsxRuntime.jsx("span", { children, className }) } };
      if (specifier === "@/components/motion") return { Reveal: ({ children }) => jsxRuntime.jsx("div", { children }) };
      if (specifier === "@/components/TiltCard") return { TiltFigure: ({ children }) => jsxRuntime.jsx("figure", { children }) };
      if (specifier === "@/components/SectionHeader") return { SectionHeader: ({ heading }) => jsxRuntime.jsx("h2", { children: heading }) };
      throw new Error("Unmocked import forbidden: " + specifier);
    };
    vm.runInNewContext(compiled, { module, exports: module.exports, require }, { filename: file, timeout: 2000 });
    cache.set(file, module.exports);
    return module.exports;
  }
  return load;
}

function clientFixture(locale, menuKind) {
  const context = language(locale, menuKind), slots = [];
  let cursor = 0, phase = "hydrating", Component;
  const react = {
    useState(initial) {
      const index = cursor++;
      if (!(index in slots)) slots[index] = typeof initial === "function" ? initial() : initial;
      return [slots[index], (next) => { slots[index] = typeof next === "function" ? next(slots[index]) : next; }];
    },
    useSyncExternalStore(_subscribe, getSnapshot, getServerSnapshot) {
      return phase === "hydrating" ? getServerSnapshot() : getSnapshot();
    },
  };
  const jsx = (type, props) => ({ type, props });
  const load = modules(react, { jsx, jsxs: jsx }, context);
  return {
    context,
    mount(name) { Component = load(`components/${name}.tsx`)[name]; return this.render(); },
    render() { cursor = 0; return Component(); },
    afterHydration() { phase = "client"; return this.render(); },
  };
}

test("hydration hook uses stable false server/true client snapshots and no event subscription", () => {
  const calls = [];
  const load = modules({ useSyncExternalStore(...args) { calls.push(args); return args[1](); } }, {}, {});
  const { useHydrated } = load("lib/use-hydrated.ts");
  assert.equal(useHydrated(), true);
  assert.equal(useHydrated(), true);
  const [subscribe, client, server] = calls[0];
  assert.equal(server(), false); assert.equal(client(), true);
  assert.equal(calls[1][0], subscribe); assert.equal(calls[1][1], client); assert.equal(calls[1][2], server);
  let notified = false;
  const cleanup = subscribe(() => { notified = true; });
  assert.equal(typeof cleanup, "function"); cleanup();
  assert.equal(notified, false);
});

for (const locale of ["en", "es"]) {
  test(`${locale}: actual React server render keeps demo acknowledgment disabled and input-free`, () => {
    const load = modules(React, runtime, language(locale));
    const html = renderToStaticMarkup(React.createElement(load("components/LeadForm.tsx").LeadForm));
    assert.match(html, /<button[^>]*type="button"[^>]*disabled=""/);
    assert.doesNotMatch(html, /<(?:form|input|textarea|select)\b/);
    assert.match(html, /<noscript>/);
    assert.match(html, /role="status" aria-live="polite"/);
  });

  test(`${locale}: client-snapshot fixture enables only the existing local acknowledgment`, () => {
    const f = clientFixture(locale), tree = f.mount("LeadForm");
    assert.equal(elements(tree).find((e) => e.type === "button").props.disabled, true);
    let hydrated = f.afterHydration();
    const button = elements(hydrated).find((e) => e.type === "button");
    assert.equal(button.props.disabled, false); assert.equal(button.props.type, "button");
    assert.equal(text(elements(hydrated).find((e) => e.props?.role === "status")), "");
    button.props.onClick(); hydrated = f.render();
    assert.match(text(elements(hydrated).find((e) => e.props?.role === "status")), locale === "es" ? /No se envió ninguna consulta/ : /No inquiry was sent/);
    assert.equal(elements(hydrated).filter((e) => ["form", "input", "textarea", "select"].includes(e.type)).length, 0);
  });

  for (const kind of ["default", "services", "shelf"]) {
    test(`${locale}/${kind}: actual React server render exposes all categories with disabled filters`, () => {
      const load = modules(React, runtime, language(locale, kind));
      const html = renderToStaticMarkup(React.createElement(load("components/MenuSection.tsx").MenuSection));
      assert.equal((html.match(/<button\b/g) || []).length, 3);
      assert.equal((html.match(/disabled=""/g) || []).length, 3);
      assert.equal((html.match(/class="motion-safe:animate-rise"/g) || []).length, 3);
      assert.doesNotMatch(html, /\shidden(?:=""|>|\s)/);
      for (const id of ["first", "second", "third"]) assert.ok(html.includes(`${id} item`));
    });

    test(`${locale}/${kind}: client-snapshot fixture enables filters and preserves selection on rerender`, () => {
      const f = clientFixture(locale, kind), tree = f.mount("MenuSection");
      const buttons = (node) => elements(node).filter((e) => e.type === "button");
      const panels = (node) => elements(node).filter((e) => e.props?.className === "motion-safe:animate-rise");
      assert.ok(buttons(tree).every((button) => button.props.disabled));
      assert.ok(panels(tree).every((panel) => !panel.props.hidden));
      let hydrated = f.afterHydration();
      assert.ok(buttons(hydrated).every((button) => !button.props.disabled));
      assert.deepEqual(panels(hydrated).map((panel) => panel.props.hidden), [false, true, true]);
      buttons(hydrated)[1].props.onClick(); hydrated = f.render();
      assert.deepEqual(buttons(hydrated).map((button) => button.props["aria-pressed"]), [false, true, false]);
      assert.deepEqual(panels(hydrated).map((panel) => panel.props.hidden), [true, false, true]);
      f.context.lang = locale === "es" ? "en" : "es";
      assert.equal(buttons(f.render())[1].props["aria-pressed"], true);
    });
  }

  test(`${locale}/carte: actual React server render retains the complete non-filtered menu`, () => {
    const load = modules(React, runtime, language(locale, "carte"));
    const html = renderToStaticMarkup(React.createElement(load("components/MenuSection.tsx").MenuSection));
    assert.doesNotMatch(html, /<button\b|\shidden(?:=""|>|\s)/);
    for (const id of ["first", "second", "third"]) assert.ok(html.includes(`${id} item`));
  });
}
