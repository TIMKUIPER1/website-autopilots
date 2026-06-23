import fs from "node:fs/promises";
import path from "node:path";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const outputDir = "/Users/timkuiper/Documents/Website Autopilots/outputs/leads-setter-overzicht";
const workbook = Workbook.create();

const overview = workbook.worksheets.add("Lead overzicht");
const summary = workbook.worksheets.add("Samenvatting");

const leads = [
  ["Autobedrijf Andringa", "Deals lost - geen volledige demo", "Nee", "Nee", "Nee", null, "Te klein", "Heeft circa 4 auto's in de verkoop. Te weinig capaciteit en volume op dit moment.", "Geen directe opvolging. Alleen later heropenen bij groei van voorraad/capaciteit.", ""],
  ["Bosch Car Service - Ben Van Tilburg", "Deals lost - geen volledige demo", "Ja", "Nee", "Nee", null, "Geen interesse", "Was niet geinteresseerd. Albert heeft nagebeld na no-show.", "Afsluiten. Alleen herbenaderen als er nieuw signaal of inbound interesse komt.", ""],
  ["Van Maanen Auto's", "Deals lost - geen volledige demo", "Ja", "Nee", "Nee", null, "Geen AI-fit", "Bastiaan is niet gecharmeerd van AI. Verkoopt auto's alleen en wil het niet drukker hebben.", "Afsluiten. Geen actieve opvolging tenzij houding richting AI verandert.", ""],
  ["Vakgarage Van der Zweep", "Deals lost - geen volledige demo", "Ja", "Nee", "Nee", null, "Geen groeibehoefte", "Persoon staat niet open voor groei, vindt het prima zoals het gaat en wil niet veranderen.", "Afsluiten. Niet opnieuw pushen zonder duidelijk groeisignaal.", ""],
  ["Autobedrijf Rob Sengers", "Deals lost - geen volledige demo", "Ja", "Nee", "Nee", null, "Geen interesse", "Eigenaar had geen interesse. Had met Larissa gebeld en heeft de afspraak gecanceld.", "Afsluiten. Eventueel later alleen met nieuwe aanleiding.", ""],
  ["Auto Wens B.V.", "Deals lost - geen volledige demo", "Ja", "Nee", "Nee", null, "Timing / CRM", "Eigenaar is momenteel bezig met implementatie van CRM-systeem. Mogelijk later interessant.", "Later opvolgen na CRM-implementatie. Timing opnieuw toetsen.", ""],
  ["Huijbregts Exclusive Cars", "No show", "Ja", "Nee", "Onbekend", null, "No-show", "Geen inhoudelijke demo of kwalificatie bekend.", "Opnieuw benaderen en reden no-show achterhalen.", ""],
  ["Pleij Automotive B.V.", "No show", "Ja", "Nee", "Onbekend", null, "No-show", "Geen inhoudelijke demo of kwalificatie bekend.", "Opnieuw benaderen en reden no-show achterhalen.", ""],
  ["AutoFirst Autobedrijf Strijker", "No show", "Ja", "Nee", "Onbekend", null, "No-show", "Geen inhoudelijke demo of kwalificatie bekend.", "Opnieuw benaderen en reden no-show achterhalen.", ""],
  ["Super50Carz B.V.", "No show", "Ja", "Nee", "Onbekend", null, "No-show", "Geen inhoudelijke demo of kwalificatie bekend.", "Opnieuw benaderen en reden no-show achterhalen.", ""],
  ["autosgebruikt / AGU Auto Select", "No show", "Ja", "Nee", "Onbekend", null, "No-show / dubbelcheck", "Dubbelcheck nodig: nieuwe bedrijfsnaam lijkt AGU Auto Select.", "Bedrijfsnaam en website controleren: https://aguautoselect.nl/.", "https://aguautoselect.nl/"],
  ["Drost Autobedrijf", "No show", "Ja", "Nee", "Onbekend", null, "No-show", "Geen inhoudelijke demo of kwalificatie bekend.", "Opnieuw benaderen en reden no-show achterhalen.", ""],
  ["JVB Cars", "No show", "Ja", "Nee", "Onbekend", null, "No-show", "Geen inhoudelijke demo of kwalificatie bekend.", "Opnieuw benaderen en reden no-show achterhalen.", ""],
  ["Mol Occasions", "Deals lost - volledige demo gehad", "Nee", "Ja", "Ja", null, "Voor nu te klein", "Voor nu te klein met circa 6 auto's te koop. Klantcontact is wel behapbaar. Medium gekwalificeerd.", "Warm houden. Later opnieuw toetsen bij groei in voorraad of leadvolume.", ""],
  ["Auto HR Occasions", "Deals lost - volledige demo gehad", "Nee", "Ja", "Nee", null, "Te weinig volume", "Leuke mensen, maar te weinig volume. Voorraad- en capaciteitsprobleem; eerst intern nieuwe medewerker nodig.", "Afsluiten voor nu. Heropenen als volume/capaciteit verandert.", ""],
  ["NOFA Cars", "Deals lost - volledige demo gehad", "Nee", "Ja", "Ja", null, "Verwachting / stem", "Dacht dat het om een echte medewerker ging. Wil Nederlandse stem; vertrouwt mensenstem niet en ervaart veel no-shows. Medium gekwalificeerd.", "Warm houden. Opvolgen zodra Nederlandse stem of betere positionering passend is.", ""],
  ["AutoVentura Goes - Premium Cars", "Voorstel verzonden", "Nee", "Ja", "Ja", null, "Externe systemen", "Voorstel verzonden. Wachten op bevestiging van Claire of koppeling mogelijk is.", "Na bevestiging koppeling nieuwe meeting plannen met aftersales.", ""],
  ["Jansen Mobility", "2de gesprek", "Nee", "Ja", "Ja", 0.6, "Startende ondernemer / timing", "Startende ondernemer, doet momenteel alles zelf. Twijfelt over investering na groei naar ander pand, maar groei maakt kostenbesparing relevant.", "Sterk opvolgen op kostenbesparing versus aannemen personeel. Tweede gesprek op 25/06.", ""],
  ["Vakgarage Wals", "2de gesprek", "Nee", "Ja", "Ja", 0.8, "Sterke interesse / mede-eigenaar", "Vindt het interessant en klonk positief. Druk komt vaak op Jordy; ziet kansen in snellere leadopvolging. Wacht op confirmatie van andere eigenaar.", "Nieuw gesprek plannen met beide eigenaren zodra confirmatie binnen is.", ""],
];

const headers = ["Bedrijf", "Onderdeel", "No-show", "Volledige demo gehad", "Gekwalificeerd", "Kans", "Hoofdreden", "Samenvatting", "Actie voor setter", "Bron / check"];

overview.getRange("A1:J1").values = [headers];
overview.getRange(`A2:J${leads.length + 1}`).values = leads;
overview.showGridLines = false;
overview.freezePanes.freezeRows(1);
overview.getRange("A1:J1").format.fill.color = "#102A43";
overview.getRange("A1:J1").format.font.color = "#FFFFFF";
overview.getRange("A1:J1").format.font.bold = true;
overview.getRange(`A1:J${leads.length + 1}`).format.font.name = "Aptos";
overview.getRange(`A1:J${leads.length + 1}`).format.font.size = 10;
overview.getRange(`A2:J${leads.length + 1}`).format.borders = { insideHorizontal: { style: "thin", color: "#D9E2EC" } };
overview.getRange(`A2:J${leads.length + 1}`).format.verticalAlignment = "top";
overview.getRange(`G2:J${leads.length + 1}`).format.wrapText = true;
overview.getRange(`C2:F${leads.length + 1}`).format.horizontalAlignment = "center";
overview.getRange(`F2:F${leads.length + 1}`).setNumberFormat("0%");
overview.getRange("A:A").format.columnWidth = 28;
overview.getRange("B:B").format.columnWidth = 28;
overview.getRange("C:E").format.columnWidth = 15;
overview.getRange("F:F").format.columnWidth = 10;
overview.getRange("G:G").format.columnWidth = 24;
overview.getRange("H:H").format.columnWidth = 54;
overview.getRange("I:I").format.columnWidth = 48;
overview.getRange("J:J").format.columnWidth = 30;
overview.getRange(`A2:J${leads.length + 1}`).format.rowHeight = 52;
overview.getRange(`C2:C${leads.length + 1}`).dataValidation = { rule: { type: "list", values: ["Ja", "Nee"] } };
overview.getRange(`D2:D${leads.length + 1}`).dataValidation = { rule: { type: "list", values: ["Ja", "Nee"] } };
overview.getRange(`E2:E${leads.length + 1}`).dataValidation = { rule: { type: "list", values: ["Ja", "Nee", "Onbekend"] } };

const categoryColors = {
  "Deals lost - geen volledige demo": "#FDE2E1",
  "No show": "#FFE8CC",
  "Deals lost - volledige demo gehad": "#FFF7CC",
  "Voorstel verzonden": "#DCFCE7",
  "2de gesprek": "#DBEAFE",
};

for (let i = 0; i < leads.length; i++) {
  const row = i + 2;
  const category = leads[i][1];
  overview.getRange(`A${row}:J${row}`).format.fill.color = categoryColors[category] ?? "#FFFFFF";
  overview.getRange(`A${row}:J${row}`).format.borders = {
    insideHorizontal: { style: "thin", color: "#FFFFFF" },
    bottom: { style: "thin", color: "#CBD5E1" },
  };

  const noShow = leads[i][2];
  const demo = leads[i][3];
  const qualified = leads[i][4];
  overview.getRange(`C${row}`).format.fill.color = noShow === "Ja" ? "#FCA5A5" : "#DCFCE7";
  overview.getRange(`D${row}`).format.fill.color = demo === "Ja" ? "#BFDBFE" : "#F3F4F6";
  overview.getRange(`E${row}`).format.fill.color = qualified === "Ja" ? "#86EFAC" : qualified === "Onbekend" ? "#FED7AA" : "#E5E7EB";
  overview.getRange(`C${row}:E${row}`).format.font.bold = true;
  overview.getRange(`F${row}`).format.fill.color = leads[i][5] ? "#C7D2FE" : categoryColors[category] ?? "#FFFFFF";
}

summary.showGridLines = false;
summary.getRange("A1:F1").merge();
summary.getRange("A1:F1").values = [["Setter overzicht - afspraken, no-shows en kwalificatie"]];
summary.getRange("A1:F1").format.fill.color = "#102A43";
summary.getRange("A1:F1").format.font.color = "#FFFFFF";
summary.getRange("A1:F1").format.font.bold = true;
summary.getRange("A1:F1").format.font.size = 15;
summary.getRange("A1:F1").format.horizontalAlignment = "center";

summary.getRange("A3:B10").values = [
  ["Metric", "Waarde"],
  ["Totaal aantal afspraken", null],
  ["Aantal no-shows", null],
  ["Aantal opgekomen afspraken", null],
  ["Aantal niet gekwalificeerd", null],
  ["Aantal gekwalificeerd", null],
  ["Aantal openstaand voor vervolg", null],
  ["Ratio afspraak naar gekwalificeerd", null],
];
summary.getRange("B4:B10").formulas = [
  [`=COUNTA('Lead overzicht'!$A$2:$A$${leads.length + 1})`],
  [`=COUNTIF('Lead overzicht'!$C$2:$C$${leads.length + 1},"Ja")`],
  [`=B4-B5`],
  [`=COUNTIF('Lead overzicht'!$E$2:$E$${leads.length + 1},"Nee")`],
  [`=COUNTIF('Lead overzicht'!$E$2:$E$${leads.length + 1},"Ja")`],
  [`=COUNTIF('Lead overzicht'!$B$2:$B$${leads.length + 1},"Voorstel verzonden")+COUNTIF('Lead overzicht'!$B$2:$B$${leads.length + 1},"2de gesprek")`],
  [`=IF(B4=0,0,B8/B4)`],
];
summary.getRange("B10").setNumberFormat("0.0%");
summary.getRange("A12:F12").values = [["Onderdeel", "Aantal", "Gekwalificeerd", "No-shows", "Gem. kans", "Samenvatting voor setter"]];
summary.getRange("A13:F17").values = [
  ["Deals lost - geen volledige demo", null, null, null, null, "Meeste uitval komt door geen interesse, te klein zijn, beperkte groeibehoefte of verkeerde timing."],
  ["No show", null, null, null, null, "Deze groep vraagt om heractivatie: reden no-show achterhalen en bedrijfsgegevens controleren."],
  ["Deals lost - volledige demo gehad", null, null, null, null, "Mol Occasions en NOFA Cars zijn medium gekwalificeerd en geschikt om warm te houden; Auto HR is nu te klein."],
  ["Voorstel verzonden", null, null, null, null, "AutoVentura hangt af van bevestiging of koppeling met externe systemen mogelijk is."],
  ["2de gesprek", null, null, null, null, "Jansen Mobility en Vakgarage Wals zijn de warmste kansen; focus op kostenbesparing, snelheid en meerdere eigenaren aan tafel."],
];
for (let r = 13; r <= 17; r++) {
  summary.getRange(`B${r}:E${r}`).formulas = [[
    `=COUNTIF('Lead overzicht'!$B$2:$B$${leads.length + 1},A${r})`,
    `=COUNTIFS('Lead overzicht'!$B$2:$B$${leads.length + 1},A${r},'Lead overzicht'!$E$2:$E$${leads.length + 1},"Ja")`,
    `=COUNTIFS('Lead overzicht'!$B$2:$B$${leads.length + 1},A${r},'Lead overzicht'!$C$2:$C$${leads.length + 1},"Ja")`,
    `=IFERROR(AVERAGEIF('Lead overzicht'!$B$2:$B$${leads.length + 1},A${r},'Lead overzicht'!$F$2:$F$${leads.length + 1}),"")`,
  ]];
}
summary.getRange("E13:E17").setNumberFormat("0%");
summary.getRange("A3:B3").format.fill.color = "#D9E2EC";
summary.getRange("A12:F12").format.fill.color = "#D9E2EC";
summary.getRange("A3:B3").format.font.bold = true;
summary.getRange("A12:F12").format.font.bold = true;
summary.getRange("A3:B10").format.borders = { preset: "inside", style: "thin", color: "#BCCCDC" };
summary.getRange("A12:F17").format.borders = { insideHorizontal: { style: "thin", color: "#D9E2EC" }, top: { style: "thin", color: "#BCCCDC" }, bottom: { style: "thin", color: "#BCCCDC" } };
summary.getRange("A1:F22").format.font.name = "Aptos";
summary.getRange("A1:F22").format.font.size = 10;
summary.getRange("F13:F17").format.wrapText = true;
summary.getRange("A:A").format.columnWidth = 34;
summary.getRange("B:E").format.columnWidth = 16;
summary.getRange("F:F").format.columnWidth = 70;
summary.getRange("A13:F17").format.rowHeight = 50;
summary.getRange("B4:B10").format.horizontalAlignment = "center";
summary.getRange("B4:B10").format.font.bold = true;
summary.getRange("D4:F8").values = [
  ["Kleur", "Betekenis", "Focus voor setter"],
  ["Rood", "Deals lost / geen fit", "Niet actief pushen"],
  ["Oranje", "No-show of onbekend", "Heractiveren en reden achterhalen"],
  ["Groen", "Gekwalificeerd of voorstel", "Warm opvolgen"],
  ["Blauw", "Tweede gesprek", "Hoogste prioriteit"],
];
summary.getRange("D4:F4").format.fill.color = "#D9E2EC";
summary.getRange("D4:F4").format.font.bold = true;
summary.getRange("D5:D5").format.fill.color = "#FDE2E1";
summary.getRange("D6:D6").format.fill.color = "#FFE8CC";
summary.getRange("D7:D7").format.fill.color = "#DCFCE7";
summary.getRange("D8:D8").format.fill.color = "#DBEAFE";
summary.getRange("D4:F8").format.borders = { preset: "inside", style: "thin", color: "#BCCCDC" };
summary.getRange("D4:F8").format.wrapText = true;
summary.getRange("D20:F20").merge();
summary.getRange("D21:F21").merge();
summary.getRange("D22:F22").merge();
summary.getRange("D20").values = [["Definitie gekwalificeerd"]];
summary.getRange("D21").values = [["Geteld als gekwalificeerd wanneer er duidelijke commerciele fit, medium kwalificatie of een concrete vervolgstap is."]];
summary.getRange("D22").values = [["Gekwalificeerd geteld: Mol Occasions, NOFA Cars, AutoVentura Goes, Jansen Mobility en Vakgarage Wals."]];
summary.getRange("D20:F22").format.fill.color = "#F0F4F8";
summary.getRange("D20:F22").format.wrapText = true;
summary.getRange("D20:F20").format.font.bold = true;

const inspectSummary = await workbook.inspect({
  kind: "table",
  range: "Samenvatting!A3:F17",
  include: "values,formulas",
  tableMaxRows: 20,
  tableMaxCols: 8,
});
console.log(inspectSummary.ndjson);

const errors = await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 300 },
  summary: "final formula error scan",
});
console.log(errors.ndjson);

await fs.mkdir(outputDir, { recursive: true });
const preview1 = await workbook.render({ sheetName: "Samenvatting", range: "A1:F22", scale: 1, format: "png" });
await fs.writeFile(path.join(outputDir, "samenvatting-preview.png"), new Uint8Array(await preview1.arrayBuffer()));
const preview2 = await workbook.render({ sheetName: "Lead overzicht", range: `A1:J${leads.length + 1}`, scale: 1, format: "png" });
await fs.writeFile(path.join(outputDir, "lead-overzicht-preview.png"), new Uint8Array(await preview2.arrayBuffer()));

const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(path.join(outputDir, "setter-leads-afspraken-en-no-shows.xlsx"));
console.log(path.join(outputDir, "setter-leads-afspraken-en-no-shows.xlsx"));
