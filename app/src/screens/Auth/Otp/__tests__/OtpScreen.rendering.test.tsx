import { fireEvent, waitFor } from '@testing-library/react-native';
import { renderOtpScreen } from './OtpScreen.setup';

describe('OtpScreen - Rendering', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render OTP screen container', () => {
    const { getByTestId } = renderOtpScreen();
    expect(getByTestId('otp-screen')).toBeTruthy();
  });

  it('should render OTP input container', () => {
    const { getByTestId } = renderOtpScreen();
    expect(getByTestId('otp-input-container')).toBeTruthy();
  });

  it('should render OTP input fields', () => {
    const { getByTestId } = renderOtpScreen();
    expect(getByTestId('otp-input')).toBeTruthy();
  });

  it('should render verify OTP button', () => {
    const { getByTestId } = renderOtpScreen();
    expect(getByTestId('verify-otp-button')).toBeTruthy();
  });

  it('should render back button', () => {
    const { getByTestId } = renderOtpScreen();
    expect(getByTestId('back-button')).toBeTruthy();
  });

  it('should display title "Verify your number"', () => {
    const { getByTestId, getByText } = renderOtpScreen();
    expect(getByTestId('otp-title')).toBeTruthy();
    expect(getByText('Verify your number')).toBeTruthy();
  });

  it('should display subtitle with code sent message', () => {
    const { getByText } = renderOtpScreen();
    expect(getByText(/We sent a 6-digit code to/)).toBeTruthy();
  });

  it('should display masked phone number', () => {
    const { getByTestId } = renderOtpScreen({ phone: '+919876543210' });
    const maskedPhone = getByTestId('masked-phone');
    expect(maskedPhone).toBeTruthy();
  });

  it('should display Verify button text when not loading', () => {
    const { getByText } = renderOtpScreen({ loading: false });
    expect(getByText('Verify')).toBeTruthy();
  });

  it('should display loading indicator when loading', () => {
    const { getByTestId } = renderOtpScreen({ loading: true });
    expect(getByTestId('otp-loading-indicator')).toBeTruthy();
  });
});

describe('OtpScreen - OTP Validation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should validate empty OTP - verify button should be disabled', () => {
    const { getByTestId } = renderOtpScreen();
    const verifyButton = getByTestId('verify-otp-button');
    expect(verifyButton.props.accessibilityState?.disabled).toBe(true);
  });

  it('should call verify OTP API when 6 digits are entered', async () => {
    const mockOnVerify = jest.fn();
    const { getByTestId } = renderOtpScreen({ onVerify: mockOnVerify });
    const otpInputField = getByTestId('otp-input-field');

    fireEvent.changeText(otpInputField, '123456');

    await waitFor(() => {
      expect(mockOnVerify).toHaveBeenCalledWith('123456');
    });
  });

  it('should auto-submit when all 6 digits are entered', async () => {
    const mockOnVerify = jest.fn();
    const { getByTestId } = renderOtpScreen({ onVerify: mockOnVerify });
    const otpInputField = getByTestId('otp-input-field');

    fireEvent.changeText(otpInputField, '654321');

    await waitFor(() => {
      expect(mockOnVerify).toHaveBeenCalledWith('654321');
    });
  });
});

describe('OtpScreen - Verify Button Behavior', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should disable verify button while API request is loading', () => {
    const { getByTestId } = renderOtpScreen({ loading: true });
    const verifyButton = getByTestId('verify-otp-button');
    expect(verifyButton.props.accessibilityState?.disabled).toBe(true);
  });

  it('should call onVerify when verify button is pressed with valid OTP', async () => {
    const mockOnVerify = jest.fn();
    const { getByTestId } = renderOtpScreen({ onVerify: mockOnVerify });
    const otpInputField = getByTestId('otp-input-field');

    fireEvent.changeText(otpInputField, '123456');

    await waitFor(() => {
      expect(mockOnVerify).toHaveBeenCalled();
    });
  });
});
