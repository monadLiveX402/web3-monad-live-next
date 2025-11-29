"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

type Props = {
  instantVolume: number;
  streamVolume: number;
  currency: string;
};

export function DashboardCharts({ instantVolume, streamVolume, currency }: Props) {
  const pieOption = useMemo(() => {
    const total = Math.max(instantVolume + streamVolume, 0.0001);
    const instantPct = Math.round((instantVolume / total) * 100);
    const streamPct = 100 - instantPct;

    return {
      tooltip: {
        trigger: "item",
        formatter: "{b}: {c} " + currency + " ({d}%)",
      },
      legend: {
        bottom: 0,
        textStyle: { color: "#cbd5e1" },
      },
      series: [
        {
          name: "打赏占比",
          type: "pie",
          radius: ["40%", "70%"],
          avoidLabelOverlap: false,
          label: {
            show: true,
            formatter: "{b}\n{d}%",
            color: "#e2e8f0",
          },
          itemStyle: {
            borderRadius: 10,
            borderColor: "#0a0118",
            borderWidth: 2,
          },
          data: [
            { value: instantVolume, name: `即时 (${instantPct}%)` },
            { value: streamVolume, name: `流式 (${streamPct}%)` },
          ],
        },
      ],
    };
  }, [instantVolume, streamVolume, currency]);

  const lineOption = useMemo(() => {
    const total = instantVolume + streamVolume;
    const basePoints = [12, 16, 18, 22, 26, 28];
    const lastPoint = total > 0 ? total : 30;
    const data = [...basePoints, lastPoint];
    const labels = ["周一", "周二", "周三", "周四", "周五", "周六", "今日"];

    return {
      tooltip: {
        trigger: "axis",
        formatter: "{b}: {c} " + currency,
      },
      xAxis: {
        type: "category",
        data: labels,
        axisLabel: { color: "#cbd5e1" },
        axisLine: { lineStyle: { color: "#475569" } },
      },
      yAxis: {
        type: "value",
        axisLabel: { color: "#cbd5e1" },
        splitLine: { lineStyle: { color: "rgba(148,163,184,0.2)" } },
      },
      series: [
        {
          data,
          type: "line",
          smooth: true,
          areaStyle: {
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: "rgba(236,72,153,0.45)" },
                { offset: 1, color: "rgba(59,130,246,0.05)" },
              ],
            },
          },
          lineStyle: { color: "#a855f7", width: 3 },
          itemStyle: { color: "#f472b6", borderColor: "#a855f7", borderWidth: 2 },
          emphasis: { focus: "series" },
        },
      ],
      grid: { left: "3%", right: "4%", bottom: "8%", containLabel: true },
    };
  }, [instantVolume, streamVolume, currency]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-[#0a0118] rounded-2xl p-6 border border-purple-800/30">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">收益占比</h3>
          <span className="text-xs text-gray-400">即时 vs 流式</span>
        </div>
        <ReactECharts option={pieOption} style={{ height: 320 }} notMerge lazyUpdate />
      </div>

      <div className="bg-[#0a0118] rounded-2xl p-6 border border-purple-800/30">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">近7天趋势</h3>
          <span className="text-xs text-gray-400">总额（{currency}）</span>
        </div>
        <ReactECharts option={lineOption} style={{ height: 320 }} notMerge lazyUpdate />
      </div>
    </div>
  );
}
