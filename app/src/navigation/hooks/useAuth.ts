import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMutation, useApolloClient } from '@apollo/client';
import { Alert } from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { SEND_OTP, VERIFY_OTP, COMPLETE_PROFILE, GOOGLE_SIGN_IN } from '../../graphql/mutations';

interface AuthState {
  isLoading: boolean;
  isAuthenticated: boolean;
  showSplash: boolean;
  otpPhone: string;
  isNewUser: boolean;
  sendingOtp: boolean;
  verifyingOtp: boolean;
  otpError: string;
  googleSignInLoading: boolean;
}

export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    isLoading: true,
    isAuthenticated: false,
    showSplash: true,
    otpPhone: '',
    isNewUser: false,
    sendingOtp: false,
    verifyingOtp: false,
    otpError: '',
    googleSignInLoading: false,
  });

  const apolloClient = useApolloClient();
  const [sendOtpMutation] = useMutation(SEND_OTP);
  const [verifyOtpMutation] = useMutation(VERIFY_OTP);
  const [completeProfileMutation] = useMutation(COMPLETE_PROFILE);
  const [googleSignInMutation] = useMutation(GOOGLE_SIGN_IN);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        setState((prev) => ({ ...prev, isAuthenticated: !!token, isLoading: false }));
      } catch {
        setState((prev) => ({ ...prev, isAuthenticated: false, isLoading: false }));
      }
    };
    checkAuth();
  }, []);

  const handleSplashFinish = () => setState((prev) => ({ ...prev, showSplash: false }));

  const handleSendOtp = async (phone: string) => {
    setState((prev) => ({ ...prev, sendingOtp: true, otpError: '' }));
    try {
      await sendOtpMutation({ variables: { phone } });
      setState((prev) => ({ ...prev, otpPhone: phone, sendingOtp: false }));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to send OTP. Please try again.';
      Alert.alert('Error', message);
      setState((prev) => ({ ...prev, sendingOtp: false }));
    }
  };

  const handleVerifyOtp = async (otp: string) => {
    setState((prev) => ({ ...prev, verifyingOtp: true, otpError: '' }));
    try {
      const { data } = await verifyOtpMutation({ variables: { phone: state.otpPhone, otp } });
      if (data?.verifyOtp?.token) {
        await AsyncStorage.setItem('token', data.verifyOtp.token);
        setState((prev) => ({
          ...prev,
          isAuthenticated: true,
          isNewUser: !!data.verifyOtp.isNewUser,
          otpPhone: '',
          verifyingOtp: false,
        }));
      } else {
        setState((prev) => ({
          ...prev,
          otpError: 'Verification failed. Please try again.',
          verifyingOtp: false,
        }));
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Verification failed. Please try again.';
      setState((prev) => ({ ...prev, otpError: message, verifyingOtp: false }));
    }
  };

  const handleResendOtp = async () => {
    setState((prev) => ({ ...prev, otpError: '' }));
    try {
      await sendOtpMutation({ variables: { phone: state.otpPhone } });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to resend OTP.';
      setState((prev) => ({ ...prev, otpError: message }));
    }
  };

  const handleGoogleSignIn = async () => {
    setState((prev) => ({ ...prev, googleSignInLoading: true, otpError: '' }));
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const response = await GoogleSignin.signIn();
      const idToken = response.data?.idToken;
      if (!idToken) {
        throw new Error('Google Sign-In did not return an ID token.');
      }
      const { data } = await googleSignInMutation({ variables: { idToken } });
      if (data?.googleSignIn?.token) {
        await AsyncStorage.setItem('token', data.googleSignIn.token);
        setState((prev) => ({
          ...prev,
          isAuthenticated: true,
          isNewUser: !!data.googleSignIn.isNewUser,
          googleSignInLoading: false,
        }));
      } else {
        throw new Error('Google Sign-In failed. Please try again.');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Google Sign-In failed.';
      Alert.alert('Google Sign-In Error', message);
      setState((prev) => ({ ...prev, googleSignInLoading: false }));
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    await apolloClient.clearStore();
    setState((prev) => ({ ...prev, isAuthenticated: false, otpPhone: '' }));
  };

  const handleCompleteProfile = async (username: string, name: string, dob: string) => {
    try {
      await completeProfileMutation({ variables: { username, name, dob } });
    } catch {
      // Profile save failed — continue anyway
    }
    setState((prev) => ({ ...prev, isNewUser: false }));
  };

  const clearOtp = () => setState((prev) => ({ ...prev, otpPhone: '', otpError: '' }));

  return {
    ...state,
    handleSplashFinish,
    handleSendOtp,
    handleVerifyOtp,
    handleResendOtp,
    handleGoogleSignIn,
    handleLogout,
    handleCompleteProfile,
    clearOtp,
  };
};
