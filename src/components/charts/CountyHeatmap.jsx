/* eslint-disable react/prop-types */
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { motion } from 'framer-motion';

const CountyHeatmap = ({ data }) => {
  const COLORS = ['#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8', '#1e40af', '#1e3a8a'];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">EV Distribution by County</h3>
          <p className="text-sm text-gray-600">Geographic concentration analysis</p>
        </div>
        <div className="flex items-center space-x-2 mt-2 sm:mt-0">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-sm bg-blue-200 mr-1"></div>
            <span className="text-xs text-gray-500">Low</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-sm bg-blue-600 mr-1"></div>
            <span className="text-xs text-gray-500">High</span>
          </div>
        </div>
      </div>
      
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 20, right: 30, left: 100, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
            <XAxis type="number" />
            <YAxis 
              type="category" 
              dataKey="county" 
              width={90}
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              formatter={(value) => [`${value} vehicles`, 'Count']}
              labelFormatter={(label) => `County: ${label}`}
              contentStyle={{ 
                borderRadius: '8px',
                border: 'none',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}
            />
            <Bar dataKey="count" radius={[0, 4, 4, 0]}>
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]}
                  opacity={0.8}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {data.slice(0, 4).map((county, index) => (
          <div key={county.county} className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium truncate">{county.county}</span>
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              ></div>
            </div>
            <div className="flex items-baseline">
              <span className="text-lg font-bold">{county.count.toLocaleString()}</span>
              <span className="text-xs text-gray-500 ml-1">vehicles</span>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default CountyHeatmap;