/*import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function generatePushOptions(campaign) {
  const prompt = `
Você é um especialista em copywriting para notificações push de e-commerce e apps.

Gere exatamente 5 opções de push notification.

Dados da campanha:
- Nome: ${campaign.name}
- Tema: ${campaign.theme}
- Segmento: ${campaign.segment}
- Tom de voz: ${campaign.tone}
- Promoção: ${campaign.hasPromotion ? campaign.promotionDescription : "Não informado"}
- Categoria: ${campaign.hasCategory ? campaign.category : "Não informado"}
- Produto: ${campaign.hasProduct ? campaign.product : "Não informado"}
- Cupom: ${campaign.hasCoupon ? campaign.coupon : "Não informado"}
- Percentual de desconto: ${campaign.discountPercentage || "Não informado"}
- Link de redirecionamento: ${campaign.redirectUrl}

Regras:
- Retorne somente JSON válido.
- Gere exatamente 5 objetos.
- Cada título deve ter no máximo 5 palavras.
- Cada corpo deve ter no máximo 10 palavras.
- Pode usar emoji, mas sem exagero.
- Deve ter CTA claro.
- Não prometa algo que não foi informado.
- Adapte a linguagem ao segmento.
- Não inclua o link no title nem no body.

Formato:
[
  {
    "id": 1,
    "title": "Título aqui",
    "body": "Texto aqui",
    "cta": "CTA usado",
    "strategy": "Breve explicação"
  }
]
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [
      {
        role: "system",
        content: "Você responde apenas JSON válido, sem markdown."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    temperature: 0.8
  });

  const content = response.choices[0].message.content;

  return JSON.parse(content);
}*/

export async function generatePushOptions(campaign) {
  return [
    {
      id: 1,
      title: "Oferta especial 🔥",
      body: "Confira agora e aproveite essa condição.",
      cta: "Confira agora",
      strategy: "Chamada direta para promoção"
    },
    {
      id: 2,
      title: "Corre pro app 🛍️",
      body: "Tem uma oportunidade esperando por você.",
      cta: "Ir para o app",
      strategy: "Tom jovem e rápido"
    },
    {
      id: 3,
      title: "Só hoje 👀",
      body: "Aproveite antes que essa chance acabe.",
      cta: "Aproveitar agora",
      strategy: "Uso de urgência"
    },
    {
      id: 4,
      title: "Novidade liberada ✨",
      body: "Veja a campanha e escolha seus favoritos.",
      cta: "Ver novidades",
      strategy: "Foco em descoberta"
    },
    {
      id: 5,
      title: "Desconto no ar 🚀",
      body: "Garanta seus favoritos com condição especial.",
      cta: "Comprar agora",
      strategy: "Foco em conversão"
    }
  ];
}