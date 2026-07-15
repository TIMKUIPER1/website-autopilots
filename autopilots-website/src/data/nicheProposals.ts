import type { Niche } from "./niches";

interface ProposalBlueprint {
  journeyTitle: string;
  handoff: string;
  routePlanning?: boolean;
}

const proposalBlueprints: Record<string, ProposalBlueprint> = {
  autobedrijven: { journeyTitle: "Van online autolead naar showroomafspraak.", handoff: "sales of werkplaats" },
  dakdekkers: { journeyTitle: "Van lekkagemelding naar ingeplande inspectie.", handoff: "planning of dakteam", routePlanning: true },
  hoveniers: { journeyTitle: "Van tuinaanvraag naar geplande opname.", handoff: "planning of hoveniersploeg", routePlanning: true },
  installatietechniek: { journeyTitle: "Van onderhoud naar de juiste monteurroute.", handoff: "planning of monteursteam", routePlanning: true },
  vastgoedbeheerders: { journeyTitle: "Van melding naar de juiste opvolging.", handoff: "beheerteam of leverancier", routePlanning: true },
  kapperszaken: { journeyTitle: "Van klantvraag naar een gevulde agenda.", handoff: "receptie of stylist" },
  tandartsen: { journeyTitle: "Van patiëntvraag naar de juiste afspraak.", handoff: "balie of behandelaar" },
  makelaars: { journeyTitle: "Van woningvraag naar een concrete afspraak.", handoff: "makelaar of binnendienst" },
  "cosmetische-klinieken": { journeyTitle: "Van interesse naar een passende consultafspraak.", handoff: "frontoffice of behandelaar" },
  verzekeraars: { journeyTitle: "Van vraag naar de juiste adviseur.", handoff: "advies- of supportteam" },
  glaszetters: { journeyTitle: "Van glasschade naar een geplande oplossing.", handoff: "planning of glasteam", routePlanning: true },
  hotels: { journeyTitle: "Van gastvraag naar reservering of receptietaak.", handoff: "receptie of reserveringsteam" },
  restaurants: { journeyTitle: "Van reserveringsvraag naar een gevulde tafel.", handoff: "receptie of reserveringsteam" },
  evenementen: { journeyTitle: "Van eventaanvraag naar een concrete offerte.", handoff: "sales of projectleiding" },
  kozijnen: { journeyTitle: "Van kozijnvraag naar een inmeetafspraak.", handoff: "sales of inmeetteam", routePlanning: true },
  zonnepanelen: { journeyTitle: "Van energieaanvraag naar een geplande schouw.", handoff: "sales, planning of installatieteam", routePlanning: true },
  vloerenleggers: { journeyTitle: "Van vloerwens naar een inmeetafspraak.", handoff: "planning of vloerenploeg", routePlanning: true },
  woningcorporaties: { journeyTitle: "Van huurdermelding naar een geplande reparatie.", handoff: "klantcontact of reparatieteam", routePlanning: true },
  "non-profit": { journeyTitle: "Van aanmelding naar de juiste opvolging.", handoff: "coördinator of supportteam" },
  dierenarts: { journeyTitle: "Van zorgvraag naar de juiste afspraak.", handoff: "balie of dierenarts" },
  dierenverzorging: { journeyTitle: "Van vraag naar geplande verzorging.", handoff: "balie of verzorgingsteam" }
};

export function getNicheProposalBlueprint(niche: Niche) {
  const blueprint = proposalBlueprints[niche.slug] ?? {
    journeyTitle: "Van eerste vraag naar de juiste route voor " + niche.name.toLowerCase() + ".",
    handoff: "het juiste team"
  };
  const channelKeywords = ["WhatsApp", "Telefonie", "E-mail", "Website", "Instagram", "Chat", "Klantportaal", "Formulieren"];
  const directChannels = niche.systems.filter((system) => channelKeywords.some((keyword) => system.toLowerCase().includes(keyword.toLowerCase())));
  const channelNames = (directChannels.length > 1 ? directChannels : niche.systems).slice(0, 3).join(", ");
  const intakeNames = niche.intake.slice(0, 4).join(", ");
  const finalWorkflow = niche.workflow.at(-1);

  return {
    ...blueprint,
    valueCards: [
      {
        title: "Direct bereikbaar op eigen kanalen",
        text: "Vragen via " + channelNames + " worden direct herkend, samengevat en naar " + blueprint.handoff + " geleid.",
        more: "Ook buiten piekmomenten blijft de eerste reactie consistent en krijgt iedere aanvraag een zichtbare vervolgstap."
      },
      {
        title: "Branchespecifieke kwalificatie",
        text: "De AI vraagt gericht door op " + intakeNames + " en controleert welke informatie nog ontbreekt.",
        more: "Het team ontvangt geen losse vraag, maar een bruikbare intake die aansluit op de dagelijkse praktijk."
      },
      {
        title: "Actieve opvolging en overdracht",
        text: (finalWorkflow?.text ?? "De juiste vervolgactie wordt vastgelegd.") + " Open aanvragen blijven zichtbaar tot mens of systeem ze overneemt.",
        more: "Status, context en eigenaar blijven bij elkaar, zodat warme vragen niet tussen kanalen of collega's verdwijnen."
      }
    ],
    brainSteps: [
      { key: "intake", label: "Intake", title: "Eerst begrijpen wat iemand nodig heeft.", text: niche.painPoints.map((item) => item.title.toLowerCase()).slice(0, 3).join(", ") + " krijgen ieder een eigen herkenning en route." },
      { key: "context", label: "Context", title: "Daarna ontbrekende context aanvullen.", text: "De AI controleert " + niche.intake.slice(0, 5).join(", ") + " voordat een vervolgstap wordt gekozen." },
      { key: "rules", label: "Regels", title: "Afspraken en grenzen bepalen wat mag.", text: "Kennis, tone of voice, urgentie, rechten en menselijke fallback worden gecontroleerd vóór een antwoord of systeemactie." },
      { key: "action", label: "Actie", title: "Pas daarna volgt de juiste actie.", text: niche.conversation.result + " De overdracht gaat naar " + blueprint.handoff + "." }
    ]
  };
}
