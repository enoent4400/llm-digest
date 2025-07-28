// CreateDigestModal component tests using React Testing Library
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CreateDigestModal } from '@/components/digest/CreateDigestModal';

// Mock the API call
const mockFetch = vi.mocked(global.fetch);

describe('CreateDigestModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    isLoading: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockClear();
  });

  it('should return null when isOpen is false', () => {
    const { container } = render(
      <CreateDigestModal {...defaultProps} isOpen={false} />
    );
    
    expect(container.firstChild).toBeNull();
  });

  it('should render modal when isOpen is true', () => {
    render(<CreateDigestModal {...defaultProps} />);
    
    expect(screen.getByText('Create Digest')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByText('Submit')).toBeInTheDocument();
    expect(screen.getAllByText('Close')).toHaveLength(2); // One visible, one screen reader
  });

  it('should show URL input field with Claude.ai placeholder', () => {
    render(<CreateDigestModal {...defaultProps} />);
    
    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('placeholder', expect.stringContaining('claude.ai'));
  });

  it('should show error for invalid URL', async () => {
    render(<CreateDigestModal {...defaultProps} />);
    
    const input = screen.getByRole('textbox');
    const submitButton = screen.getByText('Submit');
    
    fireEvent.change(input, { target: { value: 'https://invalid-url.com' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Please enter a valid Claude.ai share link/)).toBeInTheDocument();
    });
  });

  it('should show loading state during submission', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ conversation: { id: 'test', messages: [] } }),
    } as Response);

    render(<CreateDigestModal {...defaultProps} />);
    
    const input = screen.getByRole('textbox');
    const submitButton = screen.getByText('Submit');
    
    fireEvent.change(input, { target: { value: 'https://claude.ai/share/test-id' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Creating digest/)).toBeInTheDocument();
    });
  });

  it('should call onClose when close button is clicked', () => {
    const mockOnClose = vi.fn();
    render(<CreateDigestModal {...defaultProps} onClose={mockOnClose} />);
    
    const closeButtons = screen.getAllByText('Close');
    const visibleCloseButton = closeButtons.find(button => 
      !button.className.includes('sr-only')
    );
    fireEvent.click(visibleCloseButton!);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should show loading prop state when isLoading is true', () => {
    render(<CreateDigestModal {...defaultProps} isLoading={true} />);
    
    expect(screen.getByText(/Loading/)).toBeInTheDocument();
  });
});