import { CreateSliderInput, UpdateSliderInput } from './slider.models';

export function validateCreateSlider(input: CreateSliderInput): string | null {
  if (!input.title || input.title.trim().length < 2) {
    return 'Title must be at least 2 characters.';
  }
  if (!input.imageUrl || input.imageUrl.trim().length === 0) {
    return 'Image URL is required.';
  }
  if (input.sortOrder !== undefined && input.sortOrder < 0) {
    return 'Sort order must be non-negative.';
  }
  return null;
}

export function validateUpdateSlider(input: UpdateSliderInput): string | null {
  if (input.title !== undefined && input.title.trim().length < 2) {
    return 'Title must be at least 2 characters.';
  }
  if (input.imageUrl !== undefined && input.imageUrl.trim().length === 0) {
    return 'Image URL cannot be empty.';
  }
  if (input.sortOrder !== undefined && input.sortOrder < 0) {
    return 'Sort order must be non-negative.';
  }
  return null;
}
