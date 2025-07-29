// Platform detection from URLs
import { Platform, PlatformConfig } from './types';

export const PLATFORM_CONFIGS: Record<Platform, PlatformConfig> = {
  [Platform.CLAUDE]: {
    name: 'Claude',
    urlPattern: /^https:\/\/claude\.ai\/share\/[a-f0-9-]+$/,
    extractionMethod: 'json',
    hasInternalApi: true
  },
  [Platform.CHATGPT]: {
    name: 'ChatGPT',
    urlPattern: /^https:\/\/chatgpt\.com\/share\/[a-f0-9-]+$/,
    extractionMethod: 'html',
    hasInternalApi: false
  },
  [Platform.COPILOT]: {
    name: 'Microsoft Copilot',
    urlPattern: /^https:\/\/copilot\.microsoft\.com\/shares\/[a-zA-Z0-9_-]+$/,
    extractionMethod: 'json',
    hasInternalApi: true
  },
  [Platform.GEMINI]: {
    name: 'Google Gemini',
    urlPattern: /^https:\/\/(g\.co\/gemini\/share|gemini\.google\.com\/share)\/[a-zA-Z0-9]+$/,
    extractionMethod: 'html',
    hasInternalApi: false
  },
  [Platform.GROK]: {
    name: 'Grok',
    urlPattern: /^https:\/\/grok\.com\/share\/[a-zA-Z0-9_-]+$/,
    extractionMethod: 'html',
    hasInternalApi: false
  },
  [Platform.PERPLEXITY]: {
    name: 'Perplexity',
    urlPattern: /^https:\/\/www\.perplexity\.ai\/search\/[a-zA-Z0-9_-]+$/,
    extractionMethod: 'html',
    hasInternalApi: false
  }
};

export interface PlatformDetectionResult {
  success: boolean;
  platform?: Platform;
  error?: string;
}

export function detectPlatform(url: string): PlatformDetectionResult {
  if (!url || typeof url !== 'string') {
    return {
      success: false,
      error: 'Invalid URL provided'
    };
  }

  for (const [platform, config] of Object.entries(PLATFORM_CONFIGS)) {
    if (config.urlPattern.test(url)) {
      return {
        success: true,
        platform: platform as Platform
      };
    }
  }
  
  return {
    success: false,
    error: 'Unsupported platform URL format'
  };
}

export function isValidPlatformUrl(url: string): boolean {
  return detectPlatform(url).success;
}

export function getPlatformConfig(platform: Platform): PlatformConfig {
  return PLATFORM_CONFIGS[platform];
}