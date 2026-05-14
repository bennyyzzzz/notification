export function slugify(text) {
  return String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "_");
}

export function buildTrackedUrl(url, campaignName) {
  if (!url) {
    return "";
  }

  const hasQuery = url.includes("?");

  const separator = hasQuery ? "&" : "?";

  const campaignSlug = slugify(campaignName);

  return `${url}${separator}utm_source=firebase&utm_medium=notifyauto&utm_campaign=${campaignSlug}`;
}