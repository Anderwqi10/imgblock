import React, { useState, useCallback, useEffect } from "react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import { useLiveData } from "../hooks/useLiveData";
import { fetchCoinDetail, fetchCoinChart } from "../services/coingecko.service";
import {
  pgGetFavorites,
  pgAddFavorite,
  pgRemoveFavorite,
  getStoredUser,
} from "../services/pg.api.service";

const coins = [
  { id: "bitcoin", label: "Bitcoin", symbol: "BTC", icon: "₿", color: "#f7931a" },
  { id: "ethereum", label: "Ethereum", symbol: "ETH", icon: "Ξ", color: "#00d4b5" },
  { id: "monero", label: "Monero", symbol: "XMR", icon: "ɱ", color: "#ff6600" },
  { id: "litecoin", label: "Litecoin", symbol: "LTC", icon: "Ł", color: "#a0aec0" },
];

const timeOptions = [
  { label: "1D", days: 1 },
  { label: "7D", days: 7 },
  { label: "1M", days: 30 },
  { label: "1A", days: 365 },
];

const fmt = (n: number) =>
  n >= 1e9 ? `$${(n / 1e9).toFixed(2)}B` : n >= 1e6 ? `$${(n / 1e6).toFixed(2)}M` : `$${n?.toLocaleString()}`;

const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-2xl border border-white/10 bg-gradient-to-br from-[#1e1e6a]/50 via-[#12124a]/30 to-[#0a0a2e]/60 backdrop-blur-sm shadow-lg shadow-black/30 ${className}`}>{children}</div>
);

const Spinner = () => (
  <div className="flex items-center justify-center h-64">
    <div className="w-8 h-8 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
  </div>
);

export default function CoinDetailsView() {
  const [activeCoin, setActiveCoin] = useState(coins[1]);
  const [activeTime, setActiveTime] = useState(timeOptions[0]);
  const [favIds, setFavIds] = useState<Set<string>>(new Set());
  const [favLoading, setFavLoading] = useState(false);
  const isLoggedIn = !!getStoredUser();

  useEffect(() => {
    if (!isLoggedIn) return;
    pgGetFavorites().then((res) => {
      if (res.success) setFavIds(new Set(res.data.map((f) => f.coin_id)));
    }).catch(() => {});
  }, [isLoggedIn]);

  const toggleFavorite = async () => {
    if (!isLoggedIn) {
      alert("Inicia sesión desde el Blog para guardar favoritos.");
      return;
    }
    setFavLoading(true);
    try {
      if (favIds.has(activeCoin.id)) {
        await pgRemoveFavorite(activeCoin.id);
        setFavIds((prev) => { const s = new Set(prev); s.delete(activeCoin.id); return s; });
      } else {
        await pgAddFavorite(activeCoin.id, activeCoin.label, activeCoin.symbol);
        setFavIds((prev) => new Set(Array.from(prev).concat(activeCoin.id)));
      }
    } catch {
      alert("Error al actualizar favoritos");
    } finally {
      setFavLoading(false);
    }
  };

  const detailFetcher = useCallback(
    () => fetchCoinDetail(activeCoin.id),
    [activeCoin.id]
  );
  const chartFetcher = useCallback(
    () => fetchCoinChart(activeCoin.id, activeTime.days),
    [activeCoin.id, activeTime.days]
  );

  const { data: detail, loading: dLoading, lastUpdated } = useLiveData(detailFetcher, 30000);
  const { data: chartData, loading: cLoading } = useLiveData(chartFetcher, 30000);

  const md = detail?.market_data;
  const price = md?.current_price?.usd;
  const change24h = md?.price_change_percentage_24h;
  const volume = md?.total_volume?.usd;
  const marketCap = md?.market_cap?.usd;
  const positive = (change24h ?? 0) >= 0;

  return (
    <div className="w-full px-8 md:px-16 py-4">
      {/* Header row */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <h1 className="text-white text-3xl font-bold">Detalles de Moneda</h1>
        <div className="flex items-center gap-4 flex-wrap">
          <button
            onClick={toggleFavorite}
            disabled={favLoading}
            title={favIds.has(activeCoin.id) ? "Quitar de favoritos" : "Agregar a favoritos"}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
              favIds.has(activeCoin.id)
                ? "bg-yellow-500/20 border-yellow-500/50 text-yellow-400"
                : "bg-white/5 border-white/10 text-white/40 hover:text-white"
            } disabled:opacity-50`}
          >
            <span>{favIds.has(activeCoin.id) ? "★" : "☆"}</span>
            <span className="text-xs">{favIds.has(activeCoin.id) ? "Favorito" : "Favoritos"}</span>
          </button>
          {coins.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCoin(c)}
              className={`flex items-center gap-2 pb-1 text-sm font-semibold transition-all ${
                activeCoin.id === c.id
                  ? "text-white border-b-2 border-[#e84141]"
                  : "text-white/50 hover:text-white border-b-2 border-transparent"
              }`}
            >
              <span
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                style={{ background: c.color }}
              >
                {c.icon}
              </span>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
        {/* About card */}
        <Card className="p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-white font-semibold">Sobre</span>
            {lastUpdated && (
              <span className="text-white/25 text-xs">{lastUpdated.toLocaleTimeString("es")}</span>
            )}
          </div>

          {dLoading ? (
            <div className="flex flex-col gap-3">
              <div className="h-14 w-14 rounded-full bg-white/10 animate-pulse" />
              <div className="h-4 w-32 bg-white/10 animate-pulse rounded" />
              <div className="h-3 w-full bg-white/10 animate-pulse rounded" />
              <div className="h-3 w-5/6 bg-white/10 animate-pulse rounded" />
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3">
                {detail?.image?.small ? (
                  <img src={detail.image.small} alt={activeCoin.label} className="w-14 h-14 rounded-full" />
                ) : (
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center text-white text-2xl font-bold"
                    style={{ background: activeCoin.color }}
                  >
                    {activeCoin.icon}
                  </div>
                )}
                <div>
                  <div className="text-white font-bold text-lg">{activeCoin.label}</div>
                  <div className="text-white/40 text-sm uppercase">{activeCoin.symbol}</div>
                  <div className="text-white/40 text-xs">
                    1 {activeCoin.symbol} = ${price?.toLocaleString()} USD
                  </div>
                </div>
              </div>
              {detail?.description?.en && (
                <p className="text-white/50 text-xs leading-5 line-clamp-8">
                  {detail.description.en.replace(/<[^>]+>/g, "")}
                </p>
              )}
            </>
          )}
        </Card>

        {/* Chart card */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-1 flex-wrap gap-3">
            <div>
              <div className="text-white font-semibold text-lg">Gráfico</div>
              <div className="text-white/40 text-xs">Precio en tiempo real</div>
            </div>
            <div className="flex gap-2">
              {timeOptions.map((t) => (
                <button
                  key={t.label}
                  onClick={() => setActiveTime(t)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    activeTime.label === t.label
                      ? "bg-white text-[#1a1a6e] font-bold"
                      : "text-white/50 border border-white/10 hover:text-white"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Stats row */}
          <div className="flex gap-8 mt-4 mb-6 flex-wrap">
            <div>
              <div className="text-white/40 text-xs">Precio</div>
              {dLoading ? (
                <div className="h-8 w-32 bg-white/10 animate-pulse rounded mt-1" />
              ) : (
                <div className="text-white text-2xl font-bold">${price?.toLocaleString()}</div>
              )}
            </div>
            <div>
              <div className="text-white/40 text-xs">Cambio 24h</div>
              <div className={`font-semibold text-sm flex items-center gap-1 mt-1 ${positive ? "text-green-400" : "text-red-400"}`}>
                {positive ? "+" : ""}{change24h?.toFixed(2)}% {positive ? "▲" : "▼"}
              </div>
            </div>
            <div>
              <div className="text-white/40 text-xs">Volumen (24h)</div>
              <div className="text-white font-semibold mt-1">{volume ? fmt(volume) : "—"}</div>
            </div>
            <div>
              <div className="text-white/40 text-xs">Cap. Mercado</div>
              <div className="text-white font-semibold mt-1">{marketCap ? fmt(marketCap) : "—"}</div>
            </div>
          </div>

          {cLoading ? (
            <Spinner />
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData ?? []} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="coinGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={activeCoin.color} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={activeCoin.color} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                  <YAxis hide domain={["auto", "auto"]} />
                  <Tooltip
                    contentStyle={{ background: "#1a1a5e", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, color: "#fff", fontSize: 12 }}
                    formatter={(v: any) => [`$${Number(v).toLocaleString()}`, activeCoin.symbol]}
                  />
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke={activeCoin.color}
                    strokeWidth={2.5}
                    fill="url(#coinGrad)"
                    dot={false}
                    activeDot={{ r: 5, fill: activeCoin.color, stroke: "#fff", strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
