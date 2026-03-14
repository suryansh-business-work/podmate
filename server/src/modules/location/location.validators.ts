import { CreateCityInput, UpdateCityInput, CreateAreaInput } from './location.models';

export function validateCreateCity(input: CreateCityInput): string | null {
  if (!input.name || input.name.trim().length < 2) {
    return 'City name must be at least 2 characters.';
  }
  return null;
}

export function validateUpdateCity(input: UpdateCityInput): string | null {
  if (input.name !== undefined && input.name.trim().length < 2) {
    return 'City name must be at least 2 characters.';
  }
  if (input.clubCount !== undefined && input.clubCount < 0) {
    return 'Club count must be non-negative.';
  }
  return null;
}

export function validateCreateArea(input: CreateAreaInput): string | null {
  if (!input.name || input.name.trim().length < 2) {
    return 'Area name must be at least 2 characters.';
  }
  if (!input.cityId) {
    return 'City ID is required.';
  }
  return null;
}
