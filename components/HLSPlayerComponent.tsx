"use client";

import { useEffect, useRef, useState } from "react";

interface HLSPlayerComponentProps {
  streamUrl: string;
  poster?: string;
}

declare global {
  interface Window {
    Hls?: any;
  }
}

/**
 * Lightweight HLS player that loads hls.js from CDN and falls back to native HLS.
 */
export default function HLSPlayerComponent({ streamUrl, poster }: HLSPlayerComponentProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let hlsInstance: any = null;
    let scriptEl: HTMLScriptElement | null = null;
    setIsError(false);

    const cleanup = () => {
      if (hlsInstance?.destroy) {
        hlsInstance.destroy();
      }
      if (video) {
        video.pause();
        video.removeAttribute("src");
        video.load();
      }
    };

    const startPlayback = () => {
      if (!video) return;

      // If the browser supports native HLS (Safari, some mobile browsers)
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
        video.play().catch(() => undefined);
        return;
      }

      // Use hls.js for other browsers
      const HlsConstructor = window.Hls;
      if (HlsConstructor?.isSupported()) {
        hlsInstance = new HlsConstructor();
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
        hlsInstance.on(HlsConstructor.Events.ERROR, (_event: any, data: any) => {
          if (data?.fatal) {
            setIsError(true);
          }
        });
        video.play().catch(() => undefined);
      } else {
        setIsError(true);
      }
    };

    // Load hls.js from CDN if needed
    if (window.Hls) {
      startPlayback();
    } else {
      scriptEl = document.querySelector('script[data-hls-js]') as HTMLScriptElement | null;

      if (scriptEl) {
        scriptEl.addEventListener("load", startPlayback, { once: true });
      } else {
        scriptEl = document.createElement("script");
        scriptEl.src = "https://cdn.jsdelivr.net/npm/hls.js@1.5.15/dist/hls.min.js";
        scriptEl.async = true;
        scriptEl.dataset.hlsJs = "true";
        scriptEl.onload = startPlayback;
        scriptEl.onerror = () => setIsError(true);
        document.body.appendChild(scriptEl);
      }
    }

    return () => {
      if (scriptEl) {
        scriptEl.removeEventListener("load", startPlayback);
      }
      cleanup();
    };
  }, [streamUrl]);

  return (
    <div className="relative w-full">
      <video
        ref={videoRef}
        className="w-full rounded-lg overflow-hidden bg-black"
        controls
        autoPlay
        playsInline
        poster={poster}
      />
      {isError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-white text-sm">
          播放器加载失败，请检查流地址或网络。
        </div>
      )}
    </div>
  );
}
