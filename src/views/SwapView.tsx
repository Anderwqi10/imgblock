import React, { useState, useCallback } from "react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import { useLiveData } from "../hooks/useLiveData";
import { fetchCoinChart, fetchTopCoins } from "../services/coingecko.service";

const timeOptions: { label: string; days: number | string }[] = [
  { label: "1H", days: 0.04 },
  { label: "24H", days: 1 },
  { label: "7D", days: 7 },
  { label: "1M", days: 30 },
  { label: "1A", days: 365 },
];

const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-2xl border border-white/10 bg-gradient-to-br from-[#1e1e6a]/50 via-[#12124a]/30 to-[#0a0a2e]/60 backdrop-blur-sm shadow-lg shadow-black/30 ${className}`}>{children}</div>
);

const Spinner = () => (
  <div className="flex items-center justify-center h-64">
    <div className="w-8 h-8 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
  </div>
);

export default function SwapView() {
  const [activeFilter, setActiveFilter] = useState(timeOptions[1]);
  const [fromAmount, setFromAmount] = useState("");

  const chartFetcher = useCallback(
    () => fetchCoinChart("binancecoin", activeFilter.days),
    [activeFilter.days]
  );
  const priceFetcher = useCallback(() => fetchTopCoins(5), []);

  const { data: chartData, loading: chartLoading, lastUpdated } = useLiveData(chartFetcher, 30000);
  const { data: coins, loading: coinsLoading } = useLiveData(priceFetcher, 30000);

  const bnb = coins?.find((c) => c.id === "binancecoin");
  const currentPrice = bnb?.current_price ?? 0;
  const change24h = bnb?.price_change_percentage_24h ?? 0;
  const positive = change24h >= 0;

  return (
    <div className="w-full px-8 md:px-16 py-4">
      {/* Tabs */}
      <div className="flex gap-2 mb-8">
        {["SWAP", "Liquidez"].map((tab) => (
          <button
            key={tab}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
              tab === "SWAP"
                ? "bg-[#1e1e7a] text-white border border-white/20"
                : "text-white/60 hover:text-white"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-6">
        {/* Chart Card */}
        <Card className="p-6">
          {/* Time filters */}
          <div className="flex gap-2 mb-6 justify-end flex-wrap">
            {timeOptions.map((f) => (
              <button
                key={f.label}
                onClick={() => setActiveFilter(f)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  activeFilter.label === f.label
                    ? "bg-white text-[#1a1a6e] font-bold"
                    : "text-white/60 hover:text-white border border-white/10"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Price */}
          <div className="mb-6">
            {coinsLoading ? (
              <div className="h-10 w-48 bg-white/10 animate-pulse rounded" />
            ) : (
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold text-white">
                  ${currentPrice.toLocaleString()}
                </span>
                <span className={`font-semibold ${positive ? "text-green-400" : "text-red-400"}`}>
                  {positive ? "+" : ""}{change24h.toFixed(2)}%
                </span>
              </div>
            )}
            <div className="text-white/40 text-sm mt-1 flex items-center gap-2">
              <span>BNB/USD</span>
              {lastUpdated && (
                <span className="text-white/25 text-xs">· {lastUpdated.toLocaleTimeString("es")}</span>
              )}
            </div>
          </div>

          {/* Chart */}
          {chartLoading ? (
            <Spinner />
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData ?? []} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="bnbGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f7931a" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f7931a" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="time"
                    tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis hide domain={["auto", "auto"]} />
                  <Tooltip
                    contentStyle={{ background: "#1a1a5e", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, color: "#fff", fontSize: 12 }}
                    formatter={(v: any) => [`$${Number(v).toLocaleString()}`, "BNB"]}
                  />
                  <Area type="monotone" dataKey="price" stroke="#f7931a" strokeWidth={2} fill="url(#bnbGrad)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        {/* Swap Widget */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-white">Swap</h2>
            <button className="text-white/40 hover:text-white transition-colors">
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>

          {/* From */}
          <div className="rounded-xl bg-gradient-to-br from-white/8 to-white/3 border border-white/10 p-4 mb-2">
            <div className="text-white/50 text-xs mb-2 font-medium">Desde</div>
            <div className="flex items-center justify-between">
              <input
                type="number"
                value={fromAmount}
                onChange={(e) => setFromAmount(e.target.value)}
                placeholder="0.0"
                className="bg-transparent text-2xl text-white/40 outline-none w-28 placeholder-white/30"
              />
              <div className="flex items-center gap-2">
                <button className="text-[#5b9cf6] text-sm font-medium hover:text-blue-300">Max</button>
                <div className="flex items-center gap-2 bg-yellow-500 rounded-full px-3 py-1.5">
                  <span className="text-black text-xs font-bold">⬡</span>
                  <span className="text-black text-sm font-semibold">BNB</span>
                  <svg width="12" height="12" fill="currentColor" viewBox="0 0 20 20" className="text-black">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="text-white/30 text-xs mt-2">
              {fromAmount && currentPrice
                ? `≈ $${(parseFloat(fromAmount) * currentPrice).toLocaleString(undefined, { maximumFractionDigits: 2 })}`
                : "Balance: 0.0"}
            </div>
          </div>

          {/* Swap arrows */}
          <div className="flex justify-center my-3">
            <button className="text-[#5b9cf6] hover:scale-110 transition-transform">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            </button>
          </div>

          {/* To */}
          <div className="rounded-xl bg-gradient-to-br from-white/8 to-white/3 border border-white/10 p-4 mb-6">
            <div className="text-white/50 text-xs mb-2 font-medium">Para</div>
            <div className="flex items-center justify-between">
              <span className="text-2xl text-white/30">0.0</span>
              <button className="bg-[#1e1e7a] text-white text-sm font-semibold px-4 py-2 rounded-full border border-white/20 hover:bg-[#2a2a9e] transition-all">
                Seleccionar token
              </button>
            </div>
            <div className="text-white/30 text-xs mt-2">Balance: 0.0</div>
          </div>

          <button className="w-full py-4 rounded-xl bg-gradient-to-r from-[#e84141] to-[#7c3aed] text-white font-semibold text-base hover:opacity-90 transition-all shadow-lg shadow-[#e84141]/20">
            Ingresa un monto
          </button>
        </Card>
      </div>
    </div>
  );
}
