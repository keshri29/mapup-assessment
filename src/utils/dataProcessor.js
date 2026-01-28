import Papa from 'papaparse';
import EVData from '../data/Electric_Vehicle_Population_Data.csv?raw';

export const processEVData = () => {
  const results = Papa.parse(EVData, {
    header: true,
    skipEmptyLines: true
  });
  
   const data = results.data.map(item => ({
    vin: item['VIN (1-10)'],
    county: item.County,
    city: item.City,
    state: item.State,
    postalCode: item['Postal Code'],
    modelYear: parseInt(item['Model Year']) || 0,
    make: item.Make,
    model: item.Model,
    evType: item['Electric Vehicle Type'],
    cafvEligibility: item['Clean Alternative Fuel Vehicle (CAFV) Eligibility'],
    electricRange: parseInt(item['Electric Range']) || 0,
    baseMSRP: parseInt(item['Base MSRP']) || 0,
    legislativeDistrict: item['Legislative District'],
    vehicleLocation: item['Vehicle Location'],
    electricUtility: item['Electric Utility'],
    censusTract: item['2020 Census Tract']
  }));

  return data;
};

 export const getDashboardStats = (data) => {
  const totalEVs = data.length;
  const totalMakes = new Set(data.map(d => d.make)).size;
  const totalModels = new Set(data.map(d => d.model)).size;
  const totalCounties = new Set(data.map(d => d.county)).size;
  
  const ranges = data.map(d => d.electricRange).filter(r => r > 0);
  const averageRange = Math.round(ranges.reduce((sum, r) => sum + r, 0) / ranges.length);
  
  const recentYear = Math.max(...data.map(d => d.modelYear));
  const oldestYear = Math.min(...data.map(d => d.modelYear));
  
  const bevCount = data.filter(d => d.evType.includes('Battery Electric')).length;
  const phevCount = data.filter(d => d.evType.includes('Plug-in Hybrid')).length;
  const bevPercentage = Math.round((bevCount / totalEVs) * 100);
  
 
  const years = data.reduce((acc, item) => {
    const year = item.modelYear;
    if (year > 2010) {
      acc[year] = (acc[year] || 0) + 1;
    }
    return acc;
  }, {});
  
  const sortedYears = Object.keys(years).sort((a, b) => a - b);
  let yoyGrowth = 0;
  if (sortedYears.length > 1) {
    const recentCount = years[sortedYears[sortedYears.length - 1]];
    const previousCount = years[sortedYears[sortedYears.length - 2]];
    yoyGrowth = Math.round(((recentCount - previousCount) / previousCount) * 100);
  }
   
  const countyCounts = data.reduce((acc, item) => {
    const county = item.county || 'Unknown';
    acc[county] = (acc[county] || 0) + 1;
    return acc;
  }, {});
  
  const topCounty = Object.entries(countyCounts)
    .sort((a, b) => b[1] - a[1])[0];
  
  return {
    totalEVs,
    totalMakes,
    totalModels,
    totalCounties,
    averageRange,
    recentYear,
    oldestYear,
    bevPercentage,
    bevCount,
    phevCount,
    yoyGrowth,
    topCounty: {
      name: topCounty[0],
      count: topCounty[1],
      percentage: Math.round((topCounty[1] / totalEVs) * 100)
    }
  };
};

export const getTopMakes = (data, limit = 10) => {
  const makeCounts = data.reduce((acc, item) => {
    acc[item.make] = (acc[item.make] || 0) + 1;
    return acc;
  }, {});
  
  return Object.entries(makeCounts)
    .map(([make, count]) => ({ 
      make, 
      count,
      percentage: Math.round((count / data.length) * 100)
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
};

export const getYearlyTrend = (data) => {
  const yearCounts = data.reduce((acc, item) => {
    const year = item.modelYear;
    if (year > 2010) {
      acc[year] = (acc[year] || 0) + 1;
    }
    return acc;
  }, {});
  
  return Object.entries(yearCounts)
    .map(([year, count]) => ({ 
      year: parseInt(year), 
      count,
      growth: 0  
    }))
    .sort((a, b) => a.year - b.year)
    .map((item, index, array) => {
      if (index > 0) {
        const prevCount = array[index - 1].count;
        item.growth = Math.round(((item.count - prevCount) / prevCount) * 100);
      }
      return item;
    });
};

export const getEVTypeDistribution = (data) => {
  const typeCounts = data.reduce((acc, item) => {
    const type = item.evType;
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});
  
  return Object.entries(typeCounts).map(([type, count]) => ({
    type: type.replace('Electric Vehicle (', '').replace(')', ''),
    count,
    percentage: Math.round((count / data.length) * 100)
  }));
};

export const getRangeDistribution = (data) => {
  const ranges = data.map(d => d.electricRange).filter(r => r > 0);
  const bins = {
    '0-50': 0,
    '51-100': 0,
    '101-150': 0,
    '151-200': 0,
    '201-250': 0,
    '251-300': 0,
    '301+': 0
  };
  
  ranges.forEach(range => {
    if (range <= 50) bins['0-50']++;
    else if (range <= 100) bins['51-100']++;
    else if (range <= 150) bins['101-150']++;
    else if (range <= 200) bins['151-200']++;
    else if (range <= 250) bins['201-250']++;
    else if (range <= 300) bins['251-300']++;
    else bins['301+']++;
  });
  
  return Object.entries(bins).map(([range, count]) => ({
    range,
    count,
    percentage: Math.round((count / ranges.length) * 100)
  }));
};

export const getCountyAnalysis = (data, limit = 15) => {
  const countyData = data.reduce((acc, item) => {
    const county = item.county || 'Unknown';
    if (!acc[county]) {
      acc[county] = {
        count: 0,
        bevCount: 0,
        phevCount: 0,
        avgRange: 0,
        makes: new Set(),
        totalRange: 0
      };
    }
    
    acc[county].count++;
    if (item.evType.includes('Battery Electric')) {
      acc[county].bevCount++;
    } else {
      acc[county].phevCount++;
    }
    acc[county].makes.add(item.make);
    if (item.electricRange > 0) {
      acc[county].totalRange += item.electricRange;
    }
    
    return acc;
  }, {});
  
  return Object.entries(countyData)
    .map(([county, stats]) => ({
      county,
      count: stats.count,
      bevPercentage: Math.round((stats.bevCount / stats.count) * 100),
      uniqueMakes: stats.makes.size,
      avgRange: Math.round(stats.totalRange / (stats.count - (stats.count - stats.bevCount - stats.phevCount)))
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
};

export const getTopModels = (data, limit = 10) => {
  const modelCounts = data.reduce((acc, item) => {
    const key = `${item.make} ${item.model}`;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  
  return Object.entries(modelCounts)
    .map(([model, count]) => ({ 
      model, 
      count,
      make: model.split(' ')[0]
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
};

export const getAIIinsights = (data, stats, topMakes, yearlyTrend) => {
  const insights = [];
   
  if (yearlyTrend.length > 1) {
    const latestYear = yearlyTrend[yearlyTrend.length - 1]; 
    const growthRate = latestYear.growth;
    
    insights.push({
      type: 'trend',
      text: `EV adoption grew by ${growthRate}% in ${latestYear.year}, showing ${growthRate > 20 ? 'accelerating' : 'steady'} growth trends.`,
      importance: 'high'
    });
  }
   
  const top3Share = topMakes.slice(0, 3).reduce((sum, make) => sum + make.percentage, 0);
  if (top3Share > 60) {
    insights.push({
      type: 'market',
      text: `Market is highly concentrated with top 3 brands (${topMakes[0].make}, ${topMakes[1].make}, ${topMakes[2].make}) holding ${top3Share}% share.`,
      importance: 'medium'
    });
  }
   
  if (stats.averageRange > 200) {
    insights.push({
      type: 'technology',
      text: `Average EV range of ${stats.averageRange} miles indicates significant battery technology advancements.`,
      importance: 'medium'
    });
  }
   
  if (stats.topCounty.percentage > 30) {
    insights.push({
      type: 'geography',
      text: `${stats.topCounty.name} county leads with ${stats.topCounty.percentage}% of all EV registrations.`,
      importance: 'high'
    });
  }
   
  if (stats.bevPercentage > 70) {
    insights.push({
      type: 'preference',
      text: `Strong preference for Battery EVs (${stats.bevPercentage}%) over Plug-in Hybrids indicates charging infrastructure confidence.`,
      importance: 'high'
    });
  }
  
  return insights;
};