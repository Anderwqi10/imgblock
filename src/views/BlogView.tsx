import React, { useState, useEffect } from "react";
import {
  pgGetBlogPosts,
  pgLogin,
  pgRegister,
  saveSession,
  clearSession,
  getStoredUser,
  BlogPost,
  PgUser,
} from "../services/pg.api.service";

const sidebarCategories = [
  { icon: "🆕", label: "All", value: "" },
  { icon: "📈", label: "Market", value: "Market" },
  { icon: "⚙️", label: "Technology", value: "Technology" },
  { icon: "🏦", label: "DeFi", value: "DeFi" },
  { icon: "🖼️", label: "NFT", value: "NFT" },
  { icon: "⚖️", label: "Regulation", value: "Regulation" },
  { icon: "📚", label: "Education", value: "Education" },
];

const meetups = [
  { month: "JUL", day: "12", title: "DeFi Summit 2026 – Buenos Aires", tags: ["In-person", "Free"] },
  { month: "JUL", day: "18", title: "Blockchain Dev Meetup Online", tags: ["Remote", "Free"] },
  { month: "AUG", day: "3", title: "NFT & Web3 Expo – Medellín", tags: ["In-person", "Paid"] },
];

const podcasts = [
  "Bitcoin: The Future of Money with Nic Carter",
  "DeFi Explained for Beginners – Bankless",
  "Ethereum Layer 2: Everything You Need to Know",
  "How to Survive the Bear Market – The Crypto Mind",
  "NFTs and the New Digital Economy – Metaverse Today",
  "Crypto Security: Protect Your Assets – CryptoSec",
];

const avatarColors = ["#e84141", "#f7931a", "#00d4b5", "#5b9cf6", "#a855f7"];

const timeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return `${Math.floor(days / 30)} months ago`;
};

function AuthModal({ onClose, onAuth }: { onClose: () => void; onAuth: (user: PgUser) => void }) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = mode === "login"
        ? await pgLogin(email, password)
        : await pgRegister(email, password, username);
      if (res.success) {
        saveSession(res.data.token, res.data.user);
        onAuth(res.data.user);
        onClose();
      } else {
        setError(res.msg || "Unknown error");
      }
    } catch {
      setError("Connection error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#0d0d3b] border border-white/10 rounded-2xl p-8 w-full max-w-sm mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white font-bold text-xl">
            {mode === "login" ? "Sign in" : "Create account"}
          </h2>
          <button onClick={onClose} className="text-white/40 hover:text-white text-xl">✕</button>
        </div>
        <div className="flex gap-2 mb-6">
          {(["login", "register"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 py-2 rounded-full text-sm font-semibold transition-all ${
                mode === m ? "bg-[#1e1e7a] text-white border border-white/20" : "text-white/50 hover:text-white"
              }`}
            >
              {m === "login" ? "Sign in" : "Register"}
            </button>
          ))}
        </div>
        <form onSubmit={submit} className="flex flex-col gap-3">
          {mode === "register" && (
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none placeholder-white/30 focus:border-white/30"
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none placeholder-white/30 focus:border-white/30"
          />
          <input
            type="password"
            placeholder="Password (min. 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none placeholder-white/30 focus:border-white/30"
          />
          {error && <p className="text-red-400 text-xs">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="mt-2 py-3 rounded-xl bg-[#e84141] text-white font-semibold text-sm hover:bg-[#c83030] transition-all disabled:opacity-50"
          >
            {loading ? "Loading..." : mode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function BlogView() {
  const [activeCategory, setActiveCategory] = useState("");
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<PgUser | null>(getStoredUser());
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    setLoading(true);
    pgGetBlogPosts(10, 0)
      .then((res) => {
        if (res.success) setPosts(res.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = activeCategory
    ? posts.filter((p) => p.category === activeCategory)
    : posts;

  const handleLogout = () => {
    clearSession();
    setUser(null);
  };

  return (
    <div className="w-full px-8 md:px-16 py-4">
      {showAuth && (
        <AuthModal onClose={() => setShowAuth(false)} onAuth={(u) => setUser(u)} />
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[240px_1fr_240px] gap-6">
        {/* Left Sidebar */}
        <div className="flex flex-col gap-5">
          {/* User card */}
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#1e1e6a]/50 to-[#0a0a2e]/60 shadow-lg shadow-black/30 p-4">
            {user ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#e84141] flex items-center justify-center text-white font-bold text-sm">
                    {user.username?.[0]?.toUpperCase() ?? "U"}
                  </div>
                  <div>
                    <div className="text-white text-sm font-semibold">{user.username}</div>
                    <div className="text-white/40 text-xs">{user.email}</div>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-white/40 hover:text-white text-xs text-left transition-colors"
                >
                  Sign out →
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <div className="text-white text-sm font-semibold mb-1">Your account</div>
                <p className="text-white/40 text-xs">Sign in to save favorites and create posts.</p>
                <button
                  onClick={() => setShowAuth(true)}
                  className="mt-2 py-2 rounded-xl bg-[#1e1e7a] text-white text-sm font-semibold border border-white/20 hover:bg-[#2a2a9e] transition-all"
                >
                  Sign in / Register
                </button>
              </div>
            )}
          </div>

          {/* Categories */}
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#1e1e6a]/50 to-[#0a0a2e]/60 shadow-lg shadow-black/30 p-4 flex flex-col gap-1">
            <div className="text-white font-bold text-sm mb-2">Categories</div>
            {sidebarCategories.map((c) => (
              <button
                key={c.value}
                onClick={() => setActiveCategory(c.value)}
                className={`flex items-center gap-2 p-2 rounded-xl text-left text-sm transition-all ${
                  activeCategory === c.value ? "bg-white/10 text-white" : "text-white/50 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span>{c.icon}</span>
                <span>{c.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Center Feed */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-white font-bold text-lg">
              {activeCategory || "All posts"}
            </h2>
            <span className="text-white/30 text-xs">{filtered.length} articles</span>
          </div>

          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="flex gap-4">
                  <div className="w-28 h-24 rounded-xl bg-white/10 animate-pulse flex-shrink-0" />
                  <div className="flex-1 flex flex-col gap-3">
                    <div className="h-5 w-3/4 bg-white/10 animate-pulse rounded" />
                    <div className="h-3 w-1/2 bg-white/10 animate-pulse rounded" />
                    <div className="h-3 w-full bg-white/10 animate-pulse rounded" />
                    <div className="h-3 w-4/5 bg-white/10 animate-pulse rounded" />
                  </div>
                </div>
              </div>
            ))
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-white/40">
              No posts in this category yet.
            </div>
          ) : (
            filtered.map((post) => (
              <div key={post.id} className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#1e1e6a]/40 to-[#0a0a2e]/50 p-5 hover:from-[#1e1e6a]/60 hover:to-[#0a0a2e]/70 transition-all shadow-md shadow-black/20">
                <div className="flex gap-4">
                  {post.image_url && (
                    <div className="flex-shrink-0 w-28 h-24 rounded-xl overflow-hidden bg-white/5">
                      <img
                        src={post.image_url}
                        alt={post.title}
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-white/10 text-white/60 text-[10px] px-2 py-0.5 rounded-full">
                        {post.category}
                      </span>
                    </div>
                    <div className="text-white font-semibold text-sm leading-snug mb-2">
                      {post.title}
                    </div>
                    <p className="text-white/40 text-xs leading-5 line-clamp-2 mb-3">
                      {post.content}
                    </p>
                    <div className="flex gap-2 mb-3 flex-wrap">
                      {(post.tags || []).map((tag) => (
                        <span key={tag} className="bg-white/10 text-white/60 text-[10px] px-2 py-0.5 rounded-full">
                          #{tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                        style={{ background: avatarColors[post.id % avatarColors.length] }}
                      >
                        {post.author[0]}
                      </div>
                      <span className="text-white text-xs font-medium">{post.author}</span>
                      <span className="text-white/30 text-xs">·</span>
                      <span className="text-white/40 text-xs">{timeAgo(post.created_at)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right Sidebar */}
        <div className="flex flex-col gap-5">
          {/* Meetups */}
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#1e1e6a]/50 to-[#0a0a2e]/60 shadow-lg shadow-black/30 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-white font-bold text-sm">Events</span>
              <span className="text-[#e84141] text-xs">→</span>
            </div>
            {meetups.map((m, i) => (
              <div key={i} className="flex gap-3 mb-3">
                <div className="text-center min-w-[28px]">
                  <div className="text-white/40 text-[10px] uppercase">{m.month}</div>
                  <div className="text-white font-bold text-sm">{m.day}</div>
                </div>
                <div>
                  <div className="text-white text-xs font-medium leading-tight mb-1">{m.title}</div>
                  <div className="flex gap-1 flex-wrap">
                    {m.tags.map((tag) => (
                      <span key={tag} className="bg-white/10 text-white/60 text-[10px] px-1.5 py-0.5 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Podcasts */}
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#1e1e6a]/50 to-[#0a0a2e]/60 shadow-lg shadow-black/30 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-white font-bold text-sm">Podcasts</span>
              <span className="text-[#e84141] text-xs">→</span>
            </div>
            {podcasts.map((p, i) => (
              <div key={i} className="flex items-center gap-2 mb-3">
                <div
                  className="w-8 h-8 rounded flex-shrink-0 flex items-center justify-center text-white text-xs font-bold"
                  style={{ background: avatarColors[i % avatarColors.length] }}
                >
                  ▶
                </div>
                <div className="flex-1">
                  <div className="text-white text-[10px] leading-tight">{p}</div>
                </div>
                <button className="text-white/30 hover:text-white text-sm">→</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
