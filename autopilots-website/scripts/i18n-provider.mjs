const protect = (text, terms) => {
  const values=[];
  const protectedText=terms.reduce((result,term)=>result.replaceAll(term,match=>{const token=`__AP_${values.length}__`;values.push(match);return token}),text);
  return {protectedText,restore:value=>values.reduce((result,term,index)=>result.replaceAll(`__AP_${index}__`,term),value)};
};

export async function translateText({text,source="NL",target,protectedTerms=[]}) {
  const provider=(process.env.I18N_PROVIDER??"").toLowerCase();
  if(!provider) throw new Error("Stel I18N_PROVIDER in op 'deepl' of 'openai'.");
  const {protectedText,restore}=protect(text,protectedTerms);
  if(provider==="deepl"){
    if(!process.env.DEEPL_API_KEY) throw new Error("DEEPL_API_KEY ontbreekt.");
    const response=await fetch(process.env.DEEPL_API_URL??"https://api-free.deepl.com/v2/translate",{method:"POST",headers:{Authorization:`DeepL-Auth-Key ${process.env.DEEPL_API_KEY}`,"Content-Type":"application/json"},body:JSON.stringify({text:[protectedText],source_lang:source,target_lang:target,tag_handling:"html"})});
    if(!response.ok) throw new Error(`DeepL vertaling mislukt (${response.status}).`);
    return restore((await response.json()).translations[0].text);
  }
  if(provider==="openai"){
    if(!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY ontbreekt.");
    const response=await fetch("https://api.openai.com/v1/responses",{method:"POST",headers:{Authorization:`Bearer ${process.env.OPENAI_API_KEY}`,"Content-Type":"application/json"},body:JSON.stringify({model:process.env.OPENAI_TRANSLATION_MODEL??"gpt-5-mini",input:`Translate from ${source} to ${target}. Preserve HTML, placeholders like __AP_0__, URLs, numbers and brand names. Return only the translation.\n\n${protectedText}`})});
    if(!response.ok) throw new Error(`OpenAI vertaling mislukt (${response.status}).`);
    const data=await response.json();
    return restore(data.output_text??"");
  }
  throw new Error(`Onbekende vertaalprovider: ${provider}`);
}
