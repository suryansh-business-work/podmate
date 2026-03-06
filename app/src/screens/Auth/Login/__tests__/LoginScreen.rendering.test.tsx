import { renderLoginScreen } from './LoginScreen.setup';

describe('LoginScreen - Rendering', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render phone number input field', () => {
    const { getByTestId } = renderLoginScreen();
    expect(getByTestId('phone-input')).toBeTruthy();
  });

  it('should render send OTP button', () => {
    const { getByTestId } = renderLoginScreen();
    expect(getByTestId('send-otp-button')).toBeTruthy();
  });

  it('should render login screen container', () => {
    const { getByTestId } = renderLoginScreen();
    expect(getByTestId('login-screen')).toBeTruthy();
  });

  it('should render country code button', () => {
    const { getByTestId } = renderLoginScreen();
    expect(getByTestId('country-code-button')).toBeTruthy();
  });

  it('should display default country code +91', () => {
    const { getByText } = renderLoginScreen();
    expect(getByText('+91')).toBeTruthy();
  });

  it('should display welcome title', () => {
    const { getByText } = renderLoginScreen();
    expect(getByText('Welcome to PartyWings')).toBeTruthy();
  });

  it('should display subtitle with instructions', () => {
    const { getByText } = renderLoginScreen();
    expect(getByText('Enter your phone number to join or create your Pod.')).toBeTruthy();
  });

  it('should display phone number label', () => {
    const { getByText } = renderLoginScreen();
    expect(getByText('PHONE NUMBER')).toBeTruthy();
  });

  it('should display secure login badge', () => {
    const { getByText } = renderLoginScreen();
    expect(getByText('Secure, passwordless login')).toBeTruthy();
  });

  it('should display Terms of Service link', () => {
    const { getByText } = renderLoginScreen();
    expect(getByText('Terms of Service')).toBeTruthy();
  });

  it('should display Privacy Policy link', () => {
    const { getByText } = renderLoginScreen();
    expect(getByText('Privacy Policy')).toBeTruthy();
  });

  it('should display Venue Policy link', () => {
    const { getByText } = renderLoginScreen();
    expect(getByText('Venue Policy')).toBeTruthy();
  });

  it('should display Host Policy link', () => {
    const { getByText } = renderLoginScreen();
    expect(getByText('Host Policy')).toBeTruthy();
  });
});

describe('LoginScreen - Accessibility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should have accessibility label on phone input', () => {
    const { getByTestId } = renderLoginScreen();
    const phoneInput = getByTestId('phone-input');
    expect(phoneInput.props.accessibilityLabel).toBe('Phone number input');
  });

  it('should have placeholder text for phone input', () => {
    const { getByTestId } = renderLoginScreen();
    const phoneInput = getByTestId('phone-input');
    expect(phoneInput.props.placeholder).toBe('555 000-0000');
  });

  it('should have phone-pad keyboard type', () => {
    const { getByTestId } = renderLoginScreen();
    const phoneInput = getByTestId('phone-input');
    expect(phoneInput.props.keyboardType).toBe('phone-pad');
  });

  it('should have max length of 10 for phone input', () => {
    const { getByTestId } = renderLoginScreen();
    const phoneInput = getByTestId('phone-input');
    expect(phoneInput.props.maxLength).toBe(10);
  });
});
