import axios from 'axios';
import { ObjectId } from 'mongodb';

export interface Bookmark {
  _id?: ObjectId;
  userEmail: string;
  url: string;
  title: string;
  favicon?: string;
  summary?: string;
  tags?: string[];
  order?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface BookmarkMetadata {
  title: string;
  favicon?: string;
}

export async function fetchMetadata(url: string): Promise<BookmarkMetadata> {
  try {
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LinkSaver/1.0)',
      },
    });

    const html = response.data;
    
    // Extract title using regex
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : 'Untitled';
    
    // Extract favicon using regex
    const faviconMatch = html.match(/<link[^>]*rel=["'](?:icon|shortcut icon|apple-touch-icon)["'][^>]*href=["']([^"']+)["'][^>]*>/i);
    let favicon = faviconMatch ? faviconMatch[1] : undefined;

    if (favicon && !favicon.startsWith('https')) {
      const urlObj = new URL(url);
      favicon = `${urlObj.protocol}//${urlObj.host}${favicon}`;
    }

    return { title, favicon };
  } catch (error) {
    console.error('Error fetching metadata:', error);
    return { title: 'Untitled' };
  }
}

export async function generateSummary(url: string): Promise<string> {
  try {
    // Validate URL
    const urlObj = new URL(url);
    
    // Strategy 1: Try Jina AI endpoint with retries
    const jinaSummary = await tryJinaAIWithRetry(url);
    if (jinaSummary && jinaSummary.length > 50) {
      console.log('Using Jina AI summary (length:', jinaSummary.length, ')');
      return jinaSummary;
    }
    
    // Strategy 2: Try to extract meaningful content from the page
    const pageSummary = await extractPageContent(url);
    if (pageSummary) {
      console.log('Using page content summary (length:', pageSummary.length, ')');
      return pageSummary;
    }
    
    // Strategy 3: Generate a basic description based on URL and title
    const basicDesc = generateBasicDescription(url);
    console.log('Using basic description:', basicDesc);
    return basicDesc;
    
  } catch (error) {
    console.error('All summary generation methods failed:', error);
    return 'Summary generation failed - the page content could not be processed.';
  }
}

async function tryJinaAIWithRetry(url: string): Promise<string | null> {
  const maxRetries = 2;
  const retryDelay = 2000; // 2 seconds

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    console.log(`\n=== Jina AI attempt ${attempt}/${maxRetries} for: ${url} ===`);
    
    const result = await tryJinaAI(url);
    if (result && result.length > 50) {
      console.log(`✅ Jina AI successful on attempt ${attempt}`);
      return result;
    }
    
    if (attempt < maxRetries) {
      console.log(`❌ Jina AI attempt ${attempt} failed, retrying in ${retryDelay}ms...`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
  
  console.log('❌ All Jina AI attempts failed');
  return null;
}

async function tryJinaAI(url: string): Promise<string | null> {
  try {
    // Fix URL encoding - remove protocol for Jina AI
    const urlObj = new URL(url);
    const target = urlObj.hostname + urlObj.pathname + urlObj.search;
    const jinaUrl = `https://r.jina.ai/${target}`;
    
    console.log('🔗 Jina AI URL:', jinaUrl);
    
    const response = await axios.get(jinaUrl, {
      timeout: 60000, // 60 seconds timeout
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/plain, text/html, application/json, */*',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      validateStatus: (status) => status < 500, // Accept any status < 500
    });
    
    console.log('📊 Response status:', response.status);
    
    if (response.data) {
      const summary = response.data.toString().trim();
      console.log('📊 Response length:', summary.length);
      console.log('📊 Response preview (first 300 chars):', summary.substring(0, 300));
      
      // Check if we got a meaningful response
      if (summary && summary.length > 50) {
        // Check if it's not just an error message
        const errorKeywords = ['error', 'not found', 'rate limit', 'timeout', 'failed', 'too many requests'];
        const hasError = errorKeywords.some(keyword => 
          summary.toLowerCase().includes(keyword)
        );
        
        if (!hasError) {
          console.log('✅ Jina AI summary successful - returning full content');
          return summary;
        } else {
          console.log('❌ Jina AI returned error content:', summary.substring(0, 100));
        }
      } else {
        console.log('❌ Jina AI returned empty or too short content (length:', summary.length, ')');
      }
    } else {
      console.log('❌ Jina AI returned no data');
    }
    
    return null;
  } catch (error: any) {
    console.log('❌ Jina AI error:', error.message);
    if (error.response) {
      console.log('❌ Error status:', error.response.status);
      console.log('❌ Error data:', error.response.data);
    }
    return null;
  }
}

async function extractPageContent(url: string): Promise<string | null> {
  try {
    console.log('🔍 Extracting content from page:', url);
    
    const response = await axios.get(url, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LinkSaver/1.0)',
      },
    });

    const html = response.data;
    
    // Extract meta description first
    const metaDescMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["'][^>]*>/i);
    if (metaDescMatch && metaDescMatch[1].length > 20) {
      console.log('✅ Found meta description');
      return metaDescMatch[1].trim();
    }
    
    // For Xpectrum AI specifically, extract key content
    if (url.includes('xpectrum-ai.com')) {
      console.log('🎯 Detected Xpectrum AI website - extracting specific content');
      
      // Extract content from various sections
      const sections = [
        /<h1[^>]*>([^<]+)<\/h1>/gi,
        /<h2[^>]*>([^<]+)<\/h2>/gi,
        /<h3[^>]*>([^<]+)<\/h3>/gi,
        /<p[^>]*>([^<]+)<\/p>/gi,
        /<div[^>]*class=["'][^"']*text[^"']*["'][^>]*>([\s\S]*?)<\/div>/gi,
      ];
      
      let extractedContent = '';
      
      for (const section of sections) {
        const matches = html.match(section);
        if (matches) {
          for (const match of matches) {
            const cleanText = match.replace(/<[^>]+>/g, ' ').trim();
            if (cleanText.length > 10) {
              extractedContent += cleanText + ' ';
            }
          }
        }
      }
      
      if (extractedContent.length > 50) {
        console.log('✅ Extracted Xpectrum AI specific content');
        return extractedContent.substring(0, 800).trim() + (extractedContent.length > 800 ? '...' : '');
      }
    }
    
    // Extract content from main, article, or div tags
    const contentSelectors = [
      /<main[^>]*>([\s\S]*?)<\/main>/i,
      /<article[^>]*>([\s\S]*?)<\/article>/i,
      /<div[^>]*class=["'][^"']*content[^"']*["'][^>]*>([\s\S]*?)<\/div>/i,
      /<div[^>]*id=["']content["'][^>]*>([\s\S]*?)<\/div>/i,
    ];
    
    for (const selector of contentSelectors) {
      const match = html.match(selector);
      if (match && match[1]) {
        const content = cleanHtmlContent(match[1]);
        if (content.length > 50) {
          console.log('✅ Found content in page structure');
          return content.substring(0, 500) + (content.length > 500 ? '...' : '');
        }
      }
    }
    
    // Fallback: extract from body
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    if (bodyMatch && bodyMatch[1]) {
      const content = cleanHtmlContent(bodyMatch[1]);
      if (content.length > 50) {
        console.log('✅ Extracted content from body');
        return content.substring(0, 500) + (content.length > 500 ? '...' : '');
      }
    }
    
    console.log('❌ No readable content found in page structure');
    return null;
  } catch (error: any) {
    console.log('❌ Page content extraction error:', error.message);
    return null;
  }
}

function cleanHtmlContent(html: string): string {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
    .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function generateBasicDescription(url: string): string {
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname;
    const path = urlObj.pathname;
    
    // Generate description based on URL structure
    if (path === '/' || path === '') {
      return `Homepage of ${domain}`;
    }
    
    const pathParts = path.split('/').filter(part => part.length > 0);
    if (pathParts.length > 0) {
      const lastPart = pathParts[pathParts.length - 1].replace(/[-_]/g, ' ');
      return `Page about ${lastPart} on ${domain}`;
    }
    
    return `Page on ${domain}`;
  } catch {
    return 'Web page content';
  }
} 