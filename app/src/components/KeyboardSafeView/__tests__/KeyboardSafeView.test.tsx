import React from 'react';
import { Text } from 'react-native';
import { render } from '@testing-library/react-native';
import KeyboardSafeView from '../KeyboardSafeView';

describe('KeyboardSafeView', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders children', () => {
    const { getByText } = render(
      <KeyboardSafeView>
        <Text>Hello World</Text>
      </KeyboardSafeView>,
    );
    expect(getByText('Hello World')).toBeTruthy();
  });

  it('renders without crashing with no extra props', () => {
    const { toJSON } = render(
      <KeyboardSafeView>
        <Text>Content</Text>
      </KeyboardSafeView>,
    );
    expect(toJSON()).toBeTruthy();
  });

  it('accepts custom style', () => {
    const { toJSON } = render(
      <KeyboardSafeView style={{ backgroundColor: 'red' }}>
        <Text>Styled</Text>
      </KeyboardSafeView>,
    );
    expect(toJSON()).toBeTruthy();
  });

  it('accepts keyboardVerticalOffset', () => {
    const { toJSON } = render(
      <KeyboardSafeView keyboardVerticalOffset={100}>
        <Text>Offset</Text>
      </KeyboardSafeView>,
    );
    expect(toJSON()).toBeTruthy();
  });

  it('renders multiple children', () => {
    const { getByText } = render(
      <KeyboardSafeView>
        <Text>First</Text>
        <Text>Second</Text>
      </KeyboardSafeView>,
    );
    expect(getByText('First')).toBeTruthy();
    expect(getByText('Second')).toBeTruthy();
  });
});
