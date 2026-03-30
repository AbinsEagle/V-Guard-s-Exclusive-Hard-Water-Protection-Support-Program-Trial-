import { View, StyleSheet } from 'react-native';
import { Link, Stack } from 'expo-router';
import { AppText } from '../src/components/common';
import { colors, spacing } from '../src/theme';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Not Found' }} />
      <View style={styles.container}>
        <AppText variant="h2">This screen doesn't exist.</AppText>
        <Link href="/" style={styles.link}>
          <AppText variant="body" color={colors.primary}>
            Go to home screen
          </AppText>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  link: {
    marginTop: spacing.md,
  },
});
