import type { SupportedLocale } from "./languages";
import type { Niche } from "../data/niches";

type LocalizedEntity = { name: string; lead: string };

const productPromises: Record<SupportedLocale, Record<string, string>> = {
  nl: {
    "ai-inboxmedewerker": "Eén digitale collega voor binnenkomend klantcontact.",
    "ai-leadopvolger": "Volgt iedere lead op en houdt de volgende stap actief.",
    "ai-telefoniste": "Neemt oproepen aan, vraagt door en plant of verbindt door.",
    "autopilots-crm": "Eén centrale klantcontext voor AI en team.",
    "leadsmachine-ai": "Van campagne en outreach naar afspraak en CRM.",
  },
  en: {
    "ai-inboxmedewerker": "One digital colleague for incoming customer contact.",
    "ai-leadopvolger": "Follows up every lead and keeps the next step moving.",
    "ai-telefoniste": "Answers calls, asks the right questions and schedules or transfers.",
    "autopilots-crm": "One shared customer context for AI and team.",
    "leadsmachine-ai": "From campaign and outreach to appointment and CRM.",
  },
  es: {
    "ai-inboxmedewerker": "Un colaborador digital para cada consulta entrante.",
    "ai-leadopvolger": "Da seguimiento a cada lead y mantiene activa la siguiente acción.",
    "ai-telefoniste": "Atiende llamadas, hace las preguntas correctas y agenda o deriva.",
    "autopilots-crm": "Un único contexto de cliente para la IA y el equipo.",
    "leadsmachine-ai": "De la campaña y prospección a la cita y el CRM.",
  },
  de: {
    "ai-inboxmedewerker": "Ein digitaler Kollege für eingehende Kundenanfragen.",
    "ai-leadopvolger": "Fasst jeden Lead nach und hält den nächsten Schritt aktiv.",
    "ai-telefoniste": "Nimmt Anrufe an, fragt gezielt nach und plant oder verbindet weiter.",
    "autopilots-crm": "Ein gemeinsamer Kundenkontext für KI und Team.",
    "leadsmachine-ai": "Von Kampagne und Ansprache zu Termin und CRM.",
  },
  it: {
    "ai-inboxmedewerker": "Un collaboratore digitale per ogni richiesta in arrivo.",
    "ai-leadopvolger": "Segue ogni lead e mantiene attiva l'azione successiva.",
    "ai-telefoniste": "Risponde, approfondisce e fissa un appuntamento o trasferisce.",
    "autopilots-crm": "Un unico contesto cliente per AI e team.",
    "leadsmachine-ai": "Dalla campagna e prospezione all'appuntamento e al CRM.",
  },
  fr: {
    "ai-inboxmedewerker": "Un collaborateur numérique pour chaque demande entrante.",
    "ai-leadopvolger": "Relance chaque lead et maintient la prochaine action active.",
    "ai-telefoniste": "Répond, pose les bonnes questions, planifie ou transfère l'appel.",
    "autopilots-crm": "Un contexte client commun pour l'IA et l'équipe.",
    "leadsmachine-ai": "De la campagne et la prospection au rendez-vous et au CRM.",
  },
};

const nicheCatalog: Partial<Record<SupportedLocale, Record<string, LocalizedEntity>>> = {
  en: {
    autobedrijven: { name: "Car dealerships", lead: "Stock questions, trade-ins, workshop requests and test drives handled without delay." },
    dakdekkers: { name: "Roofing companies", lead: "Leaks, urgency, photos, postcode and planning captured in one complete request." },
    hoveniers: { name: "Landscapers", lead: "Project type, area, photos, location and timing qualified before the site visit." },
    installatietechniek: { name: "Installation companies", lead: "Faults, error codes, safety, service contracts and availability routed to the right team." },
    vastgoedbeheerders: { name: "Property managers", lead: "Tenant messages, repairs and status questions classified by property, urgency and case." },
    kapperszaken: { name: "Hair salons", lead: "WhatsApp, Instagram and phone connected to treatment, duration and calendar." },
    tandartsen: { name: "Dentists", lead: "Questions, pain level, availability and appointments handled within moments." },
    makelaars: { name: "Estate agents", lead: "Buyers and sellers qualified and guided to a viewing or valuation." },
    "cosmetische-klinieken": { name: "Cosmetic clinics", lead: "Questions, treatments and consultations structured before the appointment." },
    verzekeraars: { name: "Insurers", lead: "Claims, policies and documents routed to the correct case." },
    glaszetters: { name: "Glaziers", lead: "Breakage, measurements, photos and urgency captured for an efficient visit." },
    hotels: { name: "Hotels", lead: "Reservations, guest questions and service requests handled around the clock." },
    restaurants: { name: "Restaurants", lead: "Bookings, groups and special requests handled according to your rules." },
    evenementen: { name: "Events", lead: "Date, venue, capacity and budget qualified before commercial follow-up." },
    kozijnen: { name: "Window companies", lead: "Project, measurements, property and survey visit prepared from the first contact." },
    zonnepanelen: { name: "Solar installers", lead: "Roof, consumption, address and project details qualified for a useful assessment." },
    vloerenleggers: { name: "Flooring installers", lead: "Area, subfloor, material and timing captured before the quote." },
    woningcorporaties: { name: "Housing associations", lead: "Tenant requests and repairs routed by property and urgency." },
    "non-profit": { name: "Nonprofits", lead: "Questions, registrations and administration organised in one clear journey." },
    dierenarts: { name: "Veterinarians", lead: "Reason, urgency and availability checked before booking." },
    dierenverzorging: { name: "Pet care", lead: "Service, animal, availability and instructions captured without interrupting the team." },
  },
  de: {
    autobedrijven: { name: "Autohäuser", lead: "Bestandsfragen, Inzahlungnahmen, Werkstattanfragen und Probefahrten ohne Verzögerung bearbeiten." },
    dakdekkers: { name: "Dachdecker", lead: "Leckage, Dringlichkeit, Fotos, Postleitzahl und Planung in einer vollständigen Anfrage erfassen." },
    hoveniers: { name: "Garten- und Landschaftsbau", lead: "Projekt, Fläche, Fotos, Standort und Zeitraum vor dem Ortstermin qualifizieren." },
    installatietechniek: { name: "Installationsbetriebe", lead: "Störungen, Fehlercodes, Sicherheit, Wartungsverträge und Verfügbarkeit an das richtige Team leiten." },
    vastgoedbeheerders: { name: "Immobilienverwaltungen", lead: "Mietermeldungen, Reparaturen und Statusfragen nach Objekt, Dringlichkeit und Vorgang ordnen." },
    kapperszaken: { name: "Friseursalons", lead: "WhatsApp, Instagram und Telefon mit Behandlung, Dauer und Kalender verbinden." },
    tandartsen: { name: "Zahnärzte", lead: "Fragen, Schmerzen, Verfügbarkeit und Termine innerhalb weniger Augenblicke bearbeiten." },
    makelaars: { name: "Immobilienmakler", lead: "Käufer und Verkäufer qualifizieren und zur Besichtigung oder Bewertung führen." },
    "cosmetische-klinieken": { name: "Ästhetische Kliniken", lead: "Anfragen, Behandlungen und Beratungen vor dem Termin strukturieren." },
    verzekeraars: { name: "Versicherer", lead: "Schäden, Verträge und Dokumente dem richtigen Vorgang zuordnen." },
    glaszetters: { name: "Glaser", lead: "Glasschaden, Maße, Fotos und Dringlichkeit für einen effizienten Einsatz erfassen." },
    hotels: { name: "Hotels", lead: "Reservierungen, Gästefragen und Servicewünsche rund um die Uhr bearbeiten." },
    restaurants: { name: "Restaurants", lead: "Reservierungen, Gruppen und Sonderwünsche nach Ihren Regeln bearbeiten." },
    evenementen: { name: "Veranstaltungen", lead: "Datum, Ort, Kapazität und Budget vor der Vertriebsnachverfolgung qualifizieren." },
    kozijnen: { name: "Fensterbauer", lead: "Projekt, Maße, Immobilie und Aufmaßtermin ab dem ersten Kontakt vorbereiten." },
    zonnepanelen: { name: "Solarbetriebe", lead: "Dach, Verbrauch, Adresse und Projekt für eine fundierte Prüfung qualifizieren." },
    vloerenleggers: { name: "Bodenleger", lead: "Fläche, Untergrund, Material und Termin vor dem Angebot erfassen." },
    woningcorporaties: { name: "Wohnungsbaugesellschaften", lead: "Mieteranfragen und Reparaturen nach Wohnung und Dringlichkeit weiterleiten." },
    "non-profit": { name: "Gemeinnützige Organisationen", lead: "Fragen, Anmeldungen und Verwaltung in einem klaren Ablauf organisieren." },
    dierenarts: { name: "Tierärzte", lead: "Anliegen, Dringlichkeit und Verfügbarkeit vor der Terminbuchung prüfen." },
    dierenverzorging: { name: "Tierpflege", lead: "Leistung, Tier, Verfügbarkeit und Hinweise erfassen, ohne das Team zu unterbrechen." },
  },
  es: {
    autobedrijven: { name: "Concesionarios de automóviles", lead: "Consultas de stock, tasaciones, taller y pruebas de conducción atendidas sin demora." },
    dakdekkers: { name: "Empresas de cubiertas", lead: "Filtración, urgencia, fotos, código postal y planificación reunidos en una solicitud completa." },
    hoveniers: { name: "Paisajistas", lead: "Proyecto, superficie, fotos, ubicación y fechas cualificados antes de la visita." },
    installatietechniek: { name: "Empresas instaladoras", lead: "Averías, códigos de error, seguridad, contratos y disponibilidad dirigidos al equipo correcto." },
    vastgoedbeheerders: { name: "Administradores inmobiliarios", lead: "Mensajes de inquilinos, reparaciones y estados clasificados por inmueble, urgencia y expediente." },
    kapperszaken: { name: "Peluquerías", lead: "WhatsApp, Instagram y teléfono conectados con tratamiento, duración y agenda." },
    tandartsen: { name: "Dentistas", lead: "Consultas, dolor, disponibilidad y citas resueltos en pocos instantes." },
    makelaars: { name: "Agentes inmobiliarios", lead: "Compradores y vendedores cualificados y guiados hacia una visita o valoración." },
    "cosmetische-klinieken": { name: "Clínicas estéticas", lead: "Consultas, tratamientos y valoraciones estructurados antes de la cita." },
    verzekeraars: { name: "Aseguradoras", lead: "Siniestros, pólizas y documentos dirigidos al expediente correcto." },
    glaszetters: { name: "Cristaleros", lead: "Rotura, medidas, fotos y urgencia reunidos para una intervención eficaz." },
    hotels: { name: "Hoteles", lead: "Reservas, preguntas de huéspedes y solicitudes de servicio atendidas a cualquier hora." },
    restaurants: { name: "Restaurantes", lead: "Reservas, grupos y peticiones especiales gestionados según tus reglas." },
    evenementen: { name: "Eventos", lead: "Fecha, lugar, aforo y presupuesto cualificados antes del seguimiento comercial." },
    kozijnen: { name: "Empresas de ventanas", lead: "Proyecto, medidas, vivienda y visita técnica preparados desde el primer contacto." },
    zonnepanelen: { name: "Instaladores solares", lead: "Tejado, consumo, dirección y proyecto cualificados para un estudio útil." },
    vloerenleggers: { name: "Instaladores de suelos", lead: "Superficie, base, material y calendario reunidos antes del presupuesto." },
    woningcorporaties: { name: "Empresas de vivienda", lead: "Solicitudes de inquilinos e intervenciones dirigidas según vivienda y urgencia." },
    "non-profit": { name: "Organizaciones sin ánimo de lucro", lead: "Preguntas, inscripciones y administración organizadas en un recorrido claro." },
    dierenarts: { name: "Veterinarios", lead: "Motivo, urgencia y disponibilidad comprobados antes de reservar." },
    dierenverzorging: { name: "Cuidado de mascotas", lead: "Servicio, animal, disponibilidad e instrucciones reunidos sin interrumpir al equipo." },
  },
  it: {
    autobedrijven: { name: "Concessionarie auto", lead: "Domande sullo stock, permute, officina e test drive gestiti senza attese." },
    dakdekkers: { name: "Imprese di coperture", lead: "Perdita, urgenza, foto, CAP e pianificazione raccolti in una richiesta completa." },
    hoveniers: { name: "Paesaggisti", lead: "Progetto, superficie, foto, zona e tempi qualificati prima del sopralluogo." },
    installatietechniek: { name: "Imprese impiantistiche", lead: "Guasti, codici errore, sicurezza, contratti e disponibilità indirizzati al team corretto." },
    vastgoedbeheerders: { name: "Gestori immobiliari", lead: "Messaggi degli inquilini, riparazioni e stati classificati per immobile, urgenza e pratica." },
    kapperszaken: { name: "Saloni di parrucchieri", lead: "WhatsApp, Instagram e telefono collegati a trattamento, durata e agenda." },
    tandartsen: { name: "Dentisti", lead: "Domande, dolore, disponibilità e appuntamenti gestiti in pochi istanti." },
    makelaars: { name: "Agenti immobiliari", lead: "Acquirenti e venditori qualificati e guidati verso visita o valutazione." },
    "cosmetische-klinieken": { name: "Cliniche estetiche", lead: "Richieste, trattamenti e consulenze strutturati prima dell'appuntamento." },
    verzekeraars: { name: "Assicurazioni", lead: "Sinistri, polizze e documenti indirizzati alla pratica corretta." },
    glaszetters: { name: "Vetrai", lead: "Rottura, misure, foto e urgenza raccolti per un intervento efficiente." },
    hotels: { name: "Hotel", lead: "Prenotazioni, domande degli ospiti e richieste di servizio gestite a ogni ora." },
    restaurants: { name: "Ristoranti", lead: "Prenotazioni, gruppi e richieste speciali gestiti secondo le tue regole." },
    evenementen: { name: "Eventi", lead: "Data, luogo, capienza e budget qualificati prima del follow-up commerciale." },
    kozijnen: { name: "Serramentisti", lead: "Progetto, misure, immobile e sopralluogo preparati dal primo contatto." },
    zonnepanelen: { name: "Installatori fotovoltaici", lead: "Tetto, consumi, indirizzo e progetto qualificati per una valutazione utile." },
    vloerenleggers: { name: "Posatori di pavimenti", lead: "Superficie, sottofondo, materiale e tempi raccolti prima del preventivo." },
    woningcorporaties: { name: "Enti di edilizia sociale", lead: "Richieste degli inquilini e interventi indirizzati per alloggio e urgenza." },
    "non-profit": { name: "Organizzazioni non profit", lead: "Domande, iscrizioni e amministrazione organizzate in un percorso chiaro." },
    dierenarts: { name: "Veterinari", lead: "Motivo, urgenza e disponibilità verificati prima della prenotazione." },
    dierenverzorging: { name: "Cura degli animali", lead: "Servizio, animale, disponibilità e istruzioni raccolti senza interrompere il team." },
  },
  fr: {
  autobedrijven: { name: "Concessions automobiles", lead: "Questions sur le stock, reprises, atelier et essais traitées sans délai." },
  dakdekkers: { name: "Couvreurs", lead: "Fuites, urgence, photos, code postal et planning réunis dans une demande complète." },
  hoveniers: { name: "Paysagistes", lead: "Projet, surface, photos, zone et calendrier qualifiés avant la visite." },
  installatietechniek: { name: "Entreprises d’installation", lead: "Pannes, codes erreur, sécurité, contrats et disponibilité orientés vers la bonne équipe." },
  vastgoedbeheerders: { name: "Gestionnaires immobiliers", lead: "Demandes locataires, réparations et statuts classés par bien, urgence et dossier." },
  kapperszaken: { name: "Salons de coiffure", lead: "WhatsApp, Instagram et téléphone reliés au soin, à la durée et à l’agenda." },
  tandartsen: { name: "Dentistes", lead: "Questions, douleur, disponibilité et rendez-vous traités en quelques instants." },
  makelaars: { name: "Agents immobiliers", lead: "Acheteurs et vendeurs qualifiés puis orientés vers une visite ou une estimation." },
  "cosmetische-klinieken": { name: "Cliniques esthétiques", lead: "Demandes, traitements et consultations structurés avant le rendez-vous." },
  verzekeraars: { name: "Assureurs", lead: "Sinistres, contrats et documents acheminés vers le bon dossier." },
  glaszetters: { name: "Vitriers", lead: "Bris, dimensions, photos et urgence réunis pour une intervention efficace." },
  hotels: { name: "Hôtels", lead: "Réservations, questions clients et demandes de service traitées à toute heure." },
  restaurants: { name: "Restaurants", lead: "Réservations, groupes et demandes spéciales gérés selon vos règles." },
  evenementen: { name: "Événementiel", lead: "Date, lieu, capacité et budget qualifiés avant le suivi commercial." },
  kozijnen: { name: "Fabricants de fenêtres", lead: "Projet, dimensions, logement et visite technique préparés dès le premier contact." },
  zonnepanelen: { name: "Installateurs solaires", lead: "Toiture, consommation, adresse et projet qualifiés pour une étude utile." },
  vloerenleggers: { name: "Poseurs de sols", lead: "Surface, support, matériau et planning collectés avant le devis." },
  woningcorporaties: { name: "Bailleurs sociaux", lead: "Demandes locataires et interventions orientées selon le logement et l’urgence." },
  "non-profit": { name: "Associations", lead: "Questions, inscriptions et suivi administratif organisés dans un parcours clair." },
  dierenarts: { name: "Vétérinaires", lead: "Motif, urgence et disponibilité vérifiés avant le rendez-vous." },
  dierenverzorging: { name: "Soins animaliers", lead: "Service, animal, disponibilité et consignes réunis sans interrompre l’équipe." },
  },
};

const genericNicheLead: Record<SupportedLocale, (name: string) => string> = {
  nl: (name) => `Een eigen intake, planning en opvolgroute voor ${name.toLowerCase()}.`,
  en: (name) => `A dedicated intake, planning and follow-up journey for ${name.toLowerCase()}.`,
  es: (name) => `Un recorrido propio de toma de datos, planificación y seguimiento para ${name.toLowerCase()}.`,
  de: (name) => `Eine eigene Aufnahme-, Planungs- und Nachverfolgungsroute für ${name}.`,
  it: (name) => `Un percorso dedicato di raccolta dati, pianificazione e follow-up per ${name.toLowerCase()}.`,
  fr: (name) => `Un parcours de collecte, planification et suivi conçu pour les ${name.toLowerCase()}.`,
};

export function localizedProductPromise(locale: SupportedLocale, slug: string, fallback: string) {
  return productPromises[locale][slug] ?? fallback;
}

export function localizedNiche(locale: SupportedLocale, slug: string, fallbackName: string): LocalizedEntity {
  if (locale === "nl") return { name: fallbackName, lead: genericNicheLead.nl(fallbackName) };
  if (nicheCatalog[locale]?.[slug]) return nicheCatalog[locale]![slug];
  return { name: fallbackName, lead: genericNicheLead[locale](fallbackName) };
}

export function localizedNicheData(locale: SupportedLocale, source: Niche): Niche {
  if (locale === "nl") return source;
  const entity = localizedNiche(locale, source.slug, source.name);
  const common = {
    en: { singular: "company", hero: `${entity.name} turn every customer question into`, accent: "a clear next action.", pains:[["Questions arrive across channels","Phone, email, WhatsApp and forms compete for the team's attention."],["Essential context is missing","The team has to ask again before planning or taking action."],["Follow-up depends on memory","Open requests can stall when ownership and timing are unclear."],["Systems are updated too late","Conversation, status and next action do not stay together."]], flow:[["Recognise the request","The AI identifies intent, customer and urgency."],["Complete the intake","Missing details are collected through focused questions."],["Choose the right route","Rules determine the answer, appointment or human handoff."],["Update the system","CRM, calendar or task receives the complete context."]], intake:["Reason for contact","Customer status","Location","Urgency","Preferred time","Relevant documents"], metric:"customer contacts", faq:[["Can the AI follow our own rules?","Yes. Knowledge, questions, permissions and exceptions are configured during onboarding."],["When does a person take over?","Risk, uncertainty, emotion and situations outside the approved rules are transferred with full context."]], customer:`I have a question for ${entity.name.toLowerCase()} and would like help today.`, ai:"Of course. I will ask a few focused questions and immediately check the right next step.", followup:"That is fine. I would prefer the earliest suitable option.", result:"Request qualified, routed and recorded with a clear owner and next action." },
    de: { singular:"Unternehmen", hero:`${entity.name} machen aus jeder Kundenfrage`,accent:"einen klaren nächsten Schritt.",pains:[["Anfragen kommen über mehrere Kanäle","Telefon, E-Mail, WhatsApp und Formulare konkurrieren um Aufmerksamkeit."],["Wichtiger Kontext fehlt","Vor Planung oder Aktion muss das Team erneut nachfragen."],["Nachverfolgung hängt vom Gedächtnis ab","Offene Vorgänge bleiben ohne Eigentümer und Zeitpunkt liegen."],["Systeme werden zu spät aktualisiert","Gespräch, Status und nächste Aktion bleiben nicht zusammen."]],flow:[["Anfrage erkennen","Die KI erkennt Absicht, Kunde und Dringlichkeit."],["Aufnahme vervollständigen","Fehlende Angaben werden gezielt erfragt."],["Passende Route wählen","Regeln bestimmen Antwort, Termin oder Übergabe."],["System aktualisieren","CRM, Kalender oder Aufgabe erhalten den Kontext."]],intake:["Kontaktgrund","Kundenstatus","Standort","Dringlichkeit","Wunschtermin","Dokumente"],metric:"Kundenkontakte",faq:[["Kann die KI unseren Regeln folgen?","Ja. Wissen, Fragen, Rechte und Ausnahmen werden im Onboarding eingerichtet."],["Wann übernimmt ein Mensch?","Risiko, Unsicherheit, Emotion und Ausnahmen werden mit vollständigem Kontext übergeben."]],customer:`Ich habe eine Frage an ${entity.name} und benötige heute Unterstützung.`,ai:"Gern. Ich stelle einige gezielte Fragen und prüfe direkt den passenden nächsten Schritt.",followup:"In Ordnung. Ich bevorzuge den frühestmöglichen passenden Termin.",result:"Anfrage qualifiziert, weitergeleitet und mit Eigentümer sowie nächster Aktion dokumentiert."},
    es: { singular:"empresa",hero:`${entity.name} convierten cada consulta en`,accent:"una siguiente acción clara.",pains:[["Las consultas llegan por varios canales","Teléfono, email, WhatsApp y formularios compiten por la atención."],["Falta contexto esencial","El equipo debe volver a preguntar antes de planificar o actuar."],["El seguimiento depende de la memoria","Las solicitudes abiertas se detienen sin responsable ni fecha."],["Los sistemas se actualizan tarde","Conversación, estado y siguiente acción quedan separados."]],flow:[["Reconocer la consulta","La IA identifica intención, cliente y urgencia."],["Completar la toma de datos","Solicita de forma dirigida la información que falta."],["Elegir la ruta correcta","Las reglas determinan respuesta, cita o transferencia."],["Actualizar el sistema","CRM, agenda o tarea reciben todo el contexto."]],intake:["Motivo de contacto","Estado del cliente","Ubicación","Urgencia","Momento preferido","Documentos"],metric:"contactos de clientes",faq:[["¿Puede la IA seguir nuestras reglas?","Sí. El conocimiento, las preguntas, permisos y excepciones se configuran durante la incorporación."],["¿Cuándo interviene una persona?","El riesgo, la incertidumbre, la emoción y las excepciones se transfieren con todo el contexto."]],customer:`Tengo una consulta para ${entity.name.toLowerCase()} y necesito ayuda hoy.`,ai:"Por supuesto. Haré unas preguntas concretas y comprobaré inmediatamente el siguiente paso.",followup:"Perfecto. Prefiero la primera opción adecuada.",result:"Solicitud cualificada, dirigida y registrada con responsable y siguiente acción."},
    it: { singular:"azienda",hero:`${entity.name} trasformano ogni richiesta in`,accent:"una chiara azione successiva.",pains:[["Le richieste arrivano da più canali","Telefono, email, WhatsApp e moduli competono per l'attenzione."],["Manca il contesto essenziale","Il team deve fare nuove domande prima di pianificare o agire."],["Il follow-up dipende dalla memoria","Le richieste aperte si fermano senza responsabile e tempistica."],["I sistemi vengono aggiornati tardi","Conversazione, stato e prossima azione restano separati."]],flow:[["Riconoscere la richiesta","L'AI identifica intento, cliente e urgenza."],["Completare la raccolta dati","Le informazioni mancanti vengono richieste in modo mirato."],["Scegliere il percorso","Le regole determinano risposta, appuntamento o passaggio."],["Aggiornare il sistema","CRM, agenda o attività ricevono tutto il contesto."]],intake:["Motivo del contatto","Stato cliente","Località","Urgenza","Orario preferito","Documenti"],metric:"contatti clienti",faq:[["L'AI può seguire le nostre regole?","Sì. Conoscenze, domande, permessi ed eccezioni vengono configurati durante l'onboarding."],["Quando interviene una persona?","Rischio, incertezza, emozione ed eccezioni vengono trasferiti con tutto il contesto."]],customer:`Ho una domanda per ${entity.name.toLowerCase()} e vorrei assistenza oggi.`,ai:"Certamente. Farò alcune domande mirate e verificherò subito il passo successivo.",followup:"Va bene. Preferisco la prima opzione adatta.",result:"Richiesta qualificata, instradata e registrata con responsabile e prossima azione."},
    fr: { singular:"entreprise",hero:`${entity.name} transforment chaque demande en`,accent:"une prochaine action claire.",pains:[["Les demandes arrivent par plusieurs canaux","Téléphone, e-mail, WhatsApp et formulaires sollicitent l'équipe en même temps."],["Le contexte essentiel manque","L'équipe doit reposer des questions avant de planifier ou d'agir."],["Le suivi dépend de la mémoire","Les demandes ouvertes stagnent sans responsable ni échéance."],["Les systèmes sont mis à jour trop tard","Conversation, statut et prochaine action restent séparés."]],flow:[["Reconnaître la demande","L'IA identifie l'intention, le client et l'urgence."],["Compléter la collecte","Les informations manquantes sont demandées de façon ciblée."],["Choisir le bon parcours","Les règles déterminent réponse, rendez-vous ou transfert."],["Mettre à jour le système","Le CRM, l'agenda ou la tâche reçoivent tout le contexte."]],intake:["Motif du contact","Statut du client","Localisation","Urgence","Créneau souhaité","Documents"],metric:"contacts clients",faq:[["L'IA peut-elle suivre nos règles ?","Oui. Les connaissances, questions, droits et exceptions sont configurés pendant l'intégration."],["Quand un humain prend-il le relais ?","Le risque, l'incertitude, l'émotion et les exceptions sont transférés avec tout le contexte."]],customer:`J'ai une demande pour ${entity.name.toLowerCase()} et souhaite être aidé aujourd'hui.`,ai:"Bien sûr. Je vais poser quelques questions ciblées et vérifier immédiatement la prochaine étape.",followup:"Très bien. Je préfère la première option adaptée.",result:"Demande qualifiée, orientée et enregistrée avec un responsable et une prochaine action."}
  }[locale];
  return { ...source, name:entity.name, singular:common.singular, hero:common.hero, accent:common.accent, lead:entity.lead, painPoints:common.pains.map(([title,text])=>({title,text})), workflow:common.flow.map(([title,text])=>({title,text})), intake:common.intake, conversation:{customer:common.customer,ai:common.ai,followup:common.followup,result:common.result}, metric:{...source.metric,label:common.metric}, faq:common.faq.map(([question,answer])=>({question,answer})), seoTitle:`${entity.name} | Autopilots`, metaDescription:entity.lead };
}
