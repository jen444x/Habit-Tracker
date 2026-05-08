import { useEffect, useState } from "react";
import Header from "../components/layout/Header";

interface HabitStat {
  name: string;
  completed: number;
  skipped: number;
}

interface CachedInsights {
  insights: string;
  habitStats: HabitStat[];
  cachedAt: number;
}

const CACHE_KEY = "insights_cache";
const CACHE_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function InsightsPage() {
  const [insights, setInsights] = useState<string>("");
  const [habitStats, setHabitStats] = useState<HabitStat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  function getCachedInsights(): CachedInsights | null {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const parsed: CachedInsights = JSON.parse(cached);
    const age = Date.now() - parsed.cachedAt;

    if (age > CACHE_DURATION_MS) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }

    return parsed;
  }

  function saveToCache(insights: string, habitStats: HabitStat[]) {
    const cache: CachedInsights = {
      insights,
      habitStats,
      cachedAt: Date.now(),
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  }

  async function fetchInsights(forceRefresh = false) {
    // Check cache first (unless forcing refresh)
    if (!forceRefresh) {
      const cached = getCachedInsights();
      if (cached) {
        setInsights(cached.insights);
        setHabitStats(cached.habitStats);
        setIsLoading(false);
        return;
      }
    }

    setIsLoading(true);
    setError("");

    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/insights/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch insights");
      }

      const data = await res.json();
      setInsights(data.insights);
      setHabitStats(data.habit_stats);

      // Save to cache
      saveToCache(data.insights, data.habit_stats);
    } catch (err) {
      setError("Couldn't load insights. Try again later.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchInsights();
  }, []);

  return (
    <>
      <Header title="Insights" body="Patterns in your journey" />

      <div className="px-5 pb-28">
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-calm-600 mb-4"></div>
            <p className="text-calm-500">Analyzing your patterns...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center">
            {error}
          </div>
        )}

        {!isLoading && !error && (
          <div className="space-y-6">
            {/* AI Insights */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h2 className="text-calm-800 font-semibold mb-3 flex items-center gap-2">
                <span>✨</span> Your Insights
              </h2>
              <div className="text-calm-600 text-sm whitespace-pre-wrap leading-relaxed">
                {insights}
              </div>
            </div>

            {/* Habit Stats Summary */}
            {habitStats.length > 0 && (
              <div className="bg-white rounded-2xl p-5 shadow-sm">
                <h2 className="text-calm-800 font-semibold mb-3">
                  Last 30 Days
                </h2>
                <div className="space-y-3">
                  {habitStats.map((stat) => {
                    const total = stat.completed + stat.skipped;
                    const rate = total > 0 ? (stat.completed / total) * 100 : 0;
                    return (
                      <div key={stat.name}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-calm-700">{stat.name}</span>
                          <span className="text-calm-500">{rate.toFixed(0)}%</span>
                        </div>
                        <div className="h-2 bg-calm-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-calm-500 rounded-full transition-all"
                            style={{ width: `${rate}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Refresh Button */}
            <button
              onClick={() => fetchInsights(true)}
              className="w-full py-3 text-calm-600 text-sm font-medium hover:text-calm-800 transition-colors"
            >
              ↻ Refresh Insights
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default InsightsPage;
