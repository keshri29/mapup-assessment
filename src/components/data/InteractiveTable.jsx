/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */
import { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  ChevronUp, 
  ChevronDown, 
  Download, 
  MapPin,
  Car,
  Battery,
  DollarSign,
  Building,
  Navigation,
  Zap,
  X
} from 'lucide-react';

const InteractiveTable = ({ data }) => {
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnFilters, setColumnFilters] = useState([]);
  const [sorting, setSorting] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState({
    make: true,
    model: true,
    modelYear: true,
    evType: true,
    electricRange: true,
    county: true,
    cafvEligibility: true,
    city: true,
    state: true,
    electricUtility: true,
    baseMSRP: true,
    legislativeDistrict: true
  });

  const columnHelper = createColumnHelper();

  const columns = useMemo(
    () => [
      columnHelper.accessor('make', {
        header: 'Make',
        cell: ({ getValue }) => (
          <div className="flex items-center space-x-2">
            <Car className="w-4 h-4 text-gray-400" />
            <span className="font-semibold text-gray-900">{getValue()}</span>
          </div>
        ),
        enableHiding: false,
      }),
      columnHelper.accessor('model', {
        header: 'Model',
        cell: ({ getValue }) => (
          <span className="text-gray-700">{getValue()}</span>
        ),
      }),
      columnHelper.accessor('modelYear', {
        header: 'Year',
        cell: ({ getValue }) => {
          const year = getValue();
          const currentYear = new Date().getFullYear();
          const age = currentYear - year;
          
          let color = 'bg-gray-100 text-gray-800';
          if (age <= 2) color = 'bg-green-100 text-green-800';
          else if (age <= 5) color = 'bg-blue-100 text-blue-800';
          else if (age <= 10) color = 'bg-yellow-100 text-yellow-800';
          
          return (
            <span className={`px-3 py-1.5 text-sm rounded-full font-medium ${color}`}>
              {year}
            </span>
          );
        },
      }),
      columnHelper.accessor('evType', {
        header: 'Type',
        cell: ({ getValue }) => {
          const type = getValue();
          const isBEV = type.includes('Battery');
          return (
            <div className="flex items-center space-x-2">
              <Battery className={`w-4 h-4 ${isBEV ? 'text-blue-500' : 'text-green-500'}`} />
              <span className={`px-3 py-1.5 text-sm rounded-full font-medium ${
                isBEV ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
              }`}>
                {isBEV ? 'BEV' : 'PHEV'}
              </span>
            </div>
          );
        },
      }),
      columnHelper.accessor('electricRange', {
        header: 'Range (mi)',
        cell: ({ getValue }) => {
          const range = getValue();
          let color = 'text-gray-600';
          let bgColor = 'bg-gray-50';
          if (range > 250) {
            color = 'text-green-700';
            bgColor = 'bg-green-50';
          } else if (range > 150) {
            color = 'text-blue-600';
            bgColor = 'bg-blue-50';
          }
          
          return (
            <div className="flex items-center space-x-2">
              <Zap className={`w-4 h-4 ${color}`} />
              <span className={`px-3 py-1.5 rounded-lg font-semibold ${color} ${bgColor}`}>
                {range > 0 ? `${range} mi` : 'N/A'}
              </span>
            </div>
          );
        },
      }),
      columnHelper.accessor('county', {
        header: 'County',
        cell: ({ getValue }) => (
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span className="text-gray-700">{getValue()}</span>
          </div>
        ),
      }),
      columnHelper.accessor('city', {
        header: 'City',
        cell: ({ getValue }) => (
          <span className="text-gray-700">{getValue()}</span>
        ),
      }),
      columnHelper.accessor('state', {
        header: 'State',
        cell: ({ getValue }) => (
          <span className="font-medium text-gray-900">{getValue()}</span>
        ),
      }),
      columnHelper.accessor('cafvEligibility', {
        header: 'CAFV Status',
        cell: ({ getValue }) => {
          const status = getValue();
          let color = 'bg-gray-100 text-gray-800';
          let iconColor = 'text-gray-500';
          if (status.includes('Eligible')) {
            color = 'bg-green-100 text-green-800';
            iconColor = 'text-green-500';
          } else if (status.includes('Not eligible')) {
            color = 'bg-red-100 text-red-800';
            iconColor = 'text-red-500';
          } else if (status.includes('unknown')) {
            color = 'bg-yellow-100 text-yellow-800';
            iconColor = 'text-yellow-500';
          }
          
          return (
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${iconColor.replace('text-', 'bg-')}`} />
              <span className={`px-3 py-1.5 text-sm rounded-full ${color}`}>
                {status.split(' ')[0]}
              </span>
            </div>
          );
        },
      }),
      columnHelper.accessor('baseMSRP', {
        header: 'MSRP',
        cell: ({ getValue }) => {
          const msrp = getValue();
          return (
            <div className="flex items-center space-x-2">
              <DollarSign className="w-4 h-4 text-gray-400" />
              <span className="text-gray-700">
                {msrp > 0 ? `$${msrp.toLocaleString()}` : 'N/A'}
              </span>
            </div>
          );
        },
      }),
      columnHelper.accessor('electricUtility', {
        header: 'Utility',
        cell: ({ getValue }) => {
          const utility = getValue();
          return (
            <div className="max-w-[200px] truncate" title={utility}>
              <Building className="w-4 h-4 text-gray-400 inline mr-2" />
              <span className="text-gray-700">
                {utility ? utility.split('|')[0] : 'N/A'}
              </span>
            </div>
          );
        },
      }),
      columnHelper.accessor('legislativeDistrict', {
        header: 'District',
        cell: ({ getValue }) => (
          <span className="text-gray-700">{getValue()}</span>
        ),
      }),
      columnHelper.accessor('postalCode', {
        header: 'ZIP',
        cell: ({ getValue }) => (
          <span className="text-gray-700">{getValue()}</span>
        ),
      }),
    ],
    []
  );

  const table = useReactTable({
    data,
    columns: columns.filter(col => visibleColumns[col.accessorKey]),
    state: {
      globalFilter,
      columnFilters,
      sorting,
    },
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const exportCSV = () => {
    const headers = table.getAllColumns().map(col => col.columnDef.header);
    const rows = data.map(row => 
      table.getAllColumns().map(col => row[col.id] || '')
    );
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ev-registry-data.csv';
    a.click();
  };

  const RowDetailModal = ({ row, onClose }) => {
    if (!row) return null;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={e => e.stopPropagation()}
        >
          <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {row.make} {row.model}
                </h3>
                <p className="text-gray-600 mt-1">VIN: {row.vin}</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <DetailItem icon={Car} label="Vehicle" value={`${row.make} ${row.model}`} />
                <DetailItem icon={Battery} label="EV Type" value={row.evType} />
                <DetailItem icon={Zap} label="Electric Range" value={`${row.electricRange} miles`} />
                <DetailItem icon="calendar" label="Model Year" value={row.modelYear} />
              </div>
              <div className="space-y-4">
                <DetailItem icon={MapPin} label="Location" value={`${row.city}, ${row.state}`} />
                <DetailItem icon={Building} label="County" value={row.county} />
                <DetailItem icon={DollarSign} label="Base MSRP" value={row.baseMSRP > 0 ? `$${row.baseMSRP.toLocaleString()}` : 'N/A'} />
                <DetailItem icon={Navigation} label="District" value={row.legislativeDistrict} />
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-3">Additional Details</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <DetailItem label="Postal Code" value={row.postalCode} />
                <DetailItem label="Census Tract" value={row.censusTract} />
                <DetailItem label="Electric Utility" value={row.electricUtility?.split('|')[0]} />
                <DetailItem label="CAFV Eligibility" value={row.cafvEligibility} />
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  const DetailItem = ({ icon: Icon, label, value }) => (
    <div className="flex items-start space-x-3">
      {Icon && typeof Icon === 'function' && (
        <div className="p-2 bg-gray-50 rounded-lg">
          <Icon className="w-5 h-5 text-gray-600" />
        </div>
      )}
      <div className="flex-1">
        <p className="text-sm text-gray-500">{label}</p>
        <p className="font-medium text-gray-900">{value || 'N/A'}</p>
      </div>
    </div>
  );

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
      > 
        <div className="p-4 md:p-6 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-900">EV Registry Dashboard</h3>
              <p className="text-sm text-gray-600 mt-1">
                <span className="font-semibold">{data.length.toLocaleString()}</span> registered vehicles • 
                <span className="ml-2 text-green-600 font-medium">
                  {data.filter(d => d.cafvEligibility.includes('Eligible')).length} CAFV Eligible
                </span>
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search vehicles..."
                  className="pl-10 pr-4 py-3 border border-gray-300 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={globalFilter}
                  onChange={e => setGlobalFilter(e.target.value)}
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowMobileFilters(!showMobileFilters)}
                  className="lg:hidden px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 flex items-center justify-center"
                >
                  <Filter className="w-5 h-5" />
                </button>
                
                <button
                  onClick={exportCSV}
                  className="px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 flex items-center justify-center space-x-2 transition-colors"
                >
                  <Download className="w-5 h-5" />
                  <span className="hidden sm:inline">Export CSV</span>
                </button>
              </div>
            </div>
          </div>
 
          <AnimatePresence>
            {showMobileFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 overflow-hidden"
              >
                <div className="bg-gray-50 p-4 rounded-xl">
                  <h4 className="font-medium text-gray-900 mb-3">Visible Columns</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {Object.keys(visibleColumns).map(key => (
                      <label key={key} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={visibleColumns[key]}
                          onChange={(e) => setVisibleColumns(prev => ({
                            ...prev,
                            [key]: e.target.checked
                          }))}
                          className="rounded text-blue-600"
                        />
                        <span className="text-sm text-gray-700 capitalize">
                          {key.replace(/([A-Z])/g, ' $1')}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
 
        <div className="hidden lg:block p-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Show Columns:</span>
            <div className="flex flex-wrap gap-2">
              {Object.keys(visibleColumns).map(key => (
                <button
                  key={key}
                  onClick={() => setVisibleColumns(prev => ({
                    ...prev,
                    [key]: !prev[key]
                  }))}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    visibleColumns[key]
                      ? 'bg-blue-100 text-blue-700 font-medium'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  {key.replace(/([A-Z])/g, ' $1')}
                </button>
              ))}
            </div>
          </div>
        </div>
 
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 whitespace-nowrap"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center space-x-1">
                        <span>
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                        </span>
                        {{
                          asc: <ChevronUp className="w-4 h-4" />,
                          desc: <ChevronDown className="w-4 h-4" />,
                        }[header.column.getIsSorted()] ?? null}
                      </div>
                    </th>
                  ))}
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-gray-200">
              {table.getRowModel().rows.map(row => (
                <tr 
                  key={row.id} 
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => setSelectedRow(row.original)}
                >
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="px-4 py-4 whitespace-nowrap text-sm">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedRow(row.original);
                      }}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
 
        {table.getRowModel().rows.length === 0 && (
          <div className="text-center py-12 md:py-16 text-gray-500">
            <Filter className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No vehicles found</p>
            <p className="text-sm mt-1">Try adjusting your search filters</p>
          </div>
        )}
 
        <div className="px-4 md:px-6 py-4 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-sm text-gray-600">
              Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
              {Math.min(
                (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                table.getFilteredRowModel().rows.length
              )} of {table.getFilteredRowModel().rows.length.toLocaleString()} vehicles
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 font-medium"
                >
                  Previous
                </button>
                
                <div className="flex items-center space-x-1 overflow-x-auto max-w-[200px] sm:max-w-none">
                  {Array.from({ length: Math.min(5, table.getPageCount()) }, (_, i) => i + 1)
                    .map(page => (
                      <button
                        key={page}
                        onClick={() => table.setPageIndex(page - 1)}
                        className={`px-3 py-2 rounded-lg min-w-[40px] ${
                          table.getState().pagination.pageIndex === page - 1
                            ? 'bg-blue-600 text-white font-medium'
                            : 'border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  
                  {table.getPageCount() > 5 && (
                    <span className="px-2 text-gray-500">...</span>
                  )}
                </div>
                
                <button
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 font-medium"
                >
                  Next
                </button>
              </div>
              
              <select
                value={table.getState().pagination.pageSize}
                onChange={e => table.setPageSize(Number(e.target.value))}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {[10, 20, 50, 100].map(pageSize => (
                  <option key={pageSize} value={pageSize}>
                    Show {pageSize}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </motion.div>

       <AnimatePresence>
        {selectedRow && (
          <RowDetailModal 
            row={selectedRow} 
            onClose={() => setSelectedRow(null)} 
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default InteractiveTable;