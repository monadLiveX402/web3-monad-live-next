"use client";

interface TipEventStreamProps {
  chainId: number;
  maxDisplay?: number;
}

/**
 * 打赏事件序列实时展示组件
 * 临时禁用以修复性能问题
 */
export function TipEventStream({
  chainId,
  maxDisplay = 10,
}: TipEventStreamProps) {
  const currency = chainId === 10143 ? "MON" : "ETH";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-purple-600">实时打赏</h3>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-gray-400" />
          <span className="text-xs text-gray-500">已禁用</span>
        </div>
      </div>

      <div className="relative h-[400px] overflow-hidden rounded-lg bg-gradient-to-b from-purple-50 to-pink-50">
        <div className="flex h-full items-center justify-center p-4">
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-2">实时打赏功能已临时禁用</p>
            <p className="text-xs text-gray-400">正在优化性能...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
