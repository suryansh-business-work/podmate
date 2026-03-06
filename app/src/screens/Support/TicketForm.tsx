import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Formik } from 'formik';

import { ticketSchema } from './Support.types';
import { createStyles } from './Support.styles';
import { useThemedStyles, useAppColors } from '../../hooks/useThemedStyles';

interface TicketFormProps {
  creating: boolean;
  onSubmit: (values: { subject: string; message: string }) => void;
}

const TicketForm: React.FC<TicketFormProps> = ({ creating, onSubmit }) => {
  const styles = useThemedStyles(createStyles);
  const colors = useAppColors();
  return (
    <View style={styles.formCard}>
      <Text style={styles.formTitle}>New Support Ticket</Text>
      <Formik
        initialValues={{ subject: '', message: '' }}
        validationSchema={ticketSchema}
        onSubmit={onSubmit}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isValid, dirty }) => (
          <>
            <Text style={styles.label}>Subject</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Brief description of your issue"
              placeholderTextColor={colors.textTertiary}
              value={values.subject}
              onChangeText={handleChange('subject')}
              onBlur={handleBlur('subject')}
              maxLength={200}
            />
            {touched.subject && errors.subject && (
              <Text style={styles.errorText}>{errors.subject}</Text>
            )}

            <Text style={styles.label}>Message</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="Describe your issue in detail..."
              placeholderTextColor={colors.textTertiary}
              value={values.message}
              onChangeText={handleChange('message')}
              onBlur={handleBlur('message')}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              maxLength={5000}
            />
            {touched.message && errors.message && (
              <Text style={styles.errorText}>{errors.message}</Text>
            )}

            <TouchableOpacity
              style={[
                styles.submitBtn,
                (!isValid || !dirty || creating) && styles.submitBtnDisabled,
              ]}
              onPress={() => handleSubmit()}
              disabled={!isValid || !dirty || creating}
            >
              {creating ? (
                <ActivityIndicator color={colors.white} size="small" />
              ) : (
                <Text style={styles.submitText}>Submit Ticket</Text>
              )}
            </TouchableOpacity>
          </>
        )}
      </Formik>
    </View>
  );
};

export default TicketForm;
