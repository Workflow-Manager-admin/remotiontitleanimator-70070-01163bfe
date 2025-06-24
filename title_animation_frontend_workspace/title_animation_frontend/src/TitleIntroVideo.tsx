import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  spring,
} from "remotion";
import { z } from "zod";
import { zColor } from "@remotion/zod-types";

// PUBLIC_INTERFACE
export const titleIntroVideoSchema = z.object({
  /**
   * The main title to show
   */
  titleText: z.string().default("Welcome to My Channel").describe("Main title text"),

  /**
   * Text color
   */
  titleColor: zColor().default("#1a202c").describe("Title color"),

  /**
   * Background mode: solid, gradient, or animated
   */
  backgroundMode: z.enum(["solid", "gradient", "animated"]).default("gradient"),
  /**
   * Solid background color (if backgroundMode === 'solid')
   */
  backgroundColor: zColor().optional(),
  /**
   * Gradient start (if backgroundMode === 'gradient')
   */
  gradientFrom: zColor().optional(),
  /**
   * Gradient end (if backgroundMode === 'gradient')
   */
  gradientTo: zColor().optional(),
  /**
   * Animated background primary color (if backgroundMode === 'animated')
   */
  animatedBgColor: zColor().optional(),
});

type TitleIntroVideoProps = z.infer<typeof titleIntroVideoSchema>;

// Derived minimalistic modern font family
const FONT_FAMILY =
  "'Inter', 'SF Pro Text', 'Helvetica Neue', 'Arial', 'sans-serif'";

const ANIMATION_DURATION = 45; // frames for main intro (1.5s at 30fps)
const HOLD_DURATION = 75; // e.g. hold for 2.5s
const OUTRO_DURATION = 30; // frames for fade out/scale back (1s)
const TOTAL_DURATION = ANIMATION_DURATION + HOLD_DURATION + OUTRO_DURATION; // Total: 150

const getBackground = (props: TitleIntroVideoProps, frame: number) => {
  if (props.backgroundMode === "solid") {
    return { backgroundColor: props.backgroundColor ?? "#fff" };
  }
  if (props.backgroundMode === "gradient") {
    const from = props.gradientFrom ?? "#91EAE4";
    const to = props.gradientTo ?? "#86A8E7";
    return {
      background: `linear-gradient(135deg, ${from}, ${to})`,
    };
  }
  // Animated background: subtle shifting
  if (props.backgroundMode === "animated") {
    // Animate a shifting solid color as a background using a hue rotate
    const primaryColor = props.animatedBgColor ?? "#fbbf24";
    const rotate =
      10 * Math.sin((frame / TOTAL_DURATION) * 2 * Math.PI); // oscillate between -10deg and +10deg
    return {
      backgroundColor: primaryColor,
      filter: `hue-rotate(${rotate}deg) brightness(1.07)`,
      transition: "filter 0.25s",
    };
  }
  return { backgroundColor: "#fff" };
};

export const TitleIntroVideo: React.FC<TitleIntroVideoProps> = (props) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  // Spring-based entrance (fade, scale, slide)
  const entranceProgress = spring({
    frame: Math.min(frame, ANIMATION_DURATION),
    fps: 30,
    config: {
      mass: 1,
      damping: 16,
      stiffness: 120,
    },
    durationInFrames: ANIMATION_DURATION,
  });

  // Fade-in: from 0 to 1 during entrance
  const fadeIn = interpolate(
    entranceProgress,
    [0, 0.8, 1],
    [0, 1, 1]
  );

  // Scale-in: from 0.9 to 1.03 and settle at 1
  const scaleIn = interpolate(
    entranceProgress,
    [0, 0.8, 1],
    [0.9, 1.03, 1]
  );

  // Optional: Slide-in from below (e.g., 80px offset)
  const slideIn = interpolate(
    entranceProgress,
    [0, 1],
    [80, 0]
  );

  // Pulse/hold after entrance (pulse up then gently settle)
  // Pulse triggers at end of entrance and relaxes during hold
  let pulse = 1;
  if (frame > ANIMATION_DURATION && frame < ANIMATION_DURATION + HOLD_DURATION) {
    const pulseFrame = frame - ANIMATION_DURATION;
    // pulse grows from 1.0 -> 1.04 and contracts to 1.0, then holds
    pulse = interpolate(Math.sin((pulseFrame / 18)), [-1, 0, 1], [1, 1.04, 1]);
    // Also allow a gentle fade to "hold"
    pulse *= interpolate(
      pulseFrame,
      [0, 12, HOLD_DURATION - 12, HOLD_DURATION],
      [1, 1, 1, 1]
    );
  }

  // Fade out at the end
  let composedOpacity = fadeIn;
  if (
    frame >= ANIMATION_DURATION + HOLD_DURATION
    && frame < TOTAL_DURATION
  ) {
    const outroFrame = frame - (ANIMATION_DURATION + HOLD_DURATION);
    composedOpacity = interpolate(
      outroFrame,
      [0, OUTRO_DURATION * 0.4, OUTRO_DURATION],
      [1, 1, 0]
    );
  }

  // Scale also returns to a subtle shrink at outro
  let composedScale = scaleIn * pulse;
  if (
    frame >= ANIMATION_DURATION + HOLD_DURATION
    && frame < TOTAL_DURATION
  ) {
    const outroFrame = frame - (ANIMATION_DURATION + HOLD_DURATION);
    composedScale = interpolate(
      outroFrame,
      [0, OUTRO_DURATION],
      [composedScale, 0.9]
    );
  }

  // Responsive font-size based on width
  const titleFontSize = Math.min(width, height) * 0.105; // ~100px in 1920x1080

  // Letter spacing and minimal shadow for subtlety
  const textShadow = "0 2px 16px rgba(0,0,0,0.08)";

  return (
    <AbsoluteFill style={getBackground(props, frame)}>
      <div
        style={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            willChange: "opacity, transform",
            opacity: composedOpacity,
            transform: `scale(${composedScale}) translateY(${slideIn}px)`,
            transition: "transform 0.24s cubic-bezier(.4,.2,.6,1)",
          }}
        >
          <h1
            style={{
              fontFamily: FONT_FAMILY,
              fontWeight: 800,
              color: props.titleColor,
              fontSize: titleFontSize,
              lineHeight: 1.06,
              letterSpacing: "-0.018em",
              margin: 0,
              marginBottom: 0,
              textAlign: "center",
              textShadow,
              borderRadius: "12px",
              background: "rgba(255,255,255,0.07)",
              boxShadow:
                "0 4px 24px 0 rgba(26,32,44,0.02), 0 0px 0px 1.5px rgba(26,32,44,0.06)",
              padding: "0.25em 1.5em",
              display: "inline-block",
              minWidth: "0",
              userSelect: "none",
              transition: "background 0.3s",
            }}
          >
            {props.titleText}
          </h1>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* No static defaultProps block here; defaults are handled using schema and in the Root composition defaultProps. */
