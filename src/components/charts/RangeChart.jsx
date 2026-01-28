/* eslint-disable react/prop-types */
 import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion'; 

const RangeChart = ({ data }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: 0.3 }}
      className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm"
    >
      <h3 className="text-lg font-semibold mb-4">Electric Range Distribution (miles)</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="range" 
              tick={{ fontSize: 12 }}
            />
            <YAxis />
            <Tooltip 
              formatter={(value, name, props) => [
                `${value} vehicles (${props.payload.percentage}%)`,
                'Count'
              ]}
              labelFormatter={(label) => `Range: ${label} miles`}
            />
            <Legend />
            <Bar 
              dataKey="count" 
              fill="#8b5cf6" 
              name="Number of Vehicles"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default RangeChart;