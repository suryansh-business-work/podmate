import React, { useMemo } from 'react';
import { View, Image, TouchableOpacity, Modal } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useVideoPlayer, VideoView } from 'expo-video';
import { colors } from '../../theme';
import { pvStyles } from './Chat.styles';

interface MediaPreviewProps {
  visible: boolean;
  uri: string;
  type: 'IMAGE' | 'VIDEO';
  onClose: () => void;
}

const MediaPreview: React.FC<MediaPreviewProps> = ({ visible, uri, type, onClose }) => {
  const videoSource = useMemo(() => type === 'VIDEO' && uri ? { uri } : null, [type, uri]);
  const player = useVideoPlayer(videoSource, (p) => { p.play(); });

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={pvStyles.backdrop}>
        <TouchableOpacity style={pvStyles.closeBtn} onPress={onClose}>
          <MaterialIcons name="close" size={28} color={colors.white} />
        </TouchableOpacity>
        {type === 'IMAGE' ? (
          <Image source={{ uri }} style={pvStyles.fullImage} resizeMode="contain" />
        ) : player ? (
          <VideoView player={player} style={pvStyles.fullImage} nativeControls contentFit="contain" />
        ) : null}
      </View>
    </Modal>
  );
};

export default MediaPreview;
