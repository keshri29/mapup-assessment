/* eslint-disable react/prop-types */
 import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
 
const EVTypeChart = ({ data }) => {
  const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444'];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm"
    >
      <h3 className="text-lg font-semibold mb-4">Electric Vehicle Type Distribution</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ type, percentage }) => `${type}: ${percentage}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="count"
              nameKey="type"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value, name, props) => [
                `${value} vehicles (${props.payload.percentage}%)`,
                props.payload.type
              ]}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default EVTypeChart;