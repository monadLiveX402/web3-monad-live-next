# 直播源配置指南

本指南帮助你配置和更换直播流源。

## 当前配置

直播源配置文件位于：[lib/livestream-config.ts](lib/livestream-config.ts)

## 快速更换直播源

### 方法1: 使用预设流（推荐）

我们提供了几个稳定的测试流，打开 `lib/livestream-config.ts`，修改默认流的索引：

```typescript
// 将索引从 0 改为 1, 2, 3 来使用不同的流
export const defaultStream = availableStreams[0]; // 改为 1, 2, 3...
```

### 方法2: 添加自定义流

在 `lib/livestream-config.ts` 中的 `availableStreams` 数组添加你的流：

```typescript
export const availableStreams: LiveStreamConfig[] = [
  // ... 现有的流
  {
    url: "你的直播流URL.m3u8",
    title: "你的直播标题",
    description: "描述信息"
  }
];
```

## 支持的流格式

内置 HLS 播放器（基于 hls.js + 原生 video）支持以下格式：

### 1. HLS (.m3u8) - 推荐
最常见的直播流格式，兼容性最好。

示例：
```
https://example.com/live/stream.m3u8
```

### 2. MP4
适用于点播视频。

示例：
```
https://example.com/video.mp4
```

### 3. DASH (.mpd)
MPEG-DASH 格式。

示例：
```
https://example.com/stream.mpd
```

## 预设直播源列表

### 1. Akamai 测试流 (默认)
```
URL: https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8
描述: 稳定的测试流
```

### 2. Mux 测试流
```
URL: https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8
描述: Big Buck Bunny 演示视频
```

### 3. Bitmovin 演示流
```
URL: https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8
描述: Sintel 电影片段
```

### 4. Apple 演示流
```
URL: https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_fmp4/master.m3u8
描述: Apple 官方 HLS 示例
```

## 如何找到可用的直播源

### IPTV 直播源

1. **GitHub IPTV 资源库**
   - https://github.com/iptv-org/iptv
   - 提供全球各地的免费电视频道

2. **测试流源网站**
   - https://ottverse.com/free-hls-m3u8-test-urls/
   - 提供各种测试 HLS 流

### 自己搭建直播流

如果你想使用自己的视频作为直播源：

1. **使用 OBS + RTMP 服务器**
   ```bash
   # 使用 nginx-rtmp 搭建 RTMP 服务器
   docker run -d -p 1935:1935 -p 8080:8080 tiangolo/nginx-rtmp
   ```

2. **使用 FFmpeg 转换**
   ```bash
   ffmpeg -i input.mp4 -c:v libx264 -c:a aac -f hls output.m3u8
   ```

## 常见问题

### Q: 视频无法播放
**A**: 检查：
1. URL 是否可访问（在浏览器中打开 .m3u8 链接）
2. 是否存在 CORS 问题
3. 网络连接是否正常

### Q: 如何测试流是否可用？
**A**: 在浏览器中直接访问 .m3u8 URL：
```
https://your-stream-url.m3u8
```
如果能下载文件，说明流可用。

### Q: CORS 错误怎么办？
**A**: 某些流源可能有 CORS 限制。解决方法：
1. 使用支持 CORS 的流源
2. 搭建代理服务器
3. 使用自己的流媒体服务器

### Q: 如何切换回原来的 CCTV6 源？
**A**: 如果 CCTV6 源恢复可用，在 `lib/livestream-config.ts` 中添加：

```typescript
{
  url: "http://cctvalih5ca.v.myalicdn.com/live/cctv6_2/index.m3u8",
  title: "CCTV6 电影频道",
  description: "中央电视台电影频道"
}
```

## 高级配置

### 添加多个流源切换

如果你想在应用中动态切换流源，可以在 `LivePage` 组件中添加下拉菜单：

```typescript
const [selectedStream, setSelectedStream] = useState(0);

// 在 JSX 中添加选择器
<select onChange={(e) => setSelectedStream(Number(e.target.value))}>
  {availableStreams.map((stream, index) => (
    <option key={index} value={index}>{stream.title}</option>
  ))}
</select>

// 使用选中的流
<HLSPlayerComponent streamUrl={availableStreams[selectedStream].url} />
```

## 测试你的配置

1. 修改 `lib/livestream-config.ts`
2. 保存文件（Next.js 会自动热重载）
3. 刷新浏览器 http://localhost:3000
4. 检查视频是否正常播放

---

需要帮助？查看 [hls.js 文档](https://github.com/video-dev/hls.js/) 获取更多配置选项。
