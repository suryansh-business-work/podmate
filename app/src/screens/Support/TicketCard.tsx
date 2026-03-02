import React from 'react';
import { View, Text } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../theme';
import { SupportTicket, STATUS_COLORS } from './Support.types';
import styles from './Support.styles';

interface TicketCardProps {
  ticket: SupportTicket;
}

const TicketCard: React.FC<TicketCardProps> = ({ ticket }) => (
  <View style={styles.ticketCard}>
    <View style={styles.ticketHeader}>
      <View style={styles.ticketTitleRow}>
        <Text style={styles.ticketSubject} numberOfLines={1}>{ticket.subject}</Text>
        <View style={[styles.statusBadge, { backgroundColor: (STATUS_COLORS[ticket.status] ?? colors.textTertiary) + '20' }]}>
          <Text style={[styles.statusText, { color: STATUS_COLORS[ticket.status] ?? colors.textTertiary }]}>
            {ticket.status.replace('_', ' ')}
          </Text>
        </View>
      </View>
      <Text style={styles.ticketDate}>
        {new Date(ticket.createdAt).toLocaleDateString()}
      </Text>
    </View>
    <Text style={styles.ticketMessage} numberOfLines={3}>{ticket.message}</Text>
    {ticket.adminReply ? (
      <View style={styles.replyBox}>
        <MaterialIcons name="support-agent" size={14} color={colors.primary} />
        <Text style={styles.replyText}>{ticket.adminReply}</Text>
      </View>
    ) : null}
  </View>
);

export default TicketCard;
