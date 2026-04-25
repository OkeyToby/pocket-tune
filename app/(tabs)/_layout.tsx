import { Tabs } from 'expo-router';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Colors } from '@/constants/Colors';

interface TabIconProps {
  icon: string;
  label: string;
  focused: boolean;
}

function TabIcon({ icon, label, focused }: TabIconProps) {
  return (
    <View style={styles.tabItem}>
      <Text style={[styles.tabIcon, focused && styles.tabIconFocused]}>{icon}</Text>
      <Text
        style={[
          styles.tabLabel,
          focused ? styles.tabLabelFocused : styles.tabLabelBlur,
        ]}
      >
        {label}
      </Text>
      {focused && <View style={styles.activeDot} />}
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarBackground: () => (
          Platform.OS === 'ios' ? (
            <BlurView
              intensity={80}
              tint="dark"
              style={StyleSheet.absoluteFill}
            />
          ) : (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: Colors.surface + 'f0' }]} />
          )
        ),
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="player"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="♫" label="Playing" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="◫" label="Library" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="converter"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="⬇" label="YT→MP3" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="tuner"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="♩" label="Tuner" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="⚙" label="Settings" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    height: 68,
    paddingBottom: 0,
    elevation: 0,
    backgroundColor: 'transparent',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
    width: 64,
    gap: 3,
  },
  tabIcon: {
    fontSize: 20,
    color: Colors.textDim,
  },
  tabIconFocused: {
    color: Colors.accent,
  },
  tabLabel: {
    fontSize: 9,
    fontFamily: 'Syne_400Regular',
    letterSpacing: 0.5,
  },
  tabLabelFocused: {
    color: Colors.accent,
    fontFamily: 'Syne_700Bold',
  },
  tabLabelBlur: {
    color: Colors.textDim,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.accent,
    position: 'absolute',
    bottom: -2,
  },
});
