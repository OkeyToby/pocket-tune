import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Line, Path, Circle, Text as SvgText, G } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import { Colors } from '@/constants/Colors';
import { ThemedText } from '@/components/ui/ThemedText';

const AnimatedG = Animated.createAnimatedComponent(G);
const { width } = Dimensions.get('window');
const GAUGE_W = width - 48;
const GAUGE_H = 180;
const CX = GAUGE_W / 2;
const CY = GAUGE_H - 20;
const RADIUS = GAUGE_H - 40;

interface NeedleGaugeProps {
  cents: number;        // -50 to +50
  note: string;
  octave: number;
  freq: number;
  tuneAccuracy: 'none' | 'in-tune' | 'close' | 'off';
}

// Map cents (-50..+50) to angle (-70..+70 degrees from vertical)
function centsToAngle(cents: number) {
  return interpolate(Math.max(-50, Math.min(50, cents)), [-50, 50], [-70, 70]);
}

export function NeedleGauge({ cents, note, octave, freq, tuneAccuracy }: NeedleGaugeProps) {
  const needleAngle = useSharedValue(0);

  React.useEffect(() => {
    needleAngle.value = withSpring(centsToAngle(cents), {
      damping: 15,
      stiffness: 120,
    });
  }, [cents]);

  const indicatorColor =
    tuneAccuracy === 'in-tune'
      ? Colors.accent3
      : tuneAccuracy === 'close'
      ? Colors.accent
      : tuneAccuracy === 'off'
      ? Colors.danger
      : Colors.textDim;

  const animProps = useAnimatedProps(() => ({
    transform: [{ rotate: `${needleAngle.value}deg` }],
  }));

  const ticks = Array.from({ length: 11 }, (_, i) => i - 5); // -50..+50 step 10

  return (
    <View style={styles.container}>
      <Svg width={GAUGE_W} height={GAUGE_H} viewBox={`0 0 ${GAUGE_W} ${GAUGE_H}`}>
        {/* Background arc */}
        <Path
          d={describeArc(CX, CY, RADIUS, -70, 70)}
          fill="none"
          stroke={Colors.border}
          strokeWidth={3}
        />

        {/* Colored zone (center ±10 cents) */}
        <Path
          d={describeArc(CX, CY, RADIUS, -14, 14)}
          fill="none"
          stroke={Colors.accent3 + '66'}
          strokeWidth={8}
          strokeLinecap="round"
        />

        {/* Tick marks */}
        {ticks.map((t) => {
          const angle = (t / 5) * 70;
          const rad = (angle - 90) * (Math.PI / 180);
          const inner = RADIUS - (t === 0 ? 18 : 10);
          const outer = RADIUS + 4;
          return (
            <G key={t}>
              <Line
                x1={CX + inner * Math.cos(rad)}
                y1={CY + inner * Math.sin(rad)}
                x2={CX + outer * Math.cos(rad)}
                y2={CY + outer * Math.sin(rad)}
                stroke={t === 0 ? Colors.accent3 : Colors.border}
                strokeWidth={t === 0 ? 2 : 1}
              />
              {t !== 0 && (
                <SvgText
                  x={CX + (inner - 14) * Math.cos(rad)}
                  y={CY + (inner - 14) * Math.sin(rad)}
                  fill={Colors.textDim}
                  fontSize={9}
                  textAnchor="middle"
                  alignmentBaseline="middle"
                >
                  {t > 0 ? `+${t * 10}` : `${t * 10}`}
                </SvgText>
              )}
            </G>
          );
        })}

        {/* Pivot */}
        <Circle cx={CX} cy={CY} r={6} fill={Colors.surface} stroke={Colors.border} strokeWidth={1.5} />

        {/* Needle */}
        <AnimatedG
          animatedProps={animProps}
          origin={`${CX}, ${CY}`}
        >
          <Line
            x1={CX}
            y1={CY}
            x2={CX}
            y2={CY - RADIUS + 8}
            stroke={indicatorColor}
            strokeWidth={2.5}
            strokeLinecap="round"
          />
          <Circle cx={CX} cy={CY} r={4} fill={indicatorColor} />
        </AnimatedG>
      </Svg>

      {/* Note display */}
      <View style={styles.noteRow}>
        <ThemedText variant="h1" style={[styles.note, { color: indicatorColor }]}>
          {freq > 0 ? note : '—'}
        </ThemedText>
        {freq > 0 && (
          <ThemedText variant="caption" style={styles.octave}>
            {octave}
          </ThemedText>
        )}
      </View>

      <View style={styles.infoRow}>
        {freq > 0 ? (
          <>
            <ThemedText variant="mono" style={styles.freq}>
              {freq.toFixed(1)} Hz
            </ThemedText>
            <ThemedText
              variant="caption"
              style={[styles.tuneLabel, { color: indicatorColor }]}
            >
              {tuneAccuracy === 'in-tune'
                ? '● In Tune'
                : tuneAccuracy === 'close'
                ? `${cents > 0 ? '+' : ''}${cents}¢`
                : tuneAccuracy === 'off'
                ? `${cents > 0 ? '+' : ''}${cents}¢`
                : ''}
            </ThemedText>
          </>
        ) : (
          <ThemedText variant="caption" style={{ color: Colors.textDim }}>
            Play a note...
          </ThemedText>
        )}
      </View>
    </View>
  );
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeArc(cx: number, cy: number, r: number, startDeg: number, endDeg: number) {
  const start = polarToCartesian(cx, cy, r, endDeg);
  const end = polarToCartesian(cx, cy, r, startDeg);
  const largeArc = endDeg - startDeg <= 180 ? '0' : '1';
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`;
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  noteRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: -8,
  },
  note: {
    fontSize: 64,
    lineHeight: 72,
    fontFamily: 'DMSerifDisplay_400Regular',
  },
  octave: {
    fontSize: 20,
    marginTop: 12,
    color: Colors.textMuted,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  freq: {
    color: Colors.textMuted,
    fontSize: 13,
  },
  tuneLabel: {
    fontSize: 13,
    fontFamily: 'Syne_700Bold',
  },
});
