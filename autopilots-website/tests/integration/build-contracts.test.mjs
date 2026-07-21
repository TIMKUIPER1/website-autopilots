import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

test("canonieke conversieroutes bestaan in de build", () => {
  for (const route of [
    "nl/afspraak/index.html",
    "nl/bestel-direct/index.html",
    "nl/voor-wie/autobedrijven/index.html",
    "nl/producten/ai-inboxmedewerker/index.html",
  ])
    assert.equal(existsSync(`dist/${route}`), true, route);
});

test("oude Nederlandse pagina's zijn noindex fallback", () => {
  for (const route of [
    "producten/index.html",
    "afspraak/index.html",
    "voor-wie/index.html",
  ])
    assert.match(
      readFileSync(`dist/${route}`, "utf8"),
      /<meta name="robots" content="noindex,follow"/,
    );
});

test("interactieve elementen hebben een herkenbare bestemming of naam", () => {
  for (const route of [
    "nl/index.html",
    "nl/producten/index.html",
    "nl/voor-wie/index.html",
    "nl/proces/index.html",
    "nl/crew/index.html",
    "nl/kennisbank/index.html",
    "nl/afspraak/index.html",
    "nl/bestel-direct/index.html",
  ]) {
    const html = readFileSync(`dist/${route}`, "utf8");
    assert.doesNotMatch(
      html,
      /<a(?:\s|>)(?![^>]*href=)[^>]*>/i,
      `${route}: link zonder href`,
    );
    assert.doesNotMatch(
      html,
      /<button(?![^>]*(?:aria-label=|>\s*[^<\s]))[^>]*>\s*<\/button>/i,
      `${route}: naamloze knop`,
    );
  }
});
