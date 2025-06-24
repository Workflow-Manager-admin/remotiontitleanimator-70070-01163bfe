import { Composition } from "remotion";
import { TitleIntroVideo, titleIntroVideoSchema } from "./TitleIntroVideo";

/**
 * Root component for Remotion
 * Registers the main TitleIntroVideo composition.
 */
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="TitleIntroVideo"
        component={TitleIntroVideo}
        durationInFrames={150} // 5 seconds at 30fps
        fps={30}
        width={1920}
        height={1080}
        schema={titleIntroVideoSchema}
        defaultProps={{
          titleText: "Welcome to My Channel",
          titleColor: "#1a202c",
          backgroundMode: "gradient",
          gradientFrom: "#91EAE4",
          gradientTo: "#86A8E7",
          backgroundColor: "#fff",
          animatedBgColor: "#fbbf24",
        }}
      />
    </>
  );
};
