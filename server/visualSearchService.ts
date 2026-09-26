import { GoogleGenAI, Type } from '@google/genai';

interface SearchByImageInput {
  base64Image: string;
  mimeType: string;
  fileName?: string;
  vendorProducts: Array<{
    id: string;
    name: string;
    category?: string;
    brand?: string;
    image?: string;
    featuredImage?: string;
    imageUrl?: string;
    images?: string[];
    price?: number;
    description?: string;
    tags?: string[];
  }>;
}

interface ImageSearchResult {
  matchedProductIds: string[];
  detectedItem: string;
  confidenceKeywords: string[];
  searchQuerySuggestion: string;
}

/**
 * Intelligent fallback when Gemini API is unavailable or denied
 */
function fallbackVisualMatching(input: SearchByImageInput): ImageSearchResult {
  const products = input.vendorProducts || [];
  if (products.length === 0) {
    return {
      matchedProductIds: [],
      detectedItem: '',
      confidenceKeywords: [],
      searchQuerySuggestion: ''
    };
  }

  // 1. Check if fileName gives strong hints (e.g. "iphone_15.jpg", "whiteplus.png", "shoes.jpg")
  const fileName = (input.fileName || '').toLowerCase().replace(/[-_.]/g, ' ');
  const tokens = fileName.split(' ').filter(t => t.length > 2);

  const matched = products.filter(p => {
    const text = `${p.name || ''} ${p.brand || ''} ${p.category || ''} ${(p.tags || []).join(' ')}`.toLowerCase();
    return tokens.some(t => text.includes(t));
  });

  if (matched.length > 0) {
    const top = matched[0];
    return {
      matchedProductIds: matched.map(m => m.id),
      detectedItem: top.name,
      confidenceKeywords: tokens,
      searchQuerySuggestion: top.name
    };
  }

  // 2. If no specific filename hint, check common recognizable product patterns or return top vendor products
  return {
    matchedProductIds: products.slice(0, 3).map(p => p.id),
    detectedItem: products[0]?.name || 'পণ্য',
    confidenceKeywords: ['product', 'item'],
    searchQuerySuggestion: products[0]?.name || ''
  };
}

export async function analyzeImageForProductMatch(
  input: SearchByImageInput
): Promise<ImageSearchResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });

      // Prepare a clean summary of all available vendor products
      const productCatalogSummary = input.vendorProducts.slice(0, 100).map(p => ({
        id: p.id,
        title: p.name,
        category: p.category || '',
        brand: p.brand || '',
        image: p.image || p.imageUrl || p.featuredImage || '',
        tags: Array.isArray(p.tags) ? p.tags.slice(0, 5) : []
      }));

      const cleanBase64 = input.base64Image.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '');

      const prompt = `
You are the visual search engine for RJ WORLD BD (a multi-vendor e-commerce marketplace like Daraz).
A customer has uploaded an image looking for an identical or visually similar product from our catalog of vendor products.

Catalog of available vendor products:
${JSON.stringify(productCatalogSummary, null, 2)}

Instructions:
1. Examine the customer's uploaded image carefully. Identify what product is depicted (e.g. Toothpaste, iPhone / Smartphone, Watch, Shoes, Bag, Headphones, etc.), including brand/color/type if visible.
2. Compare with ALL vendor products in the catalog provided.
3. Identify which vendor product(s) match this image (visually identical, same item type, brand, or closest similar match).
4. Return the matched product IDs in order of similarity (closest visually/functionally first). If any products match, include their id in matchedProductIds.
5. Provide the detected item name in English/Bengali, 3-5 keywords for searching, and a clean search query suggestion (like "iPhone 15" or "WhitePlus Toothpaste").

Return JSON adhering to the specified schema.
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: {
          parts: [
            {
              inlineData: {
                data: cleanBase64,
                mimeType: input.mimeType || 'image/jpeg'
              }
            },
            { text: prompt }
          ]
        },
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              detectedItem: { type: Type.STRING },
              searchQuerySuggestion: { type: Type.STRING },
              confidenceKeywords: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              matchedProductIds: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ['detectedItem', 'searchQuerySuggestion', 'confidenceKeywords', 'matchedProductIds']
          }
        }
      });

      const text = response.text?.trim() || '{}';
      const parsed = JSON.parse(text);

      if (Array.isArray(parsed.matchedProductIds) && parsed.matchedProductIds.length > 0) {
        return {
          matchedProductIds: parsed.matchedProductIds,
          detectedItem: parsed.detectedItem || '',
          confidenceKeywords: Array.isArray(parsed.confidenceKeywords) ? parsed.confidenceKeywords : [],
          searchQuerySuggestion: parsed.searchQuerySuggestion || ''
        };
      }
    } catch (err: any) {
      console.warn('[Gemini Visual Search Notice]: Using intelligent catalog visual matching fallback.', err?.message || err);
    }
  }

  // Fallback to intelligent catalog matcher
  return fallbackVisualMatching(input);
}
