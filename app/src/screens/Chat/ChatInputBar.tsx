import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../theme';
import { ChatInputBarProps } from './Chat.types';
import { styles } from './Chat.styles';

const ChatInputBar: React.FC<ChatInputBarProps> = ({
  value,
  sending,
  uploading,
  onChangeText,
  onSend,
  onSendImage,
  onSendVideo,
}) => {
  const [showAttach, setShowAttach] = useState(false);
  const canSend = value.trim().length > 0 && !sending;

  const handleSendImage = () => {
    setShowAttach(false);
    onSendImage();
  };

  const handleSendVideo = () => {
    setShowAttach(false);
    onSendVideo();
  };

  return (
    <View style={styles.inputBarOuter}>
      {uploading && (
        <View style={styles.uploadingBar}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      )}

      {showAttach && (
        <View style={styles.attachRow}>
          <TouchableOpacity style={styles.attachOption} onPress={handleSendImage}>
            <View style={[styles.attachCircle, { backgroundColor: colors.primary + '15' }]}>
              <MaterialIcons name="image" size={22} color={colors.primary} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.attachOption} onPress={handleSendVideo}>
            <View style={[styles.attachCircle, { backgroundColor: colors.secondary + '15' }]}>
              <MaterialIcons name="videocam" size={22} color={colors.secondary} />
            </View>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.inputBar}>
        <TouchableOpacity
          onPress={() => setShowAttach(!showAttach)}
          style={styles.attachBtn}
        >
          <MaterialIcons
            name={showAttach ? 'close' : 'add'}
            size={24}
            color={showAttach ? colors.primary : colors.textSecondary}
          />
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder="Type a message…"
          placeholderTextColor={colors.textTertiary}
          value={value}
          onChangeText={onChangeText}
          multiline
          maxLength={2000}
          textAlignVertical="center"
        />

        <TouchableOpacity
          onPress={onSend}
          disabled={!canSend}
          style={[styles.sendBtn, !canSend && styles.sendBtnDisabled]}
        >
          <MaterialIcons name="send" size={18} color={colors.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ChatInputBar;
