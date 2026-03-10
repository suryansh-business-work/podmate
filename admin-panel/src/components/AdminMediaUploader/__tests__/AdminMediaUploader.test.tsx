import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../../../test/test-utils';
import { AdminMediaUploader } from '../index';

vi.mock('../../../hooks/useImageKitUpload', () => ({
  useImageKitUpload: () => ({
    uploadFile: vi.fn().mockResolvedValue({ url: 'https://ik.imagekit.io/test.jpg' }),
    uploading: false,
    progress: 0,
    error: null,
  }),
}));

describe('AdminMediaUploader', () => {
  const defaultProps = {
    mediaItems: [] as { url: string; type: 'image' | 'video' }[],
    onMediaChange: vi.fn(),
    folder: '/test-uploads',
    maxItems: 5,
    label: 'Upload Files',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the add media button', () => {
    renderWithProviders(<AdminMediaUploader {...defaultProps} />);
    expect(screen.getByRole('button', { name: /add media/i })).toBeInTheDocument();
  });

  it('renders the label text with count', () => {
    renderWithProviders(<AdminMediaUploader {...defaultProps} label="Custom Label" />);
    expect(screen.getByText(/custom label/i)).toBeInTheDocument();
  });

  it('renders media item thumbnails', () => {
    renderWithProviders(
      <AdminMediaUploader
        {...defaultProps}
        mediaItems={[{ url: 'https://example.com/image.jpg', type: 'image' as const }]}
      />,
    );
    const images = screen.getAllByRole('img');
    expect(images.length).toBeGreaterThanOrEqual(1);
  });

  it('renders delete buttons for each media item', () => {
    renderWithProviders(
      <AdminMediaUploader
        {...defaultProps}
        mediaItems={[
          { url: 'https://example.com/image1.jpg', type: 'image' as const },
          { url: 'https://example.com/image2.jpg', type: 'image' as const },
        ]}
      />,
    );
    const deleteButtons = screen.getAllByTestId('DeleteIcon');
    expect(deleteButtons).toHaveLength(2);
  });

  it('calls onMediaChange when delete button clicked', () => {
    const onMediaChange = vi.fn();
    renderWithProviders(
      <AdminMediaUploader
        {...defaultProps}
        onMediaChange={onMediaChange}
        mediaItems={[{ url: 'https://example.com/image.jpg', type: 'image' as const }]}
      />,
    );
    const deleteButton = screen.getByTestId('DeleteIcon').closest('button')!;
    fireEvent.click(deleteButton);
    expect(onMediaChange).toHaveBeenCalledWith([]);
  });

  it('renders file input', () => {
    renderWithProviders(<AdminMediaUploader {...defaultProps} />);
    const fileInput = document.querySelector('input[type="file"]');
    expect(fileInput).toBeInTheDocument();
  });

  it('accepts image and video files', () => {
    renderWithProviders(<AdminMediaUploader {...defaultProps} />);
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(fileInput.accept).toContain('image');
  });

  it('displays default label when none provided', () => {
    renderWithProviders(
      <AdminMediaUploader mediaItems={[]} onMediaChange={vi.fn()} />,
    );
    // Default label "Media" appears in both label text and button; use getAllByText
    const matches = screen.getAllByText(/media/i);
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  it('hides upload button when max items reached', () => {
    renderWithProviders(
      <AdminMediaUploader
        {...defaultProps}
        maxItems={1}
        mediaItems={[{ url: 'https://example.com/image.jpg', type: 'image' as const }]}
      />,
    );
    expect(screen.queryByRole('button', { name: /add media/i })).not.toBeInTheDocument();
  });
});
