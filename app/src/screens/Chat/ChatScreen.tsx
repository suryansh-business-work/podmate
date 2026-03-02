import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@apollo/client';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../theme';
import { GET_MY_PODS } from '../../graphql/queries';
import { Pod } from './Chat.types';
import { styles } from './Chat.styles';
import ChatRoom from './ChatRoom';

const ChatScreen: React.FC = () => {
  const [selectedPod, setSelectedPod] = useState<Pod | null>(null);
  const { data, loading, error, refetch } = useQuery<{ myPods: Pod[] }>(GET_MY_PODS, { fetchPolicy: 'cache-and-network' });

  const [refreshing, setRefreshing] = useState(false);
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  if (selectedPod) {
    return <ChatRoom pod={selectedPod} onBack={() => setSelectedPod(null)} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Messages</Text>
      {loading && !data && (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}
      {!loading && error && (
        <View style={styles.centered}>
          <MaterialIcons name="cloud-off" size={48} color={colors.error} />
          <Text style={styles.emptyTitle}>Failed to load chats</Text>
          <Text style={styles.emptySubtitle}>{error.message}</Text>
        </View>
      )}
      {data?.myPods && data.myPods.length === 0 && (
        <View style={styles.centered}>
          <MaterialIcons name="chat-bubble-outline" size={48} color={colors.textTertiary} />
          <Text style={styles.emptyTitle}>No conversations yet</Text>
          <Text style={styles.emptySubtitle}>Join a pod to start chatting with other attendees</Text>
        </View>
      )}
      <FlatList
        data={data?.myPods ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.chatRow} activeOpacity={0.7} onPress={() => setSelectedPod(item)}>
            {item.imageUrl ? (
              <Image source={{ uri: item.imageUrl }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, { backgroundColor: colors.surfaceVariant, justifyContent: 'center', alignItems: 'center' }]}>
                <MaterialIcons name="groups" size={24} color={colors.textTertiary} />
              </View>
            )}
            <View style={styles.chatInfo}>
              <Text style={styles.chatName} numberOfLines={1}>{item.title}</Text>
              <View style={styles.metaRow}>
                <View style={[styles.statusDot, { backgroundColor: item.status === 'ACTIVE' ? colors.success : colors.textTertiary }]} />
                <Text style={styles.chatMessage}>{item.category}</Text>
              </View>
            </View>
            <MaterialIcons name="chevron-right" size={22} color={colors.textTertiary} />
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
};

export default ChatScreen;
