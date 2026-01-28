/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import {
  Car,
  Battery,
  Shield,
  Zap,
  Users,
  BarChart3,
  PieChart,
  Map,
} from "lucide-react";
import { motion } from "framer-motion";

import {
  processEVData,
  getDashboardStats,
  getTopMakes,
  getYearlyTrend,
  getEVTypeDistribution,
  getRangeDistribution,
  getCountyAnalysis,
  getTopModels,
  getAIIinsights,
} from "./utils/dataProcessor";

import AIInsightsPanel from "./components/ai/AIInsightsPanel";
import StatCard from "./components/cards/StatCard";
import MakeDistributionChart from "./components/charts/MakeDistributionChart";
import YearTrendChart from "./components/charts/YearTrendChart";
import EVTypeChart from "./components/charts/EVTypeChart";
import RangeChart from "./components/charts/RangeChart";
import CountyHeatmap from "./components/charts/CountyHeatmap";
import InteractiveTable from "./components/data/InteractiveTable";
import Header from "./components/layout/Header";
import WorldMap from "./components/World";

function App() {
  const [evData, setEvData] = useState([]);
  const [stats, setStats] = useState(null);
  const [topMakes, setTopMakes] = useState([]);
  const [yearlyTrend, setYearlyTrend] = useState([]);
  const [evTypeData, setEvTypeData] = useState([]);
  const [rangeData, setRangeData] = useState([]);
  const [countyData, setCountyData] = useState([]);
  const [, setTopModels] = useState([]);
  const [, setAiInsights] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeView, setActiveView] = useState("overview");
  const [lastUpdated] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const loadData = () => {
      try {
        const data = processEVData();
        setEvData(data);
        const dashboardStats = getDashboardStats(data);
        setStats(dashboardStats);
        setTopMakes(getTopMakes(data));
        setYearlyTrend(getYearlyTrend(data));
        setEvTypeData(getEVTypeDistribution(data));
        setRangeData(getRangeDistribution(data));
        setCountyData(getCountyAnalysis(data));
        setTopModels(getTopModels(data));
        setAiInsights(
          getAIIinsights(data, dashboardStats, topMakes, yearlyTrend),
        );
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="relative h-28 w-72 overflow-hidden">
          <div className="absolute bottom-2 h-2 w-full overflow-hidden rounded-full bg-gray-300">
            <div className="road-lines absolute inset-0"></div>
          </div>
          <div className="car absolute bottom-6 left-1/2 -translate-x-1/2">
            <div className="relative h-8 w-16 rounded-xl bg-blue-600 shadow-lg">
              <div className="absolute right-2 top-1 h-3 w-6 rounded bg-blue-200 opacity-80"></div>
              <div className="glow absolute right-[-6px] top-3 h-2 w-3 rounded-r-full bg-blue-300"></div>
              <div className="wheel left-1"></div>
              <div className="wheel right-1"></div>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-lg font-medium text-gray-700">
            Loading EV Analytics Dashboard
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Processing {evData.length || 0} vehicle records…
          </p>
        </div>
      </div>
    );
  }

  const views = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "analytics", label: "Analytics", icon: PieChart },
    { id: "geography", label: "Geography", icon: Map },
    { id: "data", label: "Raw Data", icon: Users },
  ];

  const renderViewContent = () => {
    switch (activeView) {
      case "overview":
        return (
          <>
            <AIInsightsPanel
              stats={stats}
              topMakes={topMakes}
              yearlyTrend={yearlyTrend}
              countyData={countyData}
              rangeData={rangeData}
            />
            <WorldMap />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                  title="Total EVs"
                  value={stats.totalEVs.toLocaleString()}
                  icon={Car}
                  color="blue"
                  description="Registered electric vehicles"
                  trend={
                    stats.yoyGrowth > 0 ? `+${stats.yoyGrowth}% YoY` : null
                  }
                />
                <StatCard
                  title="Unique Makes"
                  value={stats.totalMakes}
                  icon={Shield}
                  color="green"
                  description="Different manufacturers"
                />
                <StatCard
                  title="Avg Range"
                  value={`${stats.averageRange} mi`}
                  icon={Battery}
                  color="purple"
                  description="Average electric range"
                  trend={stats.averageRange > 200 ? "High Range" : null}
                />
                <StatCard
                  title="BEV Percentage"
                  value={`${stats.bevPercentage}%`}
                  icon={Zap}
                  color="orange"
                  description="Battery Electric Vehicles"
                />
              </div>
            </motion.div>

            <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
              <MakeDistributionChart data={topMakes} />
              <YearTrendChart data={yearlyTrend} />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <EVTypeChart data={evTypeData} />
              <RangeChart data={rangeData} />
            </div>
          </>
        );

      case "analytics":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <MakeDistributionChart data={topMakes} />
              <EVTypeChart data={evTypeData} />
            </div>
            <RangeChart data={rangeData} />
            <YearTrendChart data={yearlyTrend} />
          </div>
        );

      case "geography":
        return (
          <div className="space-y-6">
            <CountyHeatmap data={countyData} />
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <EVTypeChart data={evTypeData} />
              <RangeChart data={rangeData} />
            </div>
          </div>
        );

      case "data":
        return <InteractiveTable data={evData} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50">
      <Header stats={stats} lastUpdated={lastUpdated} />

      <div className="border-b border-gray-200 bg-white lg:hidden">
        <div className="mx-auto px-6">
          <div className="flex space-x-1 overflow-x-auto py-2">
            {views.map((view) => {
              const Icon = view.icon;
              const isActive = activeView === view.id;

              return (
                <button
                  key={view.id}
                  onClick={() => setActiveView(view.id)}
                  className={`flex flex-shrink-0 items-center space-x-2 rounded px-4 py-2 transition-all ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{view.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="hidden border-b border-gray-200 bg-white lg:block">
        <div className="container mx-auto px-6">
          <div className="flex space-x-1">
            {views.map((view) => {
              const Icon = view.icon;
              const isActive = activeView === view.id;

              return (
                <button
                  key={view.id}
                  onClick={() => setActiveView(view.id)}
                  className={`flex items-center space-x-2 border-b-2 px-6 py-3 transition-all ${
                    isActive
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-600 hover:border-gray-300 hover:text-gray-900"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="font-medium">{view.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <main className="mx-auto px-4 py-6 sm:px-6 sm:py-8">
        {renderViewContent()}
      </main>

      <footer className="bg-gradient-to-r from-gray-900 to-gray-800 text-white">
        <div className="mx-auto px-6 py-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            <div>
              <h3 className="mb-4 text-lg font-bold">EV Analytics</h3>
              <p className="text-sm text-gray-300">
                Advanced analytics platform for electric vehicle population
                data. Providing insights for policymakers, researchers, and
                enthusiasts.
              </p>
            </div>

            <div>
              <h4 className="mb-4 font-semibold">Quick Stats</h4>
              {stats && (
                <ul className="space-y-2 text-sm">
                  <li className="flex justify-between">
                    <span className="text-gray-400">Total Vehicles:</span>
                    <span className="font-medium">
                      {stats.totalEVs.toLocaleString()}
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-400">Top County:</span>
                    <span className="font-medium">{stats.topCounty.name}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-400">Avg Range:</span>
                    <span className="font-medium">{stats.averageRange} mi</span>
                  </li>
                </ul>
              )}
            </div>

            <div>
              <h4 className="mb-4 font-semibold">Data Sources</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• Washington State EV Registry</li>
                <li>• Kaggle Dataset</li>
                <li>• Real-time Updates</li>
              </ul>
            </div>

            <div>
              <h4 className="mb-4 font-semibold">Powered By</h4>
              <div className="flex items-center space-x-3">
                <div className="rounded-lg bg-white/10 p-2">
                  <Car className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-bold">MapUp Analytics</p>
                  <p className="text-xs text-gray-300">
                    © 2024 All rights reserved
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-gray-700 pt-8 text-center text-sm text-gray-400">
            <p>
              This dashboard is created for assessment purposes. Data is updated
              regularly.
            </p>
            <p className="mt-2">Dashboard v1.0 • Last updated: {lastUpdated}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
