import React from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Colors } from '@/constants/Colors';
import { ThemedText } from '@/components/ui/ThemedText';

const { width } = Dimensions.get('window');
const ART_SIZE = width * 0.78;

interface AlbumArtProps {
  uri?: string | null;
  title?: string;
  artist?: string;
  isPlaying: boolean;
}

export function AlbumArt({ uri, title, artist, isPlaying }: AlbumArtProps) {
  const scale = useSharedValue(isPlaying ? 1 : 0.9);

  React.useEffect(() => {
    scale.value = withSpring(isPlaying ? 1 : 0.9, {
      damping: 12,
      stiffness: 100,
    });
  }, [isPlaying]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.container, animStyle]}>
      {uri ? (
        <Image source={{ uri }} style={styles.art} resizeMode="cover" />
      ) : (
        <LinearGradient
          colors={[Colors.accent2, Colors.surface, Colors.bg]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.placeholder}
        >
          <View style={styles.vinylCenter}>
            <View style={styles.vinylRing}>
              <View style={styles.vinylHole} />
            </View>
            <View style={styles.artTextContainer}>
              {title ? (
                <ThemedText variant="h3" style={styles.artTitle} numberOfLines={2}>
                  {title}
                </ThemedText>
              ) : null}
              {artist ? (
                <ThemedText variant="caption" style={styles.artArtist}>
                  {artist}
                </ThemedText>
              ) : null}
            </View>
          </View>
        </LinearGradient>
      )}
      {/* Vinyl shine overlay */}
      <LinearGradient
        colors={['rgba(255,255,255,0.06)', 'transparent', 'rgba(0,0,0,0.3)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: ART_SIZE,
    height: ART_SIZE,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: Colors.accent2,
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.5,
    shadowRadius: 40,
    elevation: 20,
    alignSelf: 'center',
  },
  art: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vinylCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  vinylRing: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.4,
  },
  vinylHole: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.bg,
  },
  artTextContainer: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  artTitle: {
    textAlign: 'center',
    color: Colors.text,
    marginBottom: 4,
  },
  artArtist: {
    textAlign: 'center',
    color: Colors.accent,
  },
});
