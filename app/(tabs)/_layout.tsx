import { Tabs, type BottomTabBarButtonProps } from 'expo-router/js-tabs';
import { Bell, Compass, Home, User, Users, type LucideIcon } from 'lucide-react-native';
import { Pressable, StyleSheet, View, type ColorValue } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useUnreadCount } from '../../src/features/notifications/hooks/useUnreadCount';
import { useThemeColors } from '../../src/shared/hooks/useTheme';

const TAB_BAR_HEIGHT = 56;
const INACTIVE = '#737373'; // neutral-500
const ICON_SIZE = 24;

const tabIcon =
  (Icon: LucideIcon) =>
  ({ color, focused }: { color: ColorValue; focused: boolean }) => (
    <Icon size={ICON_SIZE} color={color as string} strokeWidth={focused ? 2.4 : 1.8} />
  );

/** Tab item with a 2px indicator strip pinned to its top edge while selected. */
function TabButton(props: BottomTabBarButtonProps) {
  const { isDark } = useThemeColors('app');
  const selected = props.accessibilityState?.selected === true;
  const { ref: _ref, ...pressableProps } = props;

  return (
    <Pressable {...pressableProps}>
      {selected ? (
        <View pointerEvents="none" style={styles.stripWrap}>
          <View style={[styles.strip, { backgroundColor: isDark ? '#FFFFFF' : '#000000' }]} />
        </View>
      ) : null}
      {props.children}
    </Pressable>
  );
}

export default function TabLayout() {
  const { isDark } = useThemeColors('app');
  const insets = useSafeAreaInsets();
  const unread = useUnreadCount();

  const background = isDark ? '#000000' : '#FFFFFF';
  const active = isDark ? '#FFFFFF' : '#000000';

  return (
    <Tabs
      screenOptions={{
        headerShown: false, // each screen renders its own top bar
        tabBarButton: TabButton,
        tabBarActiveTintColor: active,
        tabBarInactiveTintColor: INACTIVE,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarItemStyle: { height: TAB_BAR_HEIGHT, justifyContent: 'center' },
        tabBarStyle: {
          backgroundColor: background,
          borderTopColor: isDark ? '#262626' : '#E5E5E5',
          borderTopWidth: StyleSheet.hairlineWidth,
          height: TAB_BAR_HEIGHT + insets.bottom,
          paddingTop: 0,
          paddingBottom: insets.bottom,
          elevation: 0,
        },
      }}>
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: tabIcon(Home) }} />
      <Tabs.Screen name="following" options={{ title: 'Following', tabBarIcon: tabIcon(Users) }} />
      <Tabs.Screen name="discover" options={{ title: 'Discover', tabBarIcon: tabIcon(Compass) }} />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Alerts',
          tabBarIcon: tabIcon(Bell),
          tabBarBadge: unread > 0 ? (unread > 99 ? '99+' : unread) : undefined,
          tabBarBadgeStyle: { backgroundColor: active, color: background, fontSize: 10, fontWeight: '700' },
        }}
      />
      <Tabs.Screen name="profile" options={{ title: 'Me', tabBarIcon: tabIcon(User) }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  stripWrap: { position: 'absolute', top: 0, left: 0, right: 0, alignItems: 'center' },
  strip: { width: 32, height: 2, borderBottomLeftRadius: 2, borderBottomRightRadius: 2 },
});
