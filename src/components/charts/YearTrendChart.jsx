/* eslint-disable react/prop-types */
 import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion'; 

const YearTrendChart = ({ data }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm"
    >
      <h3 className="text-lg font-semibold mb-4">EV Adoption Over Years</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="year" 
              tick={{ fontSize: 12 }}
            />
            <YAxis />
            <Tooltip 
              formatter={(value) => [`${value} vehicles`, 'Count']}
              labelFormatter={(label) => `Year: ${label}`}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="count" 
              stroke="#10b981" 
              strokeWidth={2}
              name="Vehicles Registered"
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default YearTrendChart;