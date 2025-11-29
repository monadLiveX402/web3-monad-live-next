/**
 * 直播流配置
 *
 * 支持的流格式：
 * - HLS (.m3u8)
 * - MP4
 * - WebRTC
 */

export interface LiveStreamConfig {
  url: string;
  title: string;
  description?: string;
}

// 可用的直播源列表
export const availableStreams: LiveStreamConfig[] = [
  {
    url: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    title: "Sintel 演示 (MP4)",
    description: "稳定的 MP4 演示源",
  },
  {
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    title: "Big Buck Bunny",
    description: "备用 MP4 源",
  },
  {
    url: "https://www.w3schools.com/html/mov_bbb.mp4",
    title: "BBB 片段",
    description: "备用 MP4 源 2",
  },
  {
    url: "https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_fmp4/master.m3u8",
    title: "Apple HLS 示例",
    description: "HLS 演示流（需要 HLS 支持）",
  },
];

// 默认直播源（第一个可用的流）
export const defaultStream = availableStreams[0];

// 获取直播源配置
export function getStreamConfig(url?: string): LiveStreamConfig {
  if (!url) return defaultStream;

  const found = availableStreams.find(stream => stream.url === url);
  return found || { url, title: "自定义直播流" };
}
