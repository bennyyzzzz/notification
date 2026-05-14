export function countWords(text) {
  return String(text || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

export function validatePush(data) {
  const {
    title,
    body,
    redirectUrl,
    audienceType,
    audienceValue
  } = data;

  if (!title) {
    throw new Error("Título é obrigatório.");
  }

  if (!body) {
    throw new Error("Corpo é obrigatório.");
  }

  if (countWords(title) > 5) {
    throw new Error("O título deve ter no máximo 5 palavras.");
  }

  if (countWords(body) > 10) {
    throw new Error("O corpo deve ter no máximo 10 palavras.");
  }

  if (!redirectUrl) {
    throw new Error("Link de redirecionamento é obrigatório.");
  }

  if (!audienceType || !audienceValue) {
    throw new Error("Token ou tópico é obrigatório.");
  }
}