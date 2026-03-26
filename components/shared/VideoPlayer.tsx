// components/shared/VideoPlayer.tsx

"use client";

import { CldVideoPlayer } from "next-cloudinary";
import "next-cloudinary/dist/cld-video-player.css";

interface VideoPlayerProps {
  publicId: string;
  width?: number;
  height?: number;
  autoplay?: boolean;
  controls?: boolean;
  muted?: boolean;
  loop?: boolean;
}

export default function VideoPlayer({
  publicId,
  width = 1920,
  height = 1080,
  autoplay = false,
  controls = true,
  muted = false,
  loop = false,
}: VideoPlayerProps) {
  return (
    <div className="glass overflow-hidden rounded-xl">
      <CldVideoPlayer
        width={width}
        height={height}
        src={publicId}
        autoplay={autoplay}
        controls={controls}
        muted={muted}
        loop={loop}
        colors={{
          accent: "#7b2fbe",
          base: "#1a0533",
          text: "#ffffff",
        }}
        logo={false}
      />
    </div>
  );
}
