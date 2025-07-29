"use client"

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Code2, Download, Copy, ChevronDown, ChevronUp, FileCode } from 'lucide-react';
import { toast } from 'sonner';
import type { CodeBlocksContent, CodeBlock } from '@/types/digest';
import type { DigestRecord } from '@/types/database';
import { SyntaxHighlighter } from './SyntaxHighlighter';

interface SimpleCodeBlocksDigestProps {
  digest?: CodeBlocksContent;
  databaseDigest?: DigestRecord;
  showMetadata?: boolean;
}

// Helper to parse database digest
function parseDatabaseDigest(dbDigest: DigestRecord): CodeBlocksContent {
  const content = dbDigest.processed_content || {};
  return {
    title: content.title || 'Code from Chat',
    hasCodeBlocks: content.hasCodeBlocks ?? true,
    summary: content.summary || 'Extracted code blocks',
    blocks: content.blocks || [],
    metadata: {
      ...content.metadata,
      conversationLength: content.metadata?.conversationLength || '0',
      complexity: content.metadata?.complexity || 'simple',
      domain: content.metadata?.domain || 'general',
      completeness: content.metadata?.completeness || 'complete'
    }
  };
}

// Language display names
const LANGUAGE_NAMES: Record<string, string> = {
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  python: 'Python',
  html: 'HTML',
  css: 'CSS',
  sql: 'SQL',
  bash: 'Bash/Shell',
  json: 'JSON',
  yaml: 'YAML',
  go: 'Go',
  rust: 'Rust',
  java: 'Java',
  cpp: 'C++',
  csharp: 'C#',
  php: 'PHP',
  ruby: 'Ruby',
  swift: 'Swift',
  kotlin: 'Kotlin',
  other: 'Other'
};

export function SimpleCodeBlocksDigest({ digest, databaseDigest, showMetadata }: SimpleCodeBlocksDigestProps) {
  const codeContent = digest || (databaseDigest ? parseDatabaseDigest(databaseDigest) : null);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [languageFilter, setLanguageFilter] = useState<string>('all');
  const [isExpanded, setIsExpanded] = useState(true);

  // Filter blocks by language - must be before early returns
  const filteredBlocks = useMemo(() => {
    if (!codeContent?.blocks) return [];
    if (languageFilter === 'all') return codeContent.blocks;
    return codeContent.blocks.filter(block => block.language === languageFilter);
  }, [codeContent?.blocks, languageFilter]);

  if (!codeContent) return null;

  // If no code blocks found
  if (!codeContent.hasCodeBlocks || codeContent.blocks.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <p className="text-lg font-semibold text-gray-400 mb-2">
            No Code Blocks Found
          </p>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            {codeContent.summary}
          </p>
        </CardContent>
      </Card>
    );
  }

  // Get selected block
  const selectedBlock = selectedBlockId 
    ? codeContent.blocks.find(b => b.id === selectedBlockId)
    : filteredBlocks[0];

  // Copy code to clipboard
  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Code copied to clipboard');
  };

  // Download single file
  const downloadFile = (block: CodeBlock) => {
    const blob = new Blob([block.code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = block.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${block.filename}`);
  };

  // Download all files
  const downloadAll = () => {
    filteredBlocks.forEach(block => downloadFile(block));
  };

  return (
    <Card className="overflow-hidden w-full">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-xl font-semibold text-gray-100 flex items-center gap-2">
              <Icon icon={Code2} size={24} strokeWidth={3} />
              {codeContent.title}
            </CardTitle>
            {showMetadata && codeContent.summary && (
              <p className="text-sm text-gray-400 mt-2 pr-4">{codeContent.summary}</p>
            )}
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex-shrink-0"
          >
            <Icon icon={isExpanded ? ChevronUp : ChevronDown} size={20} />
          </Button>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="p-0">
          <div className="flex border-t border-gray-700" style={{ height: '700px' }}>
            {/* Left Panel - File List */}
            <div className="w-1/4 border-r border-gray-700 flex flex-col">
              {/* Filter Dropdown */}
              <div className="p-4 border-b border-gray-700">
                <Select value={languageFilter} onValueChange={setLanguageFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Filter by language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All files</SelectItem>
                    {codeContent.metadata.languages.map(lang => (
                      <SelectItem key={lang} value={lang}>
                        {LANGUAGE_NAMES[lang] || lang}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* File List */}
              <div className="flex-1 overflow-y-auto">
                {filteredBlocks.map(block => (
                  <button
                    key={block.id}
                    onClick={() => setSelectedBlockId(block.id)}
                    className={`w-full px-4 py-3 text-left hover:bg-gray-800 transition-colors flex items-center gap-2 ${
                      selectedBlock?.id === block.id ? 'bg-gray-800' : ''
                    }`}
                  >
                    <Icon icon={FileCode} size={16} className="text-gray-400" />
                    <span className="text-sm truncate">{block.filename}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Right Panel - Code Viewer */}
            <div className="flex-1 flex flex-col">
              {selectedBlock && (
                <>
                  {/* File Header */}
                  <div className="p-4 border-b border-gray-700">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-100 truncate">{selectedBlock.filename}</h3>
                        {selectedBlock.description && (
                          <p className="text-sm text-gray-400 mt-1 line-clamp-2">{selectedBlock.description}</p>
                        )}
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <Button 
                          size="sm" 
                          variant="secondary"
                          onClick={() => copyCode(selectedBlock.code)}
                        >
                          <Icon icon={Copy} size={16} className="mr-1" />
                          Copy
                        </Button>
                        <Button 
                          size="sm" 
                          variant="secondary"
                          onClick={() => downloadFile(selectedBlock)}
                        >
                          <Icon icon={Download} size={16} className="mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Code Display */}
                  <div className="flex-1 overflow-auto bg-[#0d1117] p-4">
                    <SyntaxHighlighter
                      code={selectedBlock.code}
                      language={selectedBlock.language}
                      className="w-full h-full"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="p-4 border-t border-gray-700 flex justify-between items-center">
            <span className="text-sm text-gray-400">
              {codeContent.metadata.totalBlocks} files • {codeContent.metadata.languages.length} languages
            </span>
            <Button 
              size="sm" 
              variant="secondary"
              onClick={downloadAll}
            >
              <Icon icon={Download} size={16} className="mr-1" />
              Download All
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}