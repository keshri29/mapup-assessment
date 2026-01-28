/* eslint-disable react/prop-types */
 import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion'; 

const MakeDistributionChart = ({ data }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm"
    >
      <h3 className="text-lg font-semibold mb-4">Top EV Makes by Count</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="make" 
              angle={-45}
              textAnchor="end"
              height={70}
              tick={{ fontSize: 12 }}
            />
            <YAxis />
            <Tooltip 
              formatter={(value) => [`${value} vehicles`, 'Count']}
              labelStyle={{ fontWeight: 'bold' }}
            />
            <Legend />
            <Bar 
              dataKey="count" 
              fill="#3b82f6" 
              name="Number of Vehicles"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default MakeDistributionChart;