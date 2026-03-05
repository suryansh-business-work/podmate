import React from 'react';
import { Image, View, type ImageStyle, type StyleProp, type ViewStyle } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useAppColors } from '../hooks/useThemedStyles';


interface SafeImageProps {
  uri: string | null | undefined;
  style?: StyleProp<ImageStyle>;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
  fallbackIcon?: string;
  fallbackIconSize?: number;
  fallbackStyle?: StyleProp<ViewStyle>;
}

/**
 * Renders an Image only when uri is a non-empty string.
 * Falls back to a neutral View with an optional icon to prevent
 * the "source.uri should not be an empty string" React Native warning.
 */
const SafeImage: React.FC<SafeImageProps> = ({
  uri,
  style,
  resizeMode = 'cover',
  fallbackIcon = 'person',
  fallbackIconSize = 24,
  fallbackStyle,
}) => {
  const colors = useAppColors();
  if (uri && uri.trim().length > 0) {
    return <Image source={{ uri }} style={style} resizeMode={resizeMode} />;
  }

  return (
    <View
      style={[
        style as ViewStyle,
        { backgroundColor: colors.surfaceVariant, justifyContent: 'center', alignItems: 'center' },
        fallbackStyle,
      ]}
    >
      <MaterialIcons name={fallbackIcon} size={fallbackIconSize} color={colors.textTertiary} />
    </View>
  );
};

export default SafeImage;
