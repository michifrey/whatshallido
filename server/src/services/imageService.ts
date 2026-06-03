export interface ImageSuggestion {
  id: string;
  url: string;
  thumb: string;
  author: string;
  authorUrl: string;
}

interface UnsplashPhoto {
  id: string;
  urls: { regular: string; thumb: string };
  user: { name: string; links: { html: string } };
}

/**
 * Sucht Bilder über die Unsplash-API. Benötigt UNSPLASH_ACCESS_KEY.
 * Ohne Key wird ein 503 mit Hinweis geworfen (Feature optional).
 */
export async function searchImages(query: string): Promise<ImageSuggestion[]> {
  const key = process.env.UNSPLASH_ACCESS_KEY;
  if (!key) {
    const err = new Error(
      "Bildersuche nicht konfiguriert: Setze UNSPLASH_ACCESS_KEY (kostenlos auf unsplash.com/developers).",
    );
    (err as { status?: number }).status = 503;
    throw err;
  }

  const url =
    "https://api.unsplash.com/search/photos?per_page=12&orientation=landscape&content_filter=high&query=" +
    encodeURIComponent(query);

  const res = await fetch(url, {
    headers: { Authorization: `Client-ID ${key}`, "Accept-Version": "v1" },
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) {
    const err = new Error(`Unsplash-Anfrage fehlgeschlagen (HTTP ${res.status})`);
    (err as { status?: number }).status = 502;
    throw err;
  }
  const data = (await res.json()) as { results: UnsplashPhoto[] };
  return data.results.map((p) => ({
    id: p.id,
    url: p.urls.regular,
    thumb: p.urls.thumb,
    author: p.user.name,
    authorUrl: p.user.links.html,
  }));
}
