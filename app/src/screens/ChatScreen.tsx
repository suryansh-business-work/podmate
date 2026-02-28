import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius } from '../theme';

const MOCK_CHATS = [
  {
    id: '1',
    name: 'Omakase & Sake Night',
    lastMessage: 'Chef Kenji: See you all on Saturday!',
    avatar: 'https://i.pravatar.cc/150?img=4',
    time: '2h',
    unread: 2,
  },
  {
    id: '2',
    name: 'Startup Networking Hike',
    lastMessage: "Alex: Don't forget sunscreen 🧴",
    avatar: 'https://i.pravatar.cc/150?img=2',
    time: '5h',
    unread: 0,
  },
  {
    id: '3',
    name: 'Premium Wine Tasting',
    lastMessage: 'You: What should we bring?',
    avatar: 'https://i.pravatar.cc/150?img=3',
    time: '1d',
    unread: 0,
  },
];

const ChatScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Messages</Text>
      <FlatList
        data={MOCK_CHATS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.chatRow} activeOpacity={0.7}>
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
            <View style={styles.chatInfo}>
              <View style={styles.chatTop}>
                <Text style={styles.chatName} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.chatTime}>{item.time}</Text>
              </View>
              <View style={styles.chatBottom}>
                <Text style={styles.chatMessage} numberOfLines={1}>
                  {item.lastMessage}
                </Text>
                {item.unread > 0 && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadText}>{item.unread}</Text>
                  </View>
                )}
              </View>
            </View>
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  header: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  list: { paddingHorizontal: spacing.xl },
  chatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  avatar: { width: 52, height: 52, borderRadius: 26 },
  chatInfo: { flex: 1 },
  chatTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  chatName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
    marginRight: spacing.sm,
  },
  chatTime: { fontSize: 12, color: colors.textTertiary },
  chatBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  chatMessage: { fontSize: 14, color: colors.textSecondary, flex: 1, marginRight: spacing.sm },
  unreadBadge: {
    backgroundColor: colors.primary,
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadText: { color: colors.white, fontSize: 11, fontWeight: '700' },
  separator: { height: 1, backgroundColor: colors.surfaceVariant },
});

export default ChatScreen;
