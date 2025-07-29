// API endpoint for creating digests from platform URLs
// Supports ChatGPT, Claude, Gemini, Copilot, and Grok shared links

import { NextRequest, NextResponse } from 'next/server';
import { createDigest, type DigestResult } from '@/lib/ai';
import { saveDigest, getDigestByFingerprint, updateDigest } from '@/lib/database/digests';
import { extractConversation } from '@/lib/parsers';
import type { DigestFormat } from '@/types/database';

// Default user ID for open-source version (no auth)
const DEFAULT_USER_ID = 'anonymous';

interface CreateFromUrlRequest {
  url: string;
  options?: {
    format?: DigestFormat;
    regenerate?: boolean;
    existingDigestId?: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    // Use default user for open-source version
    const user = { id: DEFAULT_USER_ID };

    // Parse request body
    const body: CreateFromUrlRequest = await request.json();
    const { url, options = {} } = body;

    // Validate required fields
    if (!url) {
      return NextResponse.json(
        { error: 'Missing required field: url' },
        { status: 400 }
      );
    }

    console.log(`Starting conversation extraction from URL: ${url}`);

    // Extract conversation from URL
    const extractionResult = await extractConversation(url);
    
    if (!extractionResult.success) {
      return NextResponse.json(
        { 
          error: 'Failed to extract conversation from URL',
          details: extractionResult.error
        },
        { status: 400 }
      );
    }

    const conversation = extractionResult.conversation!;
    console.log(`Successfully extracted ${conversation.messages.length} messages from ${conversation.platform}`);

    // Create fingerprint for caching - use full URL to ensure uniqueness
    const fingerprint = `${conversation.platform}-${Buffer.from(url).toString('base64')}`;
    
    // Check if digest already exists for this fingerprint
    const { data: existingDigest } = await getDigestByFingerprint(fingerprint, user.id);

    // Skip cache if regenerating
    if (existingDigest && !options.regenerate) {
      console.log(`Cache hit: returning existing digest for fingerprint: ${fingerprint}`);
      return NextResponse.json({
        success: true,
        digestId: existingDigest.id,
        result: {
          digest: JSON.stringify(existingDigest.processed_content),
          modelUsed: existingDigest.model_used,
          complexity: 'cached',
          cost: 0,
          fallbackUsed: false,
          usage: {
            promptTokens: existingDigest.input_tokens,
            completionTokens: existingDigest.output_tokens,
            totalTokens: existingDigest.input_tokens + existingDigest.output_tokens
          }
        },
        metadata: {
          platform: conversation.platform,
          messageCount: conversation.messages.length,
          extractionTime: extractionResult.metadata?.extractionTime,
          processing: {
            timestamp: existingDigest.created,
            options,
            cached: true
          }
        }
      });
    }

    // Convert to format expected by createDigest
    const formattedConversation = {
      id: fingerprint,
      title: conversation.title,
      messages: conversation.messages,
      model: conversation.model || 'unknown',
      fingerprint
    };

    console.log(`Creating digest for ${conversation.platform} conversation: ${conversation.title}`);

    // Create digest using smart model selection
    const digestFormat = options.format || 'executive-summary';
    const result: DigestResult = await createDigest(formattedConversation, digestFormat);

    // Save digest to database
    let processedContent;
    try {
      // Clean the digest response - remove any potential wrapper text or whitespace
      let cleanDigest = result.digest.trim();
      
      // Remove markdown code block wrapper if present
      if (cleanDigest.startsWith('```json\n')) {
        cleanDigest = cleanDigest.replace(/^```json\n/, '').replace(/\n```$/, '');
      } else if (cleanDigest.startsWith('```\n')) {
        cleanDigest = cleanDigest.replace(/^```\n/, '').replace(/\n```$/, '');
      }
      
      // Try to parse the cleaned JSON
      processedContent = JSON.parse(cleanDigest);
      
      console.log('Successfully parsed digest JSON');
    } catch (error) {
      console.error('Failed to parse cleaned digest JSON. Error:', error instanceof Error ? error.message : String(error));
      
      // Try parsing the original raw response as a fallback
      try {
        console.log('Attempting to parse original raw response...');
        processedContent = JSON.parse(result.digest);
        console.log('Successfully parsed original raw digest JSON');
      } catch (secondError) {
        console.error('Both cleaned and raw parsing failed. Second error:', secondError instanceof Error ? secondError.message : String(secondError));
        console.error('Raw digest length:', result.digest.length);
        console.error('First 500 chars:', result.digest.substring(0, 500));
        console.error('Last 500 chars:', result.digest.substring(Math.max(0, result.digest.length - 500)));
        
        // Try to provide more specific error information
        let errorDetails = 'Unknown parsing error';
        if (error instanceof Error) {
          errorDetails = error.message;
        }
        
        processedContent = { 
          error: 'Invalid JSON response', 
          raw: result.digest,
          parseError: errorDetails,
          secondParseError: secondError instanceof Error ? secondError.message : String(secondError),
          digestLength: result.digest.length
        };
      }
    }

    const digestTitle = processedContent?.title || conversation.title;

    // If regenerating, update existing digest instead of creating new one
    let savedDigest, saveError;
    
    if (options.regenerate && existingDigest) {
      const updateData = {
        title: digestTitle,
        processed_content: processedContent,
        input_tokens: result.usage?.promptTokens || 0,
        output_tokens: result.usage?.completionTokens || 0,
        estimated_cost: result.cost,
        model_used: result.modelUsed
      };

      const { data: updatedDigest, error: updateError } = await updateDigest(existingDigest.id, updateData);

      savedDigest = updatedDigest;
      saveError = updateError;
    } else {
      // Create new digest
      const digestData = {
        user_id: user.id,
        source_url: url,
        source_platform: conversation.platform,
        conversation_title: conversation.title,
        conversation_fingerprint: fingerprint,
        title: digestTitle,
        format: digestFormat,
        status: 'completed' as const,
        raw_content: conversation,
        processed_content: processedContent,
        input_tokens: result.usage?.promptTokens || 0,
        output_tokens: result.usage?.completionTokens || 0,
        estimated_cost: result.cost,
        model_used: result.modelUsed
      };

      const { data: newDigest, error: createError } = await saveDigest(digestData);
      savedDigest = newDigest;
      saveError = createError;
    }

    if (saveError || !savedDigest) {
      console.error('Failed to save digest to database:', saveError);
      return NextResponse.json(
        { error: 'Failed to save digest to database', details: saveError?.message },
        { status: 500 }
      );
    }

    const digestId = savedDigest?.id || fingerprint;

    console.log(`Successfully created digest from ${conversation.platform} URL, model: ${result.modelUsed}, cost: $${result.cost}, saved as: ${digestId}`);

    // Return the digest result
    return NextResponse.json({
      success: true,
      digestId,
      result,
      metadata: {
        platform: conversation.platform,
        messageCount: conversation.messages.length,
        extractionTime: extractionResult.metadata?.extractionTime,
        extractionMethod: extractionResult.metadata?.method,
        processing: {
          timestamp: new Date().toISOString(),
          options
        }
      }
    });

  } catch (error) {
    console.error('Digest creation from URL error:', error);

    return NextResponse.json(
      {
        error: 'Internal server error while creating digest from URL',
        code: 'DIGEST_FROM_URL_FAILED',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to create digests from URLs.' },
    { status: 405 }
  );
}