"use client";

import Image from "next/image";
import logo from "@/assets/sat-png-4.png";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import TestCard from "@/components/TestCard";
import Loading from "@/components/Loading";
import ActivityHeatmap from "@/components/ActivityHeatmap";
import { Trophy, Flame, Target, BookOpen } from "lucide-react";
import api from "@/lib/axios";
import { API_PATHS } from "@/lib/apiPaths";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState({
    testsTaken: 0,
    highestScore: 0,
    streak: 0,
  });
  const [userResults, setUserResults] = useState([]);
  const [sortOption, setSortOption] = useState("newest");

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const testsRes = await api.get(API_PATHS.TESTS);
        const testsData = testsRes.data;
        setTests(testsData.tests || []);

        if (session) {
          // Fetch user specific stats
          const statsRes = await api.get(API_PATHS.RESULTS);
          const statsData = statsRes.data;
          // Simplified stat calc from results
          if (statsData.results) {
            setUserResults(statsData.results);
            setUserStats({
              testsTaken: statsData.results.length,
              highestScore: Math.max(0, ...statsData.results.map((r: any) => r.score)),
              streak: statsData.streak || 0,
            });
          }
        }
      } catch (e) {
        console.error("Failed to load dashboard data", e);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [session]);

  if (status === "loading") {
    return <Loading />;
  }
  if (status === "unauthenticated" || !session) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Image src={logo} alt="SATTOT Logo" width={32} height={32} className="rounded object-contain" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">SATTOT</h1>
          </div>
          <div className="space-x-4">
            <Link href="/auth" className="text-slate-600 hover:text-slate-900 font-medium">
              Log in
            </Link>
            <Link
              href="/auth"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
            >
              Sign up free
            </Link>
          </div>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center text-center px-4">
          <h2 className="text-5xl font-extrabold text-slate-900 tracking-tight max-w-3xl mb-6 leading-tight">
            Master the Digital SAT with Realistic Practice
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mb-10">
            Experience the exact same interface, tools, and testing environment you'll face on test day. Track your progress and pinpoint weaknesses.
          </p>
          <Link
            href="/auth"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all"
          >
            Start Your First Practice Test
          </Link>
        </main>
      </div>
    );
  }

  // Dashboard for logged in user
  return (
    <div className="min-h-screen bg-slate-50 pb-12">


      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* User Stats Panel */}
        <section className="mb-10">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Your Progress</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6 flex items-center">
              <div className="bg-blue-100 p-3 rounded-lg mr-4">
                <Trophy className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Highest Score</p>
                <p className="text-2xl font-bold text-slate-900">
                  {userStats.highestScore > 0 ? userStats.highestScore : "—"}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col justify-center">
              <div className="flex items-center mb-2">
                <div className="bg-orange-100 p-2 sm:p-3 rounded-lg mr-3 sm:mr-4">
                  <Flame className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-slate-500">Activity (30 Days)</p>
                </div>
              </div>
              <div className="w-full mt-auto">
                {userResults.length > 0 ? (
                  <ActivityHeatmap results={userResults} />
                ) : (
                  <p className="text-[10px] text-slate-400 mt-2 text-center">Complete a test to see activity.</p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6 flex items-center">
              <div className="bg-emerald-100 p-3 rounded-lg mr-4">
                <Target className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Tests Completed</p>
                <p className="text-2xl font-bold text-slate-900">{userStats.testsTaken}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Test Library */}
        <section>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b border-transparent">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-slate-900">Practice Test Library</h2>
              {loading && <span className="text-sm text-slate-500 animate-pulse">Syncing...</span>}
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="sort-tests" className="text-sm font-medium text-slate-600">Sort by:</label>
              <select
                id="sort-tests"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="bg-white border border-slate-300 text-slate-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 outline-none"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="title_asc">Title (A-Z)</option>
                <option value="title_desc">Title (Z-A)</option>
              </select>
            </div>
          </div>

          {loading ? (
            <Loading />
          ) : tests.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-slate-200 border-dashed">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900">No tests available yet</h3>
              <p className="text-slate-500 mt-1">Check back later or contact an administrator.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...tests].sort((a: any, b: any) => {
                switch (sortOption) {
                  case "title_asc":
                    return a.title.localeCompare(b.title);
                  case "title_desc":
                    return b.title.localeCompare(a.title);
                  case "oldest":
                    return String(a._id).localeCompare(String(b._id));
                  case "newest":
                  default:
                    return String(b._id).localeCompare(String(a._id));
                }
              }).map((test: any) => (
                <TestCard key={test._id} test={test} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
