// HTTP client for fetching web content
export interface HttpFetchResult {
  success: boolean;
  content?: string;
  error?: string;
  statusCode?: number;
}

interface HttpFetchOptions {
  timeout?: number;
  userAgent?: string;
  retries?: number;
}

const DEFAULT_OPTIONS: Required<HttpFetchOptions> = {
  timeout: 10000,
  userAgent: 'Mozilla/5.0 (compatible; LLMDigest/1.0)',
  retries: 2
};

export async function fetchContent(
  url: string, 
  options: HttpFetchOptions = {}
): Promise<HttpFetchResult> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  for (let attempt = 0; attempt <= opts.retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), opts.timeout);
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': opts.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'DNT': '1',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
          statusCode: response.status
        };
      }

      const content = await response.text();
      
      return {
        success: true,
        content
      };
      
    } catch (error) {
      if (attempt === opts.retries) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return {
          success: false,
          error: `Failed to fetch content after ${opts.retries + 1} attempts: ${errorMessage}`
        };
      }
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
    }
  }

  return {
    success: false,
    error: 'Unexpected error in fetch loop'
  };
}