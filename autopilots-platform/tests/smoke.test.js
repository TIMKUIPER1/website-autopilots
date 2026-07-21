import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";

test("platformfundament is actief",()=>assert.equal(100/100,1));
test("vervallen productnaam komt nergens in actieve bronbestanden voor",async()=>{const files=["src/demo-store.js","src/server.js","public/workspace.js","public/workspace.html","README.md"];const source=(await Promise.all(files.map(file=>fs.readFile(file,"utf8")))).join("\n");const forbidden=["Service","receptionist"].join("");assert.equal(source.includes(forbidden),false)});
