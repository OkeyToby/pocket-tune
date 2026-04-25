import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { Colors } from '@/constants/Colors';
import { ThemedText } from '@/components/ui/ThemedText';
import { ConversionStatus } from '@/store/converterStore';

interface Step {
  id: ConversionStatus;
  label: string;
  icon: string;
}

const STEPS: Step[] = [
  { id: 'fetching_info', label: 'Fetching Info', icon: '🔍' },
  { id: 'converting', label: 'Converting', icon: '⚙️' },
  { id: 'saving', label: 'Saving to Library', icon: '💾' },
  { id: 'done', label: 'Complete!', icon: '✅' },
];

const STATUS_ORDER: ConversionStatus[] = ['fetching_info', 'converting', 'saving', 'done'];

interface ProgressStepsProps {
  status: ConversionStatus;
  progress: number;
}

export function ProgressSteps({ status, progress }: ProgressStepsProps) {
  if (status === 'idle' || status === 'error') return null;

  const currentStepIndex = STATUS_ORDER.indexOf(status);

  return (
    <View style={styles.container}>
      {STEPS.map((step, i) => {
        const isDone = i < currentStepIndex;
        const isActive = i === currentStepIndex;
        const isPending = i > currentStepIndex;

        return (
          <StepRow
            key={step.id}
            step={step}
            isDone={isDone}
            isActive={isActive}
            isPending={isPending}
            progress={isActive ? progress : isDone ? 100 : 0}
            isLast={i === STEPS.length - 1}
          />
        );
      })}
    </View>
  );
}

function StepRow({
  step,
  isDone,
  isActive,
  isPending,
  progress,
  isLast,
}: {
  step: Step;
  isDone: boolean;
  isActive: boolean;
  isPending: boolean;
  progress: number;
  isLast: boolean;
}) {
  const spinValue = useSharedValue(0);
  const progressWidth = useSharedValue(0);

  useEffect(() => {
    if (isActive) {
      spinValue.value = withRepeat(withTiming(1, { duration: 1000, easing: Easing.linear }), -1);
      progressWidth.value = withTiming(progress, { duration: 400 });
    } else if (isDone) {
      spinValue.value = 0;
      progressWidth.value = withTiming(100, { duration: 300 });
    } else {
      progressWidth.value = 0;
    }
  }, [isActive, isDone, progress]);

  const spinStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spinValue.value * 360}deg` }],
  }));

  const barStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  const iconColor = isDone ? Colors.accent3 : isActive ? Colors.accent : Colors.textDim;

  return (
    <View style={styles.stepRow}>
      {/* Connector line */}
      {!isLast && (
        <View style={styles.connectorContainer}>
          <View style={styles.connectorLine} />
          {isDone && <View style={[styles.connectorLine, styles.connectorFilled]} />}
        </View>
      )}

      <View style={styles.stepLeft}>
        <View style={[styles.iconContainer, isDone && styles.iconDone, isActive && styles.iconActive]}>
          {isActive ? (
            <Animated.Text style={[{ fontSize: 16 }, spinStyle]}>{step.icon}</Animated.Text>
          ) : (
            <ThemedText style={{ fontSize: 16 }}>{isDone ? '✓' : step.icon}</ThemedText>
          )}
        </View>
      </View>

      <View style={styles.stepContent}>
        <ThemedText
          variant="body"
          style={[
            styles.stepLabel,
            isPending && { color: Colors.textDim },
            isDone && { color: Colors.accent3 },
            isActive && { color: Colors.text },
          ]}
        >
          {step.label}
        </ThemedText>

        {isActive && (
          <View style={styles.progressTrack}>
            <Animated.View style={[styles.progressBar, barStyle]} />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 0,
    paddingVertical: 8,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
  },
  stepLeft: {
    width: 40,
    alignItems: 'center',
    zIndex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconDone: {
    backgroundColor: Colors.accent3 + '22',
    borderColor: Colors.accent3,
  },
  iconActive: {
    backgroundColor: Colors.accent + '22',
    borderColor: Colors.accent,
  },
  connectorContainer: {
    position: 'absolute',
    left: 19,
    top: 44,
    width: 2,
    height: 24,
    overflow: 'hidden',
  },
  connectorLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.border,
  },
  connectorFilled: {
    backgroundColor: Colors.accent3,
  },
  stepContent: {
    flex: 1,
    paddingLeft: 12,
    paddingTop: 8,
    gap: 8,
  },
  stepLabel: {
    fontSize: 14,
  },
  progressTrack: {
    height: 3,
    backgroundColor: Colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.accent,
    borderRadius: 2,
  },
});
