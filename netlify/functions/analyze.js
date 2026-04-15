exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { userMessage } = JSON.parse(event.body);

    const systemPrompt = `Tu es un expert en IA et en optimisation de couts. Analyse la demande utilisateur et reponds UNIQUEMENT en JSON valide, sans markdown, sans backticks, sans texte avant ou apres.

Les modeles disponibles avec leurs prix par million de tokens:
- Claude Haiku 4.5 (Anthropic, rapide): input $1.00, output $5.00 - Force: taches repetitives, extraction, chatbot
- Claude Sonnet 4.6 (Anthropic, equilibre): input $3.00, output $15.00 - Force: code, redaction, analyse
- Claude Opus 4.6 (Anthropic, puissant): input $5.00, output $25.00 - Force: code complexe, juridique, raisonnement
- GPT-5 nano (OpenAI, rapide): input $0.05, output $0.40 - Force: ultra-economique, classification
- GPT-5 mini (OpenAI, rapide): input $0.25, output $2.00 - Force: economique, polyvalent
- GPT-4o (OpenAI, equilibre): input $1.25, output $5.00 - Force: vision, multimodal
- GPT-5.2 (OpenAI, puissant): input $1.75, output $14.00 - Force: raisonnement, recherche
- Gemini 3 Flash (Google, rapide): input $0.10, output $0.40 - Force: tres rapide, economique
- Gemini 2.5 Flash (Google, rapide): input $0.26, output $1.05 - Force: grand contexte
- Gemini 2.5 Pro (Google, equilibre): input $1.25, output $10.00 - Force: 1M tokens contexte
- Gemini 3.1 Pro (Google, puissant): input $2.00, output $12.00 - Force: recherche Google
- Grok 4.1 (xAI, rapide): input $0.20, output $0.50 - Force: actualite X/Twitter
- Grok 4.1 Heavy (xAI, puissant): input $3.00, output $15.00 - Force: raisonnement
- DeepSeek V3 (DeepSeek, equilibre): input $0.27, output $1.10 - Force: tres economique, traduction
- DeepSeek R1 (DeepSeek, puissant): input $0.55, output $2.19 - Force: code, maths, raisonnement, tres economique

Regles estimation tokens:
- 1 page texte = ~700 tokens
- 1 email = ~300 tokens
- 1 facture = ~500 tokens
- 1 message court = ~80 tokens
- Output court (extraction, classification) = 50-200 tokens
- Output moyen (resume, email) = 200-600 tokens
- Output long (rapport, redaction) = 600-2000 tokens
- Code = 800-1500 tokens output
- Si volume non mentionne: suppose 500 requetes/mois

Retourne ce JSON exact:
{
  "summary": "Ce que j'ai compris de ta demande en 2 phrases claires",
  "task_type": "type de tache detecte",
  "input_tokens": nombre entier estimé,
  "output_tokens": nombre entier estimé,
  "volume_monthly": nombre entier estimé,
  "quality_needed": "fast ou balanced ou powerful",
  "reasoning": "Explication courte de tes estimations en 1 phrase",
  "specialty_note": "Note sur quelle IA est la plus adaptee pour cette tache specifique",
  "recommendations": [
    {
      "model": "nom exact du modele",
      "provider": "nom du fournisseur",
      "monthly_cost": nombre decimal,
      "why": "raison courte en 5 mots max",
      "rank": 1
    },
    {"model": "...", "provider": "...", "monthly_cost": 0, "why": "...", "rank": 2},
    {"model": "...", "provider": "...", "monthly_cost": 0, "why": "...", "rank": 3}
  ]
}`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 1000,
        temperature: 0.1,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Groq API error');
    }

    const text = data.choices[0].message.content.trim();
    const clean = text.replace(/```json|```/g, '').trim();
    JSON.parse(clean); // validate JSON

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ result: clean })
    };

  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: err.message })
    };
  }
};
