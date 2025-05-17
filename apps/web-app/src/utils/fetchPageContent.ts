export async function fetchPageContent(targetUrl: string): Promise<string> {
  const proxyBaseUrl = "http://localhost:3001/proxy";
  const proxyUrl = `${proxyBaseUrl}?url=${encodeURIComponent(targetUrl)}`;

  try {
    const response = await fetch(proxyUrl);
    if (!response.ok)
      throw new Error(`Failed to fetch page, status ${response.status}`);
    const text = await response.text();
    return text;
  } catch (err) {
    console.error("Error fetching page content:", err);
    return "";
  }
}
