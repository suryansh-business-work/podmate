import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation } from '@apollo/client';
import { MaterialIcons } from '@expo/vector-icons';

import { GET_ME } from '../../graphql/queries';
import { REQUEST_MEETING } from '../../graphql/mutations';
import StepEmail from './components/StepEmail';
import StepDateTime from './components/StepDateTime';
import { createStyles } from './RequestMeeting.styles';
import { useThemedStyles, useAppColors } from '../../hooks/useThemedStyles';

interface RequestMeetingScreenProps {
  onClose: () => void;
}

const STEPS = ['Email', 'Schedule'];

const StepIndicator: React.FC<{
  step: number;
  styles: ReturnType<typeof createStyles>;
}> = ({ step, styles }) => (
  <View style={styles.stepIndicator}>
    {STEPS.map((label, i) => (
      <View key={label} style={styles.stepItem}>
        {i > 0 && <View style={[styles.stepLine, i <= step && styles.stepLineActive]} />}
        <View style={[styles.stepCircle, i <= step && styles.stepCircleActive]}>
          <Text style={[styles.stepNum, i <= step && styles.stepNumActive]}>{i + 1}</Text>
        </View>
        <Text style={[styles.stepLabel, i <= step && styles.stepLabelActive]}>{label}</Text>
      </View>
    ))}
  </View>
);

const RequestMeetingScreen: React.FC<RequestMeetingScreenProps> = ({ onClose }) => {
  const styles = useThemedStyles(createStyles);
  const colors = useAppColors();
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState('');
  const [updateProfileEmail, setUpdateProfileEmail] = useState(false);
  const [meetingDate, setMeetingDate] = useState('');
  const [meetingTime, setMeetingTime] = useState('');
  const [success, setSuccess] = useState(false);

  const { data: meData } = useQuery(GET_ME, { fetchPolicy: 'cache-first' });
  const me = meData?.me;

  const [requestMeeting, { loading: submitting }] = useMutation(REQUEST_MEETING);

  // Pre-fill email from profile
  React.useEffect(() => {
    if (me?.email && email === '') {
      setEmail(me.email);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me?.email]);

  const handleEmailVerified = useCallback((verifiedEmail: string) => {
    setEmail(verifiedEmail);
  }, []);

  const handleSubmit = useCallback(async () => {
    try {
      await requestMeeting({
        variables: {
          input: {
            email: email.trim(),
            meetingDate,
            meetingTime,
            updateProfileEmail,
          },
        },
      });
      setSuccess(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to request meeting';
      Alert.alert('Error', message);
    }
  }, [email, meetingDate, meetingTime, updateProfileEmail, requestMeeting]);

  const goBack = () => {
    if (success) {
      onClose();
    } else if (step > 0) {
      setStep(step - 1);
    } else {
      onClose();
    }
  };

  if (success) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.headerBtn}>
            <MaterialIcons name="close" size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Meeting Requested</Text>
          <View style={styles.headerBtn} />
        </View>
        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <MaterialIcons name="check-circle" size={72} color={colors.primary} />
          </View>
          <Text style={styles.successTitle}>Request Submitted!</Text>
          <Text style={styles.successSubtitle}>
            Your 1:1 meeting request has been submitted. You will receive a Zoom meeting invite at{' '}
            {email} once confirmed by our team.
          </Text>
        </View>
        <View style={styles.btnContainer}>
          <TouchableOpacity style={styles.submitBtn} onPress={onClose}>
            <Text style={styles.submitBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'web' ? undefined : Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={{ flex: 1 }}>
          <View style={styles.header}>
            <TouchableOpacity onPress={goBack} style={styles.headerBtn}>
              <MaterialIcons name="arrow-back" size={22} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Request Meeting</Text>
            <View style={styles.headerBtn} />
          </View>

          <StepIndicator step={step} styles={styles} />

          {step === 0 && (
            <StepEmail
              userEmail={me?.email ?? ''}
              isEmailVerified={me?.isEmailVerified ?? false}
              email={email}
              updateProfileEmail={updateProfileEmail}
              onEmailChange={setEmail}
              onUpdateProfileChange={setUpdateProfileEmail}
              onEmailVerified={handleEmailVerified}
              onContinue={() => setStep(1)}
            />
          )}

          {step === 1 && (
            <>
              <StepDateTime
                selectedDate={meetingDate}
                selectedTime={meetingTime}
                onDateChange={setMeetingDate}
                onTimeChange={setMeetingTime}
                onContinue={handleSubmit}
              />
              {submitting && (
                <View
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: 'rgba(255,255,255,0.7)',
                  }}
                >
                  <ActivityIndicator size="large" color={colors.primary} />
                </View>
              )}
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default RequestMeetingScreen;
