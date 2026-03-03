import React, { useMemo } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useVideoPlayer, VideoView } from 'expo-video';
import SafeImage from '../../components/SafeImage';
import { colors } from '../../theme';
import { ChatMessage } from './Chat.types';
import { styles } from './Chat.styles';

interface MessageBubbleProps {
  item: ChatMessage;
  isMe: boolean;
  onPreviewMedia: (uri: string, type: 'IMAGE' | 'VIDEO') => void;
}

const formatTime = (iso: string): string =>
  new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const MessageBubble: React.FC<MessageBubbleProps> = ({ item, isMe, onPreviewMedia }) => {
  const isMedia = item.messageType === 'IMAGE' || item.messageType === 'VIDEO';
  const videoSource = useMemo(() => item.messageType === 'VIDEO' && item.mediaUrl ? { uri: item.mediaUrl } : null, [item.messageType, item.mediaUrl]);
  const videoPlayer = useVideoPlayer(videoSource, (p) => { p.muted = true; });

  const renderMedia = () => {
    if (item.messageType === 'IMAGE' && item.mediaUrl) {
      return (
        <TouchableOpacity activeOpacity={0.85} onPress={() => onPreviewMedia(item.mediaUrl, 'IMAGE')}>
          <Image source={{ uri: item.mediaUrl }} style={styles.mediaThumbnail} resizeMode="cover" />
        </TouchableOpacity>
      );
    }
    if (item.messageType === 'VIDEO' && item.mediaUrl && videoPlayer) {
      return (
        <TouchableOpacity activeOpacity={0.85} onPress={() => onPreviewMedia(item.mediaUrl, 'VIDEO')} style={styles.videoThumbWrap}>
          <VideoView player={videoPlayer} style={styles.mediaThumbnail} nativeControls={false} contentFit="cover" />
          <View style={styles.playOverlay}>
            <MaterialIcons name="play-circle-fill" size={42} color="rgba(255,255,255,0.9)" />
          </View>
        </TouchableOpacity>
      );
    }
    return null;
  };

  return (
    <View style={[styles.msgRow, isMe && styles.msgRowMe]}>
      {!isMe && (
        item.sender?.avatar
          ? <SafeImage uri={item.sender.avatar} style={styles.msgAvatar} fallbackIcon="person" fallbackIconSize={14} />
          : (
            <View style={[styles.msgAvatar, { backgroundColor: colors.surfaceVariant, justifyContent: 'center', alignItems: 'center' }]}>
              <MaterialIcons name="person" size={16} color={colors.textTertiary} />
            </View>
          )
      )}
      <View style={[styles.msgBubble, isMe ? styles.msgBubbleMe : styles.msgBubbleOther, isMedia && styles.mediaBubble]}>
        {!isMe && <Text style={styles.msgSenderName}>{item.sender?.name ?? 'Unknown'}</Text>}
        {renderMedia()}
        {item.content ? <Text style={[styles.msgText, isMe && styles.msgTextMe]}>{item.content}</Text> : null}
        <Text style={[styles.msgTime, isMe && styles.msgTimeMe]}>{formatTime(item.createdAt)}</Text>
      </View>
    </View>
  );
};

export default MessageBubble;
