"use client";

import { motion } from "framer-motion";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import Leaderboard from "@/components/Leaderboard";
import NavBar from "@/components/NavBar";
import { formatNumber, formatLargeNumber } from "@/lib/utils";

export default function Home() {
  const stats = useQuery(api.stats.getGlobalStats);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <NavBar />

      {/* Main Content */}
      <main className={`flex-1  pt-14 md:pt-0 transition-all`}>
        {/* Hero Section */}
        <div className="relative bg-gradient-to-b from-accent/5 via-transparent to-transparent">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 sm:pt-20 md:pt-32 pb-6 sm:pb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-8 sm:mb-12"
            >
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Claude Code Leaderboard
              </h2>
              <p className="text-base sm:text-lg text-muted max-w-2xl mx-auto px-4">
                Track and compare AI-powered development usage across the community
              </p>
            </motion.div>

            {/* Compact Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex items-center justify-center gap-6 sm:gap-8 text-center flex-wrap mb-12"
            >
              <div>
                <p className="text-2xl sm:text-3xl font-bold">{stats?.totalUsers || 0}</p>
                <p className="text-xs sm:text-sm text-muted">Developers</p>
              </div>
              <div className="w-px h-12 bg-border/50 hidden sm:block" />
              <div>
                <p className="text-2xl sm:text-3xl font-bold">
                  {stats ? formatNumber(stats.totalTokens) : "0"}
                </p>
                <p className="text-xs sm:text-sm text-muted">Total Tokens</p>
              </div>
              <div className="w-px h-12 bg-border/50 hidden sm:block" />
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-accent">
                  ${stats ? formatLargeNumber(Math.round(stats.totalCost)) : "0"}
                </p>
                <p className="text-xs sm:text-sm text-muted">Total Spent</p>
              </div>
            </motion.div>

          </div>
        </div>

        {/* Leaderboard Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
          <Leaderboard />
        </div>
      </main>


    </div>
  );
}