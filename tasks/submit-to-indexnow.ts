import axios from 'axios';
import dotenv from 'dotenv';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import * as path from 'path';

// Configure dotenv to load variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

interface IndexNowResponse {
  status: number;
  message: string;
}

interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: string;
}

interface SitemapIndex {
  sitemap: Array<{ loc: string }>;
}

class IndexNowSubmitter {
  private apiKey: string;
  private baseUrl: string;
  private publicDir: string;

  constructor() {
    this.apiKey = this.loadApiKey();
    this.baseUrl = this.getBaseUrl();
    this.publicDir = join(process.cwd(), 'public');
  }

  private loadApiKey(): string {
    const apiKeyPath = join(process.cwd(), 'public', 'ac7d2e0216af47318d6a6ec99f3b5921.txt');
    if (!existsSync(apiKeyPath)) {
      throw new Error('IndexNow API key file not found');
    }
    return readFileSync(apiKeyPath, 'utf-8').trim();
  }

  private getBaseUrl(): string {
    // Read from environment or use localhost as fallback
    const env = process.env.NEXT_PUBLIC_VERCEL_ENV;
    if (env === 'production') {
      return `https://${process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL}`;
    } else if (env === 'preview') {
      return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
    } else {
      return process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    }
  }

  private async fetchSitemapContent(sitemapPath: string): Promise<string> {
    try {
      const fullPath = join(this.publicDir, sitemapPath);
      if (existsSync(fullPath)) {
        return readFileSync(fullPath, 'utf-8');
      } else {
        // Try to fetch from URL if local file doesn't exist
        const url = `${this.baseUrl}/${sitemapPath}`;
        console.log(`Fetching sitemap from: ${url}`);
        const response = await axios.get(url);
        return response.data;
      }
    } catch (error) {
      console.error(`Error fetching sitemap ${sitemapPath}:`, error);
      return '';
    }
  }

  private parseSitemapIndex(xmlContent: string): SitemapIndex {
    const sitemaps: Array<{ loc: string }> = [];
    const sitemapRegex = /<sitemap>\s*<loc>(.*?)<\/loc>\s*<\/sitemap>/g;
    let match;

    while ((match = sitemapRegex.exec(xmlContent)) !== null) {
      sitemaps.push({ loc: match[1] });
    }

    return { sitemap: sitemaps };
  }

  private parseSitemapUrls(xmlContent: string): SitemapUrl[] {
    const urls: SitemapUrl[] = [];
    const urlRegex =
      /<url>\s*<loc>(.*?)<\/loc>(?:\s*<lastmod>(.*?)<\/lastmod>)?(?:\s*<changefreq>(.*?)<\/changefreq>)?(?:\s*<priority>(.*?)<\/priority>)?\s*<\/url>/g;
    let match;

    while ((match = urlRegex.exec(xmlContent)) !== null) {
      urls.push({
        loc: match[1],
        lastmod: match[2],
        changefreq: match[3],
        priority: match[4],
      });
    }

    return urls;
  }

  private async submitToIndexNow(urls: string[]): Promise<void> {
    if (urls.length === 0) {
      console.log('No URLs to submit');
      return;
    }

    // IndexNow has a limit of 10,000 URLs per submission
    const batchSize = 10000;
    const batches = [];

    for (let i = 0; i < urls.length; i += batchSize) {
      batches.push(urls.slice(i, i + batchSize));
    }

    console.log(`Submitting ${urls.length} URLs in ${batches.length} batch(es)`);
    console.log(this.apiKey);
    console.log(this.baseUrl);
    console.log(new URL(this.baseUrl).host);

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      console.log(`Submitting batch ${i + 1}/${batches.length} with ${batch.length} URLs`);

      try {
        const response = await axios.post<IndexNowResponse>(
          'https://api.indexnow.org/indexnow',
          {
            host: new URL(this.baseUrl).host,
            key: this.apiKey,
            keyLocation:
              'https://www.dentalclinicclosetome.my/ac7d2e0216af47318d6a6ec99f3b5921.txt',
            urlList: batch,
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        );

        if (response.status === 200) {
          console.log(`✅ Batch ${i + 1} submitted successfully`);
        } else {
          console.log(`⚠️ Batch ${i + 1} returned status: ${response.status}`);
        }
      } catch (error) {
        console.error(`❌ Error submitting batch ${i + 1}:`, error);
        if (axios.isAxiosError(error)) {
          console.error('Response data:', error.response?.data);
        }
      }

      // Add a small delay between batches to be respectful to the API
      if (i < batches.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  }

  public async submitAllUrls(): Promise<void> {
    console.log('🚀 Starting IndexNow submission process...');
    console.log(`📍 Base URL: ${this.baseUrl}`);
    console.log(`🔑 API Key: ${this.apiKey.substring(0, 8)}...`);

    const allUrls: string[] = [];

    try {
      // First, read the main sitemap index
      const mainSitemapContent = await this.fetchSitemapContent('sitemap.xml');
      if (!mainSitemapContent) {
        throw new Error('Could not fetch main sitemap');
      }

      const sitemapIndex = this.parseSitemapIndex(mainSitemapContent);
      console.log(`📋 Found ${sitemapIndex.sitemap.length} sitemaps in index`);

      // Process each sitemap
      for (const sitemap of sitemapIndex.sitemap) {
        const sitemapPath = sitemap.loc.replace(this.baseUrl, '').replace(/^\//, '');
        console.log(`📄 Processing sitemap: ${sitemapPath}`);

        const sitemapContent = await this.fetchSitemapContent(sitemapPath);
        if (sitemapContent) {
          const urls = this.parseSitemapUrls(sitemapContent);
          console.log(`  Found ${urls.length} URLs in ${sitemapPath}`);

          // Add URLs to the collection, ensuring they're absolute URLs
          urls.forEach((url) => {
            if (url.loc.startsWith('http')) {
              allUrls.push(url.loc);
            } else {
              allUrls.push(`${this.baseUrl}${url.loc.startsWith('/') ? '' : '/'}${url.loc}`);
            }
          });
        }
      }

      // Remove duplicates
      const uniqueUrls = [...new Set(allUrls)];
      console.log(`\n📊 Total unique URLs found: ${uniqueUrls.length}`);

      // Submit to IndexNow
      await this.submitToIndexNow(uniqueUrls);

      console.log('\n✅ IndexNow submission process completed!');
    } catch (error) {
      console.error('❌ Error during submission process:', error);
      process.exit(1);
    }
  }
}

// Run the script
async function main() {
  const submitter = new IndexNowSubmitter();
  await submitter.submitAllUrls();
}

if (require.main === module) {
  main().catch(console.error);
}
