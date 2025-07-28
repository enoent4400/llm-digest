// General HTML parsing utilities using puppeteer-core
import puppeteer, { Browser, Page } from 'puppeteer-core';
import { ConversationMessage, ProcessedConversation, Platform } from '../platform/types';

interface BrowserOptions {
  timeout?: number;
  executablePath?: string;
  headless?: boolean;
}

interface ExtractionOptions {
  timeout?: number;
  waitForSelector?: string;
  extractMessages: () => Promise<ConversationMessage[]>;
  extractTitle: () => Promise<string>;
}

const DEFAULT_BROWSER_OPTIONS: Required<BrowserOptions> = {
  timeout: 15000,
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: true
};

export async function launchBrowser(options: BrowserOptions = {}): Promise<Browser> {
  const opts = { ...DEFAULT_BROWSER_OPTIONS, ...options };
  
  return await puppeteer.launch({
    headless: opts.headless,
    executablePath: opts.executablePath,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--disable-web-security',
      '--disable-features=VizDisplayCompositor',
      '--disable-background-timer-throttling',
      '--disable-renderer-backgrounding'
    ]
  });
}

export async function extractFromPage(
  url: string,
  options: ExtractionOptions
): Promise<{ success: boolean; conversation?: ProcessedConversation; error?: string }> {
  let browser: Browser | null = null;
  let page: Page | null = null;

  try {
    console.log(`HTML extraction starting for URL: ${url}`);
    browser = await launchBrowser({ timeout: options.timeout });
    page = await browser.newPage();
    
    // Stealth mode - hide webdriver
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
      Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
      Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
    });
    
    // Try different user agents based on URL
    const isGemini = url.includes('gemini') || url.includes('g.co');
    let userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
    let waitStrategy = 'networkidle0';
    
    if (isGemini) {
      // Try mobile user agent for Gemini
      userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1';
      waitStrategy = 'domcontentloaded'; // More lenient
      console.log('Using mobile user agent and lenient loading for Gemini');
    }
    
    await page.setUserAgent(userAgent);
    console.log(`Using user agent: ${userAgent}`);
    
    // Set additional headers to look more like a real browser
    await page.setExtraHTTPHeaders({
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate, br',
      'DNT': '1',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
    });
    
    console.log(`Navigating to page with timeout: ${options.timeout || DEFAULT_BROWSER_OPTIONS.timeout}ms, strategy: ${waitStrategy}`);
    
    try {
      await page.goto(url, { 
        waitUntil: waitStrategy as any,
        timeout: options.timeout || DEFAULT_BROWSER_OPTIONS.timeout
      });
    } catch (navError) {
      if (isGemini && waitStrategy !== 'load') {
        console.log(`First navigation failed, trying with 'load' strategy...`);
        await page.goto(url, { 
          waitUntil: 'load',
          timeout: options.timeout || DEFAULT_BROWSER_OPTIONS.timeout
        });
      } else {
        throw navError;
      }
    }

    console.log(`Page loaded successfully. Final URL: ${page.url()}`);
    console.log(`Page title: ${await page.title()}`);
    
    // Get basic page info
    const pageInfo = await page.evaluate(() => ({
      url: document.location.href,
      title: document.title,
      bodyText: document.body?.textContent?.substring(0, 200) || 'No body text',
      elementCount: document.querySelectorAll('*').length
    }));
    console.log(`Page info:`, pageInfo);

    if (options.waitForSelector) {
      console.log(`Waiting for selector: ${options.waitForSelector}`);
      try {
        await page.waitForSelector(options.waitForSelector, { 
          timeout: options.timeout || DEFAULT_BROWSER_OPTIONS.timeout
        });
        console.log(`Found selector: ${options.waitForSelector}`);
      } catch (selectorError) {
        console.log(`Selector not found: ${options.waitForSelector}`);
        
        // Check what elements are actually available
        const availableElements = await page.evaluate(() => {
          const allElements = document.querySelectorAll('*');
          const elementTypes = new Set();
          Array.from(allElements).forEach(el => {
            if (el.className) elementTypes.add(`.${el.className.split(' ')[0]}`);
            elementTypes.add(el.tagName.toLowerCase());
          });
          return Array.from(elementTypes).slice(0, 20);
        });
        console.log(`Available elements sample:`, availableElements);
      }
    }

    const messages = await page.evaluate(options.extractMessages);
    const title = await page.evaluate(options.extractTitle);

    if (messages.length === 0) {
      return {
        success: false,
        error: 'No conversation messages found on the page'
      };
    }

    return {
      success: true,
      conversation: {
        messages,
        title,
        platform: Platform.CHATGPT // Will be overridden by calling parser
      }
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      error: `HTML extraction failed: ${errorMessage}`
    };
  } finally {
    if (page) await page.close().catch(() => {});
    if (browser) await browser.close().catch(() => {});
  }
}

// Helper functions for common extraction patterns
export async function extractTextContent(page: Page, selector: string): Promise<string | null> {
  try {
    return await page.evaluate((sel) => {
      const element = document.querySelector(sel);
      return element?.textContent?.trim() || null;
    }, selector);
  } catch {
    return null;
  }
}

export async function extractAllTextContent(page: Page, selector: string): Promise<string[]> {
  try {
    return await page.evaluate((sel) => {
      const elements = document.querySelectorAll(sel);
      return Array.from(elements).map(el => el.textContent?.trim() || '').filter(Boolean);
    }, selector);
  } catch {
    return [];
  }
}

export async function waitForAnySelector(page: Page, selectors: string[], timeout = 5000): Promise<string | null> {
  try {
    const result = await page.waitForFunction(
      (sels) => {
        for (const sel of sels) {
          if (document.querySelector(sel)) {
            return sel;
          }
        }
        return null;
      },
      { timeout },
      selectors
    );
    return await result.jsonValue();
  } catch {
    return null;
  }
}