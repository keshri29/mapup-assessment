/* eslint-disable react/prop-types */
import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe,
  Zap,
  Car,
  Battery,
  Users,
  TrendingUp,
  MapPin,
  X,
  ChevronRight,
  BarChart3,
  Download,
} from "lucide-react";
import * as d3 from "d3";
import { geoNaturalEarth1, geoPath } from "d3-geo";
import { feature } from "topojson-client";

const WorldMap = ({ data }) => {
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [mapData, setMapData] = useState(null);
  const [hoveredCountry, setHoveredCountry] = useState(null);
  const [viewMode, setViewMode] = useState("total");
  const [selectedRegion, setSelectedRegion] = useState("all");
  const countryData = useMemo(() => {
    if (!data) return {};
    const aggregated = {};
    data.forEach((vehicle) => {
      const country = getCountryFromState(vehicle.state);
      if (!aggregated[country]) {
        aggregated[country] = {
          total: 0,
          bev: 0,
          phev: 0,
          averageRange: 0,
          eligible: 0,
          rangeSum: 0,
          years: new Set(),
          byYear: {},
          states: new Set(),
        };
      }
      aggregated[country].total += 1;
      aggregated[country].states.add(vehicle.state);
      if (vehicle.evType.includes("Battery")) {
        aggregated[country].bev += 1;
      } else {
        aggregated[country].phev += 1;
      }
      if (vehicle.cafvEligibility?.includes("Eligible")) {
        aggregated[country].eligible += 1;
      }

      if (vehicle.electricRange > 0) {
        aggregated[country].rangeSum += vehicle.electricRange;
      }

      aggregated[country].years.add(vehicle.modelYear);
      if (!aggregated[country].byYear[vehicle.modelYear]) {
        aggregated[country].byYear[vehicle.modelYear] = 0;
      }
      aggregated[country].byYear[vehicle.modelYear] += 1;
    });
    Object.keys(aggregated).forEach((country) => {
      aggregated[country].averageRange =
        aggregated[country].rangeSum / aggregated[country].total;
      aggregated[country].growth = calculateGrowthRate(
        aggregated[country].byYear,
      );
    });

    return aggregated;
  }, [data]);

  console.log(data,"countryDatacountryData");

   useEffect(() => {
    fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
      .then((response) => response.json())
      .then((worldData) => {
        const countries = feature(worldData, worldData.objects.countries);
        setMapData(countries);
      })
      .catch((error) => console.error("Error loading map data:", error));
  }, []);

   const getColorScale = useMemo(() => {
    const values = Object.values(countryData).map((d) => {
      if (viewMode === "total") return d.total;
      if (viewMode === "density") return d.total / d.states.size;  
      if (viewMode === "growth") return d.growth;
      return d.total;
    });

    const maxValue = Math.max(...values.filter((v) => !isNaN(v)));

    return d3
      .scaleSequential(d3.interpolateBlues)
      .domain([0, maxValue])
      .clamp(true);
  }, [countryData, viewMode]);

   const globalStats = useMemo(() => {
    const totalEVs = Object.values(countryData).reduce(
      (sum, d) => sum + d.total,
      0,
    );
    const totalCountries = Object.keys(countryData).length;
    const avgRange =
      Object.values(countryData).reduce((sum, d) => sum + d.averageRange, 0) /
      totalCountries;
    const bevPercentage = (
      (Object.values(countryData).reduce((sum, d) => sum + d.bev, 0) /
        totalEVs) *
      100
    ).toFixed(1);

    return {
      totalEVs,
      totalCountries,
      avgRange: avgRange.toFixed(0),
      bevPercentage,
      topCountries: Object.entries(countryData)
        .sort((a, b) => b[1].total - a[1].total)
        .slice(0, 5)
        .map(([country, data]) => ({ country, ...data })),
    };
  }, [countryData]);
  

   const filterByRegion = (countryId) => {
    const regions = {
      na: ["USA", "Canada", "Mexico"],
      eu: [
        "Germany",
        "France",
        "UK",
        "Italy",
        "Spain",
        "Netherlands",
        "Norway",
        "Sweden",
      ],
      asia: ["China", "Japan", "South Korea", "India", "Australia"],
    };

    if (selectedRegion === "all") return true;
    if (selectedRegion === "na" && regions.na.includes(countryId)) return true;
    if (selectedRegion === "eu" && regions.eu.includes(countryId)) return true;
    if (selectedRegion === "asia" && regions.asia.includes(countryId))
      return true;
    return false;
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
       <div className="border-b border-gray-200 p-6">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div className="flex items-center space-x-3">
            <div className="rounded-xl bg-blue-100 p-2">
              <Globe className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                Global EV Distribution
              </h3>
              <p className="text-gray-600">
                Visualizing {globalStats.totalEVs.toLocaleString()} EVs across{" "}
                {globalStats.totalCountries} countries
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => { 
                const csv = convertToCSV(countryData);
                downloadCSV(csv, "global-ev-data.csv");
              }}
              className="flex items-center space-x-2 rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50"
            >
              <Download className="h-5 w-5" />
              <span className="hidden sm:inline">Export Data</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row"> 
        <div className="border-r border-gray-200 p-4 md:p-6 lg:w-2/3"> 
          <div className="mb-6">
            <div className="mb-4 flex flex-wrap gap-3">
              <button
                onClick={() => setViewMode("total")}
                className={`flex items-center space-x-2 rounded-lg px-4 py-2 ${
                  viewMode === "total"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <Users className="h-5 w-5" />
                <span>Total EVs</span>
              </button>

              <button
                onClick={() => setViewMode("density")}
                className={`flex items-center space-x-2 rounded-lg px-4 py-2 ${
                  viewMode === "density"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <BarChart3 className="h-5 w-5" />
                <span>Density</span>
              </button>

              <button
                onClick={() => setViewMode("growth")}
                className={`flex items-center space-x-2 rounded-lg px-4 py-2 ${
                  viewMode === "growth"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <TrendingUp className="h-5 w-5" />
                <span>Growth</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setSelectedRegion("all")}
                className={`rounded-lg px-3 py-1.5 ${
                  selectedRegion === "all"
                    ? "bg-gray-800 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                All Regions
              </button>
              <button
                onClick={() => setSelectedRegion("na")}
                className={`rounded-lg px-3 py-1.5 ${
                  selectedRegion === "na"
                    ? "bg-gray-800 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                North America
              </button>
              <button
                onClick={() => setSelectedRegion("eu")}
                className={`rounded-lg px-3 py-1.5 ${
                  selectedRegion === "eu"
                    ? "bg-gray-800 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Europe
              </button>
              <button
                onClick={() => setSelectedRegion("asia")}
                className={`rounded-lg px-3 py-1.5 ${
                  selectedRegion === "asia"
                    ? "bg-gray-800 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Asia Pacific
              </button>
            </div>
          </div>
 
          <div className="relative min-h-[500px] rounded-xl border border-gray-200 bg-gray-50">
            {mapData ? (
              <svg
                width="100%"
                height="500"
                viewBox="0 0 1000 500"
                className="rounded-xl"
              >
                <g transform="scale(1.8) translate(100, 300)">
                  {mapData.features.map((feature, i) => {
                    const countryId = feature.properties.name;
                    const countryStats = countryData[countryId];
                    const shouldShow = filterByRegion(countryId);

                    return (
                      <g key={i}>
                        <path
                          d={geoPath().projection(geoNaturalEarth1())(feature)}
                          fill={
                            countryStats && shouldShow
                              ? getColorScale(
                                  viewMode === "total"
                                    ? countryStats.total
                                    : viewMode === "density"
                                      ? countryStats.total /
                                        countryStats.states.size
                                      : countryStats.growth || 0,
                                )
                              : "#f3f4f6"
                          }
                          stroke="#ffffff"
                          strokeWidth="0.5"
                          opacity={selectedCountry === countryId ? 1 : 0.8}
                          className={`cursor-pointer transition-all duration-200 ${
                            countryStats && shouldShow
                              ? "hover:stroke-blue-400 hover:stroke-2 hover:opacity-100"
                              : ""
                          }`}
                          onMouseEnter={() =>
                            countryStats && setHoveredCountry(countryId)
                          }
                          onMouseLeave={() => setHoveredCountry(null)}
                          onClick={() =>
                            countryStats && setSelectedCountry(countryId)
                          }
                        />
                      </g>
                    );
                  })}
                </g>
 
                <g transform="translate(20, 20)">
                  <rect
                    x="0"
                    y="0"
                    width="200"
                    height="20"
                    fill="white"
                    stroke="#e5e7eb"
                    rx="4"
                  />
                  <text x="10" y="15" fontSize="12" fill="#374151">
                    EV Distribution Scale
                  </text>
                  {[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
                    <g key={i} transform={`translate(${i * 40}, 30)`}>
                      <rect
                        width="40"
                        height="20"
                        fill={getColorScale(t * getColorScale.domain()[1])}
                      />
                      <text
                        x="20"
                        y="40"
                        textAnchor="middle"
                        fontSize="10"
                        fill="#374151"
                      >
                        {Math.round(
                          t * getColorScale.domain()[1],
                        ).toLocaleString()}
                      </text>
                    </g>
                  ))}
                </g>
              </svg>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
                  <p className="text-gray-600">Loading map data...</p>
                </div>
              </div>
            )}
 
            <AnimatePresence>
              {hoveredCountry && countryData[hoveredCountry] && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute max-w-xs rounded-xl border border-gray-200 bg-white p-4 shadow-lg"
                  style={{
                    left: "50%",
                    top: "50%",
                    transform: "translate(-50%, -100%)",
                  }}
                >
                  <div className="mb-2 flex items-center space-x-2">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    <h4 className="font-bold text-gray-900">
                      {hoveredCountry}
                    </h4>
                  </div>
                  <div className="space-y-2">
                    <StatItem
                      label="Total EVs"
                      value={countryData[hoveredCountry].total.toLocaleString()}
                    />
                    <StatItem
                      label="BEV %"
                      value={`${((countryData[hoveredCountry].bev / countryData[hoveredCountry].total) * 100).toFixed(1)}%`}
                    />
                    <StatItem
                      label="Avg Range"
                      value={`${countryData[hoveredCountry].averageRange.toFixed(0)} mi`}
                    />
                    <StatItem
                      label="States/Regions"
                      value={countryData[hoveredCountry].states.size}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
 
        <div className="p-4 md:p-6 lg:w-1/3"> 
          <div className="mb-8">
            <h4 className="mb-4 text-lg font-bold text-gray-900">
              Global Overview
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <StatCard
                icon={Car}
                label="Total EVs"
                value={globalStats.totalEVs.toLocaleString()}
                color="blue"
              />
              <StatCard
                icon={Globe}
                label="Countries"
                value={globalStats.totalCountries}
                color="green"
              />
              <StatCard
                icon={Zap}
                label="Avg Range"
                value={`${globalStats.avgRange} mi`}
                color="purple"
              />
              <StatCard
                icon={Battery}
                label="BEV Share"
                value={`${globalStats.bevPercentage}%`}
                color="orange"
              />
            </div>
          </div>
 
          {selectedCountry && countryData[selectedCountry] ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 rounded-xl bg-gray-50 p-4"
            >
              <div className="mb-4 flex items-center justify-between">
                <h4 className="text-lg font-bold text-gray-900">
                  {selectedCountry}
                </h4>
                <button
                  onClick={() => setSelectedCountry(null)}
                  className="rounded-lg p-1 hover:bg-gray-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h5 className="mb-2 text-sm font-medium text-gray-500">
                    EV Statistics
                  </h5>
                  <div className="grid grid-cols-2 gap-3">
                    <StatItem
                      label="Total Vehicles"
                      value={countryData[
                        selectedCountry
                      ].total.toLocaleString()}
                    />
                    <StatItem
                      label="BEV"
                      value={countryData[selectedCountry].bev.toLocaleString()}
                    />
                    <StatItem
                      label="PHEV"
                      value={countryData[selectedCountry].phev.toLocaleString()}
                    />
                    <StatItem
                      label="CAFV Eligible"
                      value={countryData[
                        selectedCountry
                      ].eligible.toLocaleString()}
                    />
                  </div>
                </div>

                <div>
                  <h5 className="mb-2 text-sm font-medium text-gray-500">
                    Performance
                  </h5>
                  <div className="grid grid-cols-2 gap-3">
                    <StatItem
                      label="Avg Range"
                      value={`${countryData[selectedCountry].averageRange.toFixed(0)} mi`}
                    />
                    <StatItem
                      label="Growth Rate"
                      value={`${(countryData[selectedCountry].growth * 100).toFixed(1)}%`}
                    />
                    <StatItem
                      label="States Covered"
                      value={countryData[selectedCountry].states.size}
                    />
                    <StatItem
                      label="Years Active"
                      value={countryData[selectedCountry].years.size}
                    />
                  </div>
                </div>
              </div>

              <button className="mt-4 flex w-full items-center justify-center space-x-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                <ChevronRight className="h-5 w-5" />
                <span>View Detailed Report</span>
              </button>
            </motion.div>
          ) : (
            <div className="mb-6 rounded-xl bg-gray-50 p-6 text-center">
              <MapPin className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <p className="font-medium text-gray-600">
                Click on a country to view details
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Colored regions have available data
              </p>
            </div>
          )} 
          <div>
            <h4 className="mb-4 text-lg font-bold text-gray-900">
              Top Countries by EVs
            </h4>
            <div className="space-y-3">
              {globalStats.topCountries.map((country, index) => (
                <div
                  key={country.country}
                  className={`cursor-pointer rounded-lg p-3 transition-colors ${
                    selectedCountry === country.country
                      ? "border-l-4 border-blue-600 bg-blue-50"
                      : "bg-gray-50 hover:bg-gray-100"
                  }`}
                  onClick={() => setSelectedCountry(country.country)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                        <span className="font-bold text-blue-700">
                          {index + 1}
                        </span>
                      </div>
                      <span className="font-medium text-gray-900">
                        {country.country}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-900">
                        {country.total.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {((country.bev / country.total) * 100).toFixed(1)}% BEV
                      </div>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                      <div
                        className="h-full rounded-full bg-blue-600"
                        style={{
                          width: `${(country.total / globalStats.topCountries[0].total) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

 const StatCard = ({ icon: Icon, label, value, color = "blue" }) => {
  const colorClasses = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    purple: "bg-purple-100 text-purple-600",
    orange: "bg-orange-100 text-orange-600",
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex items-center space-x-3">
        <div className={`rounded-lg p-2 ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
};

const StatItem = ({ label, value }) => (
  <div className="flex items-center justify-between">
    <span className="text-sm text-gray-600">{label}</span>
    <span className="font-medium text-gray-900">{value}</span>
  </div>
);
 
const getCountryFromState = (state) => { 
  const countryMap = {
    WA: "USA",
    CA: "USA",
    NY: "USA",
    TX: "USA",
    FL: "USA",
    IL: "USA",
    PA: "USA",
    OH: "USA",
    GA: "USA",
    NC: "USA",
    MI: "USA",
    NJ: "USA",
    VA: "USA",
    AZ: "USA",
    MA: "USA",
    TN: "USA",
    IN: "USA",
    MO: "USA",
    MD: "USA",
    WI: "USA",
    MN: "USA",
    CO: "USA",
    AL: "USA",
    SC: "USA",
    LA: "USA",
    KY: "USA",
    OR: "USA",
    OK: "USA",
    CT: "USA",
    UT: "USA",
    IA: "USA",
    NV: "USA",
    AR: "USA",
    MS: "USA",
    KS: "USA",
    NM: "USA",
    NE: "USA",
    WV: "USA",
    ID: "USA",
    HI: "USA",
    NH: "USA",
    ME: "USA",
    MT: "USA",
    RI: "USA",
    DE: "USA",
    SD: "USA",
    ND: "USA",
    AK: "USA",
    VT: "USA",
    WY: "USA",
  };
  return countryMap[state] || state;
};

const calculateGrowthRate = (byYear) => {
  const years = Object.keys(byYear)
    .map(Number)
    .sort((a, b) => a - b);
  if (years.length < 2) return 0;

  const firstYear = Math.min(...years);
  const lastYear = Math.max(...years);
  const firstCount = byYear[firstYear] || 0;
  const lastCount = byYear[lastYear] || 0;

  if (firstCount === 0) return 0;
  return (lastCount - firstCount) / firstCount;
};

const convertToCSV = (countryData) => {
  const headers = [
    "Country",
    "Total EVs",
    "BEV Count",
    "PHEV Count",
    "BEV Percentage",
    "Average Range",
    "Growth Rate",
    "States Covered",
  ];
  const rows = Object.entries(countryData).map(([country, data]) => [
    country,
    data.total,
    data.bev,
    data.phev,
    ((data.bev / data.total) * 100).toFixed(2),
    data.averageRange.toFixed(0),
    (data.growth * 100).toFixed(2),
    data.states.size,
  ]);

  return [headers, ...rows].map((row) => row.join(",")).join("\n");
};

const downloadCSV = (csvContent, fileName) => {
  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  window.URL.revokeObjectURL(url);
};

export default WorldMap;