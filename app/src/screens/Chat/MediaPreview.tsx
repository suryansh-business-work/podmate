import React from 'react';
import { View, Image, TouchableOpacity, Modal } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Video, ResizeMode } from 'expo-av';
import { colors } from '../../theme';
import { pvStyles } from './Chat.styles';

interface MediaPreviewProps {
  visible: boolean;
  uri: string;
  type: 'IMAGE' | 'VIDEO';
  onClose: () => void;
}

const MediaPreview: React.FC<MediaPreviewProps> = ({ visible, uri, type, onClose }) => (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
    <View style={pvStyles.backdrop}>
      <TouchableOpacity style={pvStyles.closeBtn} onPress={onClose}>
        <MaterialIcons name="close" size={28} color={colors.white} />
      </TouchableOpacity>
      {type === 'IMAGE' ? (
        <Image source={{ uri }} style={pvStyles.fullImage} resizeMode="contain" />
      ) : (
        <Video source={{ uri }} style={pvStyles.fullImage} useNativeControls resizeMode={ResizeMode.CONTAIN} />
      )}
    </View>
  </Modal>
);

export default MediaPreview;
