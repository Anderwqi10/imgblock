import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useWeb3React } from "@web3-react/core";
import ConnectWallet from "./auth/ConnectWallet";

export function Header() {
  const { account } = useWeb3React();
  const location = useLocation();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [, setSelectedWallet] = useState<
    "MetaMask" | "WalletConnect" | "Coinbase" | null
  >(null);

  const truncate = (addr: string) =>
    addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "";

  return (
    <header className="flex items-center justify-between w-full px-8 md:px-16 py-5">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-3">
        <img src="/logoNovaFy.png" alt="Novafy" className="h-12 w-auto object-contain" />
        <span className="font-bold text-xl tracking-wide leading-none bg-gradient-to-r from-white via-[#a78bfa] to-[#e84141] bg-clip-text text-transparent">Novafy</span>
      </Link>

      {/* Nav tabs - center (optional, shown on larger screens) */}
      <nav className="hidden lg:flex items-center gap-2">
        {[
          { label: "Swap", path: "/swap" },
          { label: "Liquidity", path: "/liquidity" },
          { label: "Overview", path: "/overview" },
          { label: "NFTs", path: "/nft" },
          { label: "Blog", path: "/blog" },
          { label: "Coins", path: "/coins" },
        ].map(({ label, path }) => {
          const active = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                active
                  ? "bg-[#1e1e7a] text-white border border-white/20"
                  : "text-white/70 hover:text-white"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Right buttons */}
      <div className="flex items-center gap-3">
        <Link
          to="/swap"
          className="px-5 py-2 rounded-full border border-white/30 bg-white/10 text-white text-sm font-medium hover:bg-white/20 transition-all"
        >
          Buy &amp; Sell
        </Link>
        <button
          onClick={() => setIsAuthModalOpen(true)}
          disabled={!!account}
          className="px-5 py-2 rounded-full text-sm font-medium text-[#e84141] border border-[#e84141]/40 hover:bg-[#e84141]/10 transition-all disabled:opacity-80"
        >
          {account ? truncate(account) : "Connect Wallet"}
        </button>
      </div>

      <ConnectWallet
        isModalOpen={isAuthModalOpen}
        setIsModalOpen={setIsAuthModalOpen}
        setSelectedWallet={setSelectedWallet}
      />
    </header>
  );
}

export default Header;
