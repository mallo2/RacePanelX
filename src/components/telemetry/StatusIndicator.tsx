import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { COLORS, SPACING } from "@/styles/theme";

interface StatusIndicatorProps {
  isUpdating: boolean;
  error?: string | null;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ isUpdating, error }) => {
  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorStatus}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </View>
    );
  }

  if (!isUpdating) return <View style={styles.container} />;

  return (
    <View style={styles.container}>
      <View style={styles.updateStatus}>
        <ActivityIndicator size="small" color={COLORS.primary} />
        <Text style={styles.statusText}>Mise à jour...</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 48,
    marginVertical: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  updateStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: SPACING.lg,
  },
  errorStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  statusText: {
    marginLeft: SPACING.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },
  errorText: {
    color: COLORS.error,
    fontWeight: '500',
    fontSize: SPACING.ms,
  },
});

export default React.memo(StatusIndicator);