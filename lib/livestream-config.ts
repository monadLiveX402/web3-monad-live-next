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
    url: "http://cdn3.toronto360.tv:8081/toronto360/hd/playlist.m3u8",
    title: "测试直播流",
    description: "Akamai 测试流",
  },
  {
    url: "https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8",
    title: "Mux 测试流",
    description: "Big Buck Bunny",
  },
  {
    url: "https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8",
    title: "Sintel 演示",
    description: "Bitmovin 演示流",
  },
  {
    url: "https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_fmp4/master.m3u8",
    title: "Apple 演示流",
    description: "Apple HLS 示例",
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
