/* eslint-disable react/prop-types */
import  { useState } from 'react';
import { Car, Battery, Menu, X  } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Header = ({ stats, lastUpdated }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16"> 
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
            
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg">
                <Car className="text-black"  size={32}/>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-gray-900">EV Analytics Dashboard</h1> 
              </div>
            </div>
          </div> 
 
          <div className="flex items-center space-x-4"> 
            <div className="hidden md:block text-right">
              <p className="text-xs text-gray-500">Last updated</p>
              <p className="text-sm font-medium">{lastUpdated || 'Just now'}</p>
            </div>
 
            {stats && (
              <div className="hidden lg:flex items-center space-x-3">
                <div className="flex items-center space-x-1 px-3 py-1 bg-blue-50 rounded-full">
                  <Car className="w-3 h-3 text-blue-600" />
                  <span className="text-xs font-medium">{stats.totalEVs?.toLocaleString() || 0}</span>
                </div>
                <div className="flex items-center space-x-1 px-3 py-1 bg-green-50 rounded-full">
                  <Battery className="w-3 h-3 text-green-600" />
                  <span className="text-xs font-medium">{stats.bevPercentage || 0}%</span>
                </div>
              </div>
            )} 
          </div>
        </div>
      </div>
 
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-gray-200 bg-white"
          >
            <div className="px-4 py-3 space-y-3">
              <a href="#overview" className="block py-2 text-sm font-medium text-gray-700 hover:text-blue-600">
                Overview
              </a>
              <a href="#analytics" className="block py-2 text-sm font-medium text-gray-700 hover:text-blue-600">
                Analytics
              </a>
              <a href="#insights" className="block py-2 text-sm font-medium text-gray-700 hover:text-blue-600">
                Insights
              </a>
              <a href="#data" className="block py-2 text-sm font-medium text-gray-700 hover:text-blue-600">
                Data
              </a>
              
              <div className="pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-2">Quick Stats</p>
                {stats && (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-xs text-gray-600">Total EVs</p>
                      <p className="text-lg font-bold">{stats.totalEVs?.toLocaleString()}</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-xs text-gray-600">BEV %</p>
                      <p className="text-lg font-bold">{stats.bevPercentage}%</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;