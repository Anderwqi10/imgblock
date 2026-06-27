import React, { useState, useCallback } from "react";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import { useLiveData } from "../hooks/useLiveData";
import { fetchTopCoins, fetchGlobal, fetchCoinChart, CoinMarket } from "../services/coingecko.service";

const fmt = (n: number) =>
  n >= 1e9 ? `$${(n / 1e9).toFixed(2)}B` : n >= 1e6 ? `$${(n / 1e6).toFixed(2)}M` : `$${n.toLocaleString()}`;

const tooltipStyle = {
  background: "#1a1a5e",
  border: "1px solid rgba(255,255,255,0.15)",
  borderRadius: 8,
  color: "#fff",
  fontSize: 12,
};

const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-2xl border border-white/10 bg-gradient-to-br from-[#1e1e6a]/50 via-[#12124a]/30 to-[#0a0a2e]/60 backdrop-blur-sm shadow-lg shadow-black/30 p-6 ${className}`}>{children}</div>
);

const Spinner = () => (
  <div className="flex items-center justify-center h-56">
    <div className="w-8 h-8 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
  </div>
);

const LastUpdated = ({ date }: { date: Date | null }) =>
  date ? (
    <span className="text-white/30 text-xs">
      Actualizado {date.toLocaleTimeString("es")}
    </span>
  ) : null;

const SparkLine = ({ prices, positive }: { prices: number[]; positive: boolean }) => {
  const data = prices.slice(-20).map((p, i) => ({ i, p }));
  return (
    <div className="w-20 h-8">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id={`sg${positive}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={positive ? "#4ade80" : "#f87171"} stopOpacity={0.3} />
              <stop offset="100%" stopColor={positive ? "#4ade80" : "#f87171"} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="p" stroke={positive ? "#4ade80" : "#f87171"} strokeWidth={1.5} fill={`url(#sg${positive})`} dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default function OverviewView() {
  const [activeTab, setActiveTab] = useState("Overview");

  const globalFetcher = useCallback(() => fetchGlobal(), []);
  const coinsFetcher = useCallback(() => fetchTopCoins(10), []);
  const chartFetcher = useCallback(() => fetchCoinChart("bitcoin", 1), []);

  const { data: global, loading: gLoading, lastUpdated: gUpdated } = useLiveData(globalFetcher);
  const { data: coins, loading: cLoading, lastUpdated: cUpdated } = useLiveData(coinsFetcher);
  const { data: chartData, loading: chLoading } = useLiveData(chartFetcher);

  const barData = chartData
    ? chartData.filter((_, i) => i % 3 === 0).map((d) => ({ t: d.time, v: d.price }))
    : [];

  return (
    <div className="w-full px-8 md:px-16 py-4">
      {/* Tabs + Search */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div className="flex gap-2">
          {["Overview", "Pools", "Tokens"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                activeTab === tab
                  ? "bg-[#1e1e7a] text-white border border-white/20"
                  : "text-white/60 hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,0.4)" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input placeholder="Buscar..." className="bg-transparent text-sm text-white/60 outline-none placeholder-white/30 w-36" />
          <button className="bg-[#1e1e7a] text-white text-xs px-3 py-1 rounded-full border border-white/20">Buscar</button>
        </div>
      </div>

      {/* Global stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <div className="flex items-start justify-between mb-1">
            <div>
              <div className="text-white font-bold text-lg">Liquidez Total</div>
              {gLoading ? (
                <div className="h-9 w-48 bg-white/10 animate-pulse rounded mt-1" />
              ) : (
                <div className="text-white text-3xl font-bold mt-1">
                  {global ? fmt(global.total_market_cap.usd) : "—"}
                </div>
              )}
            </div>
            <LastUpdated date={gUpdated} />
          </div>
          {chLoading ? (
            <Spinner />
          ) : (
            <div className="h-56 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData ?? []} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#5b9cf6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#5b9cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                  <YAxis hide domain={["auto", "auto"]} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => [`$${Number(v).toLocaleString()}`, "Precio BTC"]} />
                  <Area type="monotone" dataKey="price" stroke="#5b9cf6" strokeWidth={2} fill="url(#blueGrad)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <Card>
          <div className="flex items-start justify-between mb-1">
            <div>
              <div className="text-white font-bold text-lg">Volumen 24H</div>
              {gLoading ? (
                <div className="h-9 w-40 bg-white/10 animate-pulse rounded mt-1" />
              ) : (
                <div className="text-white text-3xl font-bold mt-1">
                  {global ? fmt(global.total_volume.usd) : "—"}
                </div>
              )}
            </div>
            <LastUpdated date={gUpdated} />
          </div>
          {chLoading ? (
            <Spinner />
          ) : (
            <div className="h-56 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <XAxis dataKey="t" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                  <YAxis hide />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => [`$${Number(v).toLocaleString()}`, "Precio"]} />
                  <Bar dataKey="v" fill="rgba(91,156,246,0.5)" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>

      {/* Top Tokens Table */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white text-xl font-bold">Top Tokens</h2>
          <div className="flex items-center gap-3">
            <LastUpdated date={cUpdated} />
            <span className="text-white/30 text-xs">· se actualiza cada 30s</span>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-[#1e1e6a]/40 to-[#0a0a2e]/60 overflow-hidden shadow-lg shadow-black/30">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 bg-gradient-to-r from-[#1a1a5e]/80 via-[#16166a]/50 to-transparent">
                {["#", "Moneda", "Precio", "Cambio 24h", "Volumen 24h", "Cap. Mercado", "Gráfico"].map((h) => (
                  <th key={h} className="text-left text-white/70 text-xs font-semibold px-5 py-4 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cLoading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} className="border-b border-white/5">
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j} className="px-5 py-4">
                          <div className="h-4 bg-white/10 animate-pulse rounded w-16" />
                        </td>
                      ))}
                    </tr>
                  ))
                : (coins ?? []).map((coin: CoinMarket, i: number) => {
                    const pos = coin.price_change_percentage_24h >= 0;
                    return (
                      <tr key={coin.id} className="border-b border-white/5 hover:bg-gradient-to-r hover:from-white/5 hover:to-transparent transition-all">
                        <td className="px-5 py-3 text-white/40 text-sm">{i + 1}</td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <img src={coin.image} alt={coin.name} className="w-6 h-6 rounded-full" />
                            <div>
                              <div className="text-white text-sm font-medium">{coin.name}</div>
                              <div className="text-white/40 text-xs uppercase">{coin.symbol}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-white text-sm font-medium">
                          ${coin.current_price.toLocaleString()}
                        </td>
                        <td className={`px-5 py-3 text-sm font-semibold ${pos ? "text-green-400" : "text-red-400"}`}>
                          {pos ? "+" : ""}{coin.price_change_percentage_24h.toFixed(2)}%
                        </td>
                        <td className="px-5 py-3 text-white/60 text-sm">{fmt(coin.total_volume)}</td>
                        <td className="px-5 py-3 text-white/60 text-sm">{fmt(coin.market_cap)}</td>
                        <td className="px-5 py-3">
                          {coin.sparkline_in_7d && (
                            <SparkLine prices={coin.sparkline_in_7d.price} positive={pos} />
                          )}
                        </td>
                      </tr>
                    );
                  })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
