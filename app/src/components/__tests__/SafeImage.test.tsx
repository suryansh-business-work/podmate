import React from 'react';
import { Image } from 'react-native';
import { render } from '@testing-library/react-native';
import SafeImage from '../SafeImage';

describe('SafeImage', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders an Image when uri is a valid non-empty string', () => {
    const { UNSAFE_getByType } = render(
      <SafeImage uri="https://example.com/photo.jpg" style={{ width: 100, height: 100 }} />,
    );
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
    const img = UNSAFE_getByType(Image as any);
    expect(img.props.source).toEqual({ uri: 'https://example.com/photo.jpg' });
  });

  it('renders fallback View with icon when uri is null', () => {
    const { getByLabelText } = render(
      <SafeImage uri={null} style={{ width: 100, height: 100 }} />,
    );
    expect(getByLabelText('Placeholder image')).toBeTruthy();
  });

  it('renders fallback View when uri is empty string', () => {
    const { getByLabelText } = render(
      <SafeImage uri="" style={{ width: 100, height: 100 }} />,
    );
    expect(getByLabelText('Placeholder image')).toBeTruthy();
  });

  it('renders fallback View when uri is undefined', () => {
    const { getByLabelText } = render(
      <SafeImage uri={undefined} style={{ width: 100, height: 100 }} />,
    );
    expect(getByLabelText('Placeholder image')).toBeTruthy();
  });

  it('renders fallback View when uri is whitespace only', () => {
    const { getByLabelText } = render(
      <SafeImage uri="   " style={{ width: 100, height: 100 }} />,
    );
    expect(getByLabelText('Placeholder image')).toBeTruthy();
  });

  it('renders custom fallback icon', () => {
    const { getByText } = render(
      <SafeImage uri="" fallbackIcon="celebration" style={{ width: 50, height: 50 }} />,
    );
    expect(getByText('celebration')).toBeTruthy();
  });

  it('uses default fallback icon "person" when not specified', () => {
    const { getByText } = render(
      <SafeImage uri="" style={{ width: 50, height: 50 }} />,
    );
    expect(getByText('person')).toBeTruthy();
  });

  it('applies resizeMode to Image', () => {
    const { UNSAFE_getByType } = render(
      <SafeImage uri="https://example.com/a.jpg" resizeMode="contain" style={{ width: 50, height: 50 }} />,
    );
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
    expect(UNSAFE_getByType(Image as any).props.resizeMode).toBe('contain');
  });

  it('defaults resizeMode to cover', () => {
    const { UNSAFE_getByType } = render(
      <SafeImage uri="https://example.com/a.jpg" style={{ width: 50, height: 50 }} />,
    );
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
    expect(UNSAFE_getByType(Image as any).props.resizeMode).toBe('cover');
  });
});
