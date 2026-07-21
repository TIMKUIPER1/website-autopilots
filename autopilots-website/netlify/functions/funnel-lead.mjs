const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { "Content-Type":"application/json; charset=utf-8", "Cache-Control":"no-store", "X-Content-Type-Options":"nosniff" } });
const text = (value, max) => String(value ?? "").trim().replace(/[\u0000-\u001f]/g, " ").slice(0, max);
const emailOk = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 160;
const splitName = (name) => { const parts=name.split(/\s+/).filter(Boolean); return { firstName:parts.shift() || name, lastName:parts.join(" ") }; };

export default async (request) => {
  if (request.method !== "POST") return json({ ok:false, message:"Methode niet toegestaan." }, 405);
  if (Number(request.headers.get("content-length") || 0) > 24000) return json({ ok:false, message:"Aanvraag is te groot." }, 413);
  let input;
  try { input = await request.json(); } catch { return json({ ok:false, message:"Ongeldige aanvraag." }, 400); }
  if (text(input.website, 10)) return json({ ok:true });
  const name=text(input.name,100), company=text(input.company,120), email=text(input.email,160).toLowerCase(), phone=text(input.phone,40);
  const intent=["roi","demo"].includes(input.intent) ? input.intent : "demo";
  if (!name || !company || !emailOk(email) || input.consent !== true) return json({ ok:false, message:"Controleer je naam, bedrijf, e-mailadres en toestemming." }, 422);
  const attribution={};["utm_source","utm_medium","utm_campaign","utm_term","utm_content","gclid","fbclid","msclkid","landing_page"].forEach(key=>{const value=text(input[key],180);if(value)attribution[key]=value});
  let funnelAnswers={};
  try {
    const parsed=typeof input.funnelAnswers==="string" ? JSON.parse(input.funnelAnswers) : input.funnelAnswers;
    if(parsed&&typeof parsed==="object"&&!Array.isArray(parsed))Object.entries(parsed).slice(0,12).forEach(([key,item])=>{const safeKey=text(key,40),value=text(item?.value??item,80),label=text(item?.label,120);if(safeKey&&value)funnelAnswers[safeKey]={value,label}});
  } catch {}
  const context={campaign:text(input.campaignName,120),niche:text(input.niche,80),intent,funnelAnswers,attribution,submittedAt:new Date().toISOString()};
  const tags=["LP Autobedrijven","AI-medewerker funnel","Advertentielead",intent==="roi"?"Intent ROI":"Intent Demo"];
  const webhook=process.env.GHL_AUTOBEDRIJVEN_FUNNEL_WEBHOOK_URL;
  const token=process.env.GHL_PRIVATE_INTEGRATION_TOKEN;
  const locationId=process.env.GHL_LOCATION_ID;
  const pipelineId=process.env.GHL_META_PIPELINE_ID;
  const pipelineStageId=process.env.GHL_META_NEW_LEAD_STAGE_ID;
  const customFieldKey=process.env.GHL_FUNNEL_CONTEXT_FIELD_KEY;
  try {
    let response;
    if (webhook) {
      response=await fetch(webhook,{method:"POST",headers:{"Content-Type":"application/json","Accept":"application/json"},body:JSON.stringify({name,company,email,phone,intent,tags,source:"Autopilots advertentiefunnel autobedrijven",funnelAnswers,...attribution,context}),signal:AbortSignal.timeout(9000)});
    } else if (token && locationId && pipelineId && pipelineStageId) {
      const { firstName,lastName }=splitName(name);
      const payload={firstName,lastName,name,email,phone:phone||undefined,companyName:company,locationId,source:"Autopilots advertentiefunnel autobedrijven",tags};
      if(customFieldKey)payload.customFields=[{key:customFieldKey,fieldValue:JSON.stringify(context).slice(0,4000)}];
      response=await fetch("https://services.leadconnectorhq.com/contacts/upsert",{method:"POST",headers:{"Content-Type":"application/json","Accept":"application/json","Authorization":`Bearer ${token}`,"Version":"2021-04-15"},body:JSON.stringify(payload),signal:AbortSignal.timeout(9000)});
      if(!response.ok)return json({ok:false,message:"De aanvraag kon niet veilig worden verwerkt."},502);
      const contactResult=await response.json().catch(()=>({}));
      const contactId=text(contactResult?.contact?.id??contactResult?.id,80);
      if(!contactId)return json({ok:false,message:"De aanvraag is ontvangen, maar kon niet aan de juiste contactkaart worden gekoppeld."},502);
      response=await fetch("https://services.leadconnectorhq.com/opportunities/",{method:"POST",headers:{"Content-Type":"application/json","Accept":"application/json","Authorization":`Bearer ${token}`,"Version":"2023-02-21"},body:JSON.stringify({pipelineId,pipelineStageId,locationId,contactId,name:`${company} — ${name}`,status:"open",source:"Marketing | META Campaign — AI-medewerker autobedrijven"}),signal:AbortSignal.timeout(9000)});
    } else {
      return json({ ok:false, message:"De persoonlijke toegang is nog niet gekoppeld. Neem contact op met Autopilots." }, 503);
    }
    if(!response.ok)return json({ok:false,message:"De aanvraag kon niet veilig worden verwerkt."},502);
    return json({ok:true});
  } catch {
    return json({ok:false,message:"De verbinding met de afspraakomgeving reageert niet. Probeer het opnieuw."},502);
  }
};

export const config={path:"/api/funnel-lead",method:"POST"};
