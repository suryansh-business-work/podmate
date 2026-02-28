import type { CreatePodInput, UpdatePodInput } from './pod.models';

export function validateCreatePod(input: CreatePodInput): void {
  if (!input.title || input.title.trim().length === 0) {
    throw new Error('Title is required');
  }
  if (input.title.length > 200) {
    throw new Error('Title must be less than 200 characters');
  }
  if (!input.description || input.description.trim().length === 0) {
    throw new Error('Description is required');
  }
  if (!input.category) {
    throw new Error('Category is required');
  }
  if (input.feePerPerson < 0) {
    throw new Error('Fee per person must be non-negative');
  }
  if (input.maxSeats < 1) {
    throw new Error('Maximum seats must be at least 1');
  }
  if (!input.dateTime) {
    throw new Error('Date and time is required');
  }
  if (new Date(input.dateTime) <= new Date()) {
    throw new Error('Event date must be in the future');
  }
  if (!input.location || input.location.trim().length === 0) {
    throw new Error('Location is required');
  }
  if (!input.locationDetail || input.locationDetail.trim().length === 0) {
    throw new Error('Location detail is required');
  }
}

export function validateUpdatePod(input: UpdatePodInput): void {
  if (input.title !== undefined && input.title.trim().length === 0) {
    throw new Error('Title cannot be empty');
  }
  if (input.title !== undefined && input.title.length > 200) {
    throw new Error('Title must be less than 200 characters');
  }
  if (input.feePerPerson !== undefined && input.feePerPerson < 0) {
    throw new Error('Fee per person must be non-negative');
  }
  if (input.maxSeats !== undefined && input.maxSeats < 1) {
    throw new Error('Maximum seats must be at least 1');
  }
  if (input.dateTime !== undefined && new Date(input.dateTime) <= new Date()) {
    throw new Error('Event date must be in the future');
  }
}
