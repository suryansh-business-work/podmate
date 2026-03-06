import React from 'react';
import { View, Text } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import { createStyles } from './RegisterPlace.styles';
import { STEPS } from './RegisterPlace.types';
import { useThemedStyles, useAppColors } from '../../hooks/useThemedStyles';

interface StepIndicatorProps {
  step: number;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ step }) => {
  const styles = useThemedStyles(createStyles);
  const colors = useAppColors();
  return (
    <View style={styles.stepIndicator}>
      {STEPS.map((label, i) => (
        <View key={label} style={styles.stepItem}>
          <View style={[styles.stepCircle, i <= step && styles.stepCircleActive]}>
            {i < step ? (
              <MaterialIcons name="check" size={14} color={colors.white} />
            ) : (
              <Text style={[styles.stepNum, i <= step && styles.stepNumActive]}>{i + 1}</Text>
            )}
          </View>
          <Text style={[styles.stepLabel, i <= step && styles.stepLabelActive]}>{label}</Text>
          {i < STEPS.length - 1 && (
            <View style={[styles.stepLine, i < step && styles.stepLineActive]} />
          )}
        </View>
      ))}
    </View>
  );
};

export default StepIndicator;
