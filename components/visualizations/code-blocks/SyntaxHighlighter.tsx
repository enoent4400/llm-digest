"use client"

import { useEffect, useState } from 'react';
import { codeToHtml } from 'shiki';

interface SyntaxHighlighterProps {
  code: string;
  language: string;
  className?: string;
}

// Language mapping for Shiki compatibility
const SHIKI_LANGUAGE_MAP: Record<string, string> = {
  javascript: 'javascript',
  typescript: 'typescript',
  python: 'python',
  html: 'html',
  css: 'css',
  sql: 'sql',
  bash: 'bash',
  json: 'json',
  yaml: 'yaml',
  go: 'go',
  rust: 'rust',
  java: 'java',
  cpp: 'cpp',
  c: 'c',
  csharp: 'csharp',
  php: 'php',
  ruby: 'ruby',
  swift: 'swift',
  kotlin: 'kotlin',
  other: 'text'
};

export function SyntaxHighlighter({ code, language, className = '' }: SyntaxHighlighterProps) {
  const [highlightedHtml, setHighlightedHtml] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const highlightCode = async () => {
      try {
        setIsLoading(true);
        const shikiLang = SHIKI_LANGUAGE_MAP[language] || 'text';
        
        const html = await codeToHtml(code, {
          lang: shikiLang,
          theme: 'github-dark'
        });
        
        setHighlightedHtml(html);
      } catch (error) {
        console.warn('Failed to highlight code:', error);
        // Fallback to plain text with proper formatting
        const escaped = code.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        setHighlightedHtml(`<pre class="shiki" style="background-color:#0d1117;color:#e6edf3;"><code>${escaped}</code></pre>`);
      } finally {
        setIsLoading(false);
      }
    };

    if (code) {
      highlightCode();
    }
  }, [code, language]);

  if (isLoading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="bg-gray-800 rounded h-4 mb-2"></div>
        <div className="bg-gray-800 rounded h-4 mb-2 w-3/4"></div>
        <div className="bg-gray-800 rounded h-4 mb-2 w-1/2"></div>
      </div>
    );
  }

  return (
    <div 
      className={className}
      dangerouslySetInnerHTML={{ __html: highlightedHtml }}
    />
  );
}