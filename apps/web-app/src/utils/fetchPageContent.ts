export async function fetchPageContent(targetUrl: string): Promise<string> {
  const proxyBaseUrl = "http://localhost:3001/extractPageContent";
  //construct the proxy URL with the encoded target URL as query parameter
  const proxyUrl = `${proxyBaseUrl}?url=${encodeURIComponent(targetUrl)}`;

  try {
    // Fetch the page content
    const response = await fetch(proxyUrl);
    if (!response.ok)
      throw new Error(`Failed to fetch page, status ${response.status}`);
    const data = await response.json();
    return data.text;
  } catch (err) {
    console.error("Error fetching page content:", err);
    return "";
  }
}
