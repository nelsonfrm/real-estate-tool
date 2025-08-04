'use client';

import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { exportToPDF } from '@/utils/pdfExport';

const CashFlowOptimizer = () => {
  const [occupancyRate, setOccupancyRate] = useState(92);
  const [delinquencyRate, setDelinquencyRate] = useState(4.5);
  const [totalUnits, setTotalUnits] = useState(250);
  const [avgRent, setAvgRent] = useState(1850);
  const [operatingExpenseRatio, setOperatingExpenseRatio] = useState(45);
  const [debtServiceRatio, setDebtServiceRatio] = useState(35);
  const [capexReserve, setCapexReserve] = useState(8);

  const calculations = useMemo(() => {
    const occupiedUnits = Math.round(totalUnits * (occupancyRate / 100));
    const vacantUnits = totalUnits - occupiedUnits;
    
    // Revenue calculations
    const grossRentalIncome = occupiedUnits * avgRent * 12;
    const delinquentAmount = grossRentalIncome * (delinquencyRate / 100);
    const effectiveRentalIncome = grossRentalIncome - delinquentAmount;
    
    // Operating expenses
    const operatingExpenses = grossRentalIncome * (operatingExpenseRatio / 100);
    const netOperatingIncome = effectiveRentalIncome - operatingExpenses;
    
    // Additional costs
    const debtService = grossRentalIncome * (debtServiceRatio / 100);
    const capexReserves = grossRentalIncome * (capexReserve / 100);
    
    // Cash flow and returns
    const cashFlow = netOperatingIncome - debtService - capexReserves;
    const propertyValue = netOperatingIncome / 0.06; // Assuming 6% cap rate
    const totalInvestment = propertyValue * 0.25; // Assuming 25% down payment
    const roi = (cashFlow / totalInvestment) * 100;
    const cashOnCashReturn = roi;
    
    // Monthly figures
    const monthlyCashFlow = cashFlow / 12;
    const monthlyNOI = netOperatingIncome / 12;
    
    // Vacancy impact
    const vacancyLoss = vacantUnits * avgRent * 12;
    
    return {
      occupiedUnits,
      vacantUnits,
      grossRentalIncome,
      delinquentAmount,
      effectiveRentalIncome,
      operatingExpenses,
      netOperatingIncome,
      debtService,
      capexReserves,
      cashFlow,
      monthlyCashFlow,
      monthlyNOI,
      roi,
      cashOnCashReturn,
      propertyValue,
      totalInvestment,
      vacancyLoss
    };
  }, [occupancyRate, delinquencyRate, totalUnits, avgRent, operatingExpenseRatio, debtServiceRatio, capexReserve]);

  // Generate scenario analysis data
  const scenarioData = useMemo(() => {
    const scenarios = [];
    
    // Occupancy scenarios (keeping delinquency constant)
    for (let occ = 80; occ <= 100; occ += 2) {
      const units = Math.round(totalUnits * (occ / 100));
      const income = units * avgRent * 12;
      const delinquent = income * (delinquencyRate / 100);
      const effective = income - delinquent;
      const opex = income * (operatingExpenseRatio / 100);
      const noi = effective - opex;
      const debt = income * (debtServiceRatio / 100);
      const capex = income * (capexReserve / 100);
      const cf = noi - debt - capex;
      const value = noi / 0.06;
      const investment = value * 0.25;
      const roiCalc = (cf / investment) * 100;
      
      scenarios.push({
        occupancy: occ,
        delinquency: delinquencyRate,
        cashFlow: Math.round(cf),
        noi: Math.round(noi),
        roi: Math.round(roiCalc * 10) / 10,
        type: 'occupancy'
      });
    }
    
    return scenarios;
  }, [totalUnits, avgRent, delinquencyRate, operatingExpenseRatio, debtServiceRatio, capexReserve]);

  // Generate delinquency impact data
  const delinquencyImpactData = useMemo(() => {
    const data = [];
    for (let del = 0; del <= 15; del += 1) {
      const units = Math.round(totalUnits * (occupancyRate / 100));
      const income = units * avgRent * 12;
      const delinquent = income * (del / 100);
      const effective = income - delinquent;
      const opex = income * (operatingExpenseRatio / 100);
      const noi = effective - opex;
      const debt = income * (debtServiceRatio / 100);
      const capex = income * (capexReserve / 100);
      const cf = noi - debt - capex;
      
      data.push({
        delinquency: del,
        cashFlow: Math.round(cf),
        lostRevenue: Math.round(delinquent)
      });
    }
    return data;
  }, [occupancyRate, totalUnits, avgRent, operatingExpenseRatio, debtServiceRatio, capexReserve]);

  // Monthly projection data
  const monthlyProjection = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map((month, index) => ({
      month,
      cashFlow: calculations.monthlyCashFlow + (Math.random() - 0.5) * calculations.monthlyCashFlow * 0.1,
      noi: calculations.monthlyNOI + (Math.random() - 0.5) * calculations.monthlyNOI * 0.05,
      collections: calculations.effectiveRentalIncome / 12 + (Math.random() - 0.5) * (calculations.effectiveRentalIncome / 12) * 0.08
    }));
  }, [calculations]);

  const formatCurrency = (value: number) => `€${Math.abs(value).toLocaleString()}`;

  const pieData = [
    { name: 'Net Operating Income', value: calculations.netOperatingIncome, color: '#10b981' },
    { name: 'Operating Expenses', value: calculations.operatingExpenses, color: '#f59e0b' },
    { name: 'Debt Service', value: calculations.debtService, color: '#ef4444' },
    { name: 'CapEx Reserves', value: calculations.capexReserves, color: '#8b5cf6' },
  ];

  const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const handleExportPDF = async () => {
    await exportToPDF('cash-flow-optimizer', 'Cash Flow Analysis Report');
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="bg-white rounded-xl shadow-lg p-8" id="cash-flow-optimizer">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Real Estate Cashflow Optimizer
            </h1>
            <p className="text-gray-600 mt-2">Rental Portfolio Analysis</p>
          </div>
          <button
            onClick={handleExportPDF}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export PDF
          </button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Input Controls */}
          <div className="xl:col-span-1 space-y-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Portfolio Parameters</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Occupancy Rate: {occupancyRate}%
                </label>
                <input
                  type="range"
                  min="70"
                  max="100"
                  step="1"
                  value={occupancyRate}
                  onChange={(e) => setOccupancyRate(parseInt(e.target.value))}
                  className="w-full h-2 bg-green-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>70%</span>
                  <span>100%</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Delinquency Rate: {delinquencyRate}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="15"
                  step="0.5"
                  value={delinquencyRate}
                  onChange={(e) => setDelinquencyRate(parseFloat(e.target.value))}
                  className="w-full h-2 bg-red-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0%</span>
                  <span>15%</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Total Units: {totalUnits}
                </label>
                <input
                  type="range"
                  min="50"
                  max="1000"
                  step="25"
                  value={totalUnits}
                  onChange={(e) => setTotalUnits(parseInt(e.target.value))}
                  className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>50</span>
                  <span>1,000</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Average Rent: {formatCurrency(avgRent)}
                </label>
                <input
                  type="range"
                  min="800"
                  max="4000"
                  step="50"
                  value={avgRent}
                  onChange={(e) => setAvgRent(parseInt(e.target.value))}
                  className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>€800</span>
                  <span>€4,000</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <h3 className="font-semibold text-gray-700">Advanced Settings</h3>
              
              <div>
                <label className="block text-xs text-gray-600">Operating Expense Ratio: {operatingExpenseRatio}%</label>
                <input
                  type="range"
                  min="30"
                  max="60"
                  value={operatingExpenseRatio}
                  onChange={(e) => setOperatingExpenseRatio(parseInt(e.target.value))}
                  className="w-full h-1 bg-gray-300 rounded"
                />
              </div>
              
              <div>
                <label className="block text-xs text-gray-600">Debt Service Ratio: {debtServiceRatio}%</label>
                <input
                  type="range"
                  min="20"
                  max="50"
                  value={debtServiceRatio}
                  onChange={(e) => setDebtServiceRatio(parseInt(e.target.value))}
                  className="w-full h-1 bg-gray-300 rounded"
                />
              </div>
              
              <div>
                <label className="block text-xs text-gray-600">CapEx Reserve: {capexReserve}%</label>
                <input
                  type="range"
                  min="3"
                  max="15"
                  value={capexReserve}
                  onChange={(e) => setCapexReserve(parseInt(e.target.value))}
                  className="w-full h-1 bg-gray-300 rounded"
                />
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="xl:col-span-2 space-y-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Portfolio Performance</h2>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-blue-600">Occupied Units</h3>
                <p className="text-2xl font-bold text-blue-800">{calculations.occupiedUnits}</p>
                <p className="text-xs text-blue-600">{calculations.vacantUnits} vacant</p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-green-600">Monthly NOI</h3>
                <p className="text-xl font-bold text-green-800">{formatCurrency(calculations.monthlyNOI)}</p>
                <p className="text-xs text-green-600">Net Operating Income</p>
              </div>
              
              <div className={`${calculations.cashFlow >= 0 ? 'bg-emerald-50' : 'bg-red-50'} p-4 rounded-lg`}>
                <h3 className={`text-sm font-medium ${calculations.cashFlow >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  Monthly Cash Flow
                </h3>
                <p className={`text-xl font-bold ${calculations.cashFlow >= 0 ? 'text-emerald-800' : 'text-red-800'}`}>
                  {calculations.cashFlow >= 0 ? '' : '-'}{formatCurrency(calculations.monthlyCashFlow)}
                </p>
                <p className={`text-xs ${calculations.cashFlow >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  After all expenses
                </p>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-purple-600">Cash-on-Cash ROI</h3>
                <p className="text-xl font-bold text-purple-800">{calculations.roi.toFixed(1)}%</p>
                <p className="text-xs text-purple-600">Annual return</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Annual Financial Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Gross Rental Income:</span>
                    <span className="font-medium">{formatCurrency(calculations.grossRentalIncome)}</span>
                  </div>
                  <div className="flex justify-between text-red-600">
                    <span>Delinquent Amount:</span>
                    <span className="font-medium">({formatCurrency(calculations.delinquentAmount)})</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Effective Rental Income:</span>
                    <span className="font-medium">{formatCurrency(calculations.effectiveRentalIncome)}</span>
                  </div>
                  <div className="flex justify-between text-orange-600">
                    <span>Operating Expenses:</span>
                    <span className="font-medium">({formatCurrency(calculations.operatingExpenses)})</span>
                  </div>
                  <div className="flex justify-between font-semibold text-green-600 border-t pt-2">
                    <span>Net Operating Income:</span>
                    <span>{formatCurrency(calculations.netOperatingIncome)}</span>
                  </div>
                  <div className="flex justify-between text-red-600">
                    <span>Debt Service:</span>
                    <span className="font-medium">({formatCurrency(calculations.debtService)})</span>
                  </div>
                  <div className="flex justify-between text-purple-600">
                    <span>CapEx Reserves:</span>
                    <span className="font-medium">({formatCurrency(calculations.capexReserves)})</span>
                  </div>
                  <div className={`flex justify-between font-bold text-lg border-t pt-2 ${calculations.cashFlow >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    <span>Annual Cash Flow:</span>
                    <span>{calculations.cashFlow >= 0 ? '' : '-'}{formatCurrency(calculations.cashFlow)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Revenue Breakdown</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={60}
                      fill="#8884d8"
                      dataKey="value"
                      label={({percent}) => `${percent ? (percent * 100).toFixed(0) : 0}%`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="mt-8 space-y-8">
          <div>
            <h2 className="text-xl font-semibold text-gray-700 mb-4">ROI Optimization by Occupancy Rate</h2>
            <div className="bg-white p-4 rounded-lg border">
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={scenarioData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="occupancy" 
                    tickFormatter={(value) => `${value}%`}
                  />
                  <YAxis 
                    yAxisId="roi"
                    orientation="left"
                    tickFormatter={(value) => `${value}%`}
                  />
                  <YAxis 
                    yAxisId="cashflow"
                    orientation="right"
                    tickFormatter={(value) => `€${(value/1000)}k`}
                  />
                  <Tooltip 
                    formatter={(value: number, name: string) => {
                      if (name === 'ROI') return [`${value}%`, 'ROI'];
                      return [`€${value.toLocaleString()}`, name];
                    }}
                    labelFormatter={(value) => `Occupancy: ${value}%`}
                  />
                  <Legend />
                  <Line 
                    yAxisId="roi"
                    type="monotone" 
                    dataKey="roi" 
                    stroke="#8b5cf6" 
                    strokeWidth={3}
                    name="ROI"
                    dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                  />
                  <Line 
                    yAxisId="cashflow"
                    type="monotone" 
                    dataKey="cashFlow" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    name="Annual Cash Flow"
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-semibold text-gray-700 mb-4">Delinquency Impact Analysis</h2>
              <div className="bg-white p-4 rounded-lg border">
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={delinquencyImpactData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="delinquency" 
                      tickFormatter={(value) => `${value}%`}
                    />
                    <YAxis 
                      tickFormatter={(value) => `€${(value/1000)}k`}
                    />
                    <Tooltip 
                      formatter={(value: number, name: string) => [`€${value.toLocaleString()}`, name]}
                      labelFormatter={(value) => `Delinquency: ${value}%`}
                    />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="cashFlow" 
                      stackId="1"
                      stroke="#10b981" 
                      fill="#10b981"
                      name="Cash Flow"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="lostRevenue" 
                      stackId="2"
                      stroke="#ef4444" 
                      fill="#ef4444"
                      name="Lost Revenue"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-700 mb-4">Monthly Cash Flow Projection</h2>
              <div className="bg-white p-4 rounded-lg border">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyProjection}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis 
                      tickFormatter={(value) => `€${(value/1000)}k`}
                    />
                    <Tooltip 
                      formatter={(value: number, name: string) => [`€${Math.round(value).toLocaleString()}`, name]}
                    />
                    <Legend />
                    <Bar dataKey="cashFlow" fill="#10b981" name="Cash Flow" />
                    <Bar dataKey="noi" fill="#3b82f6" name="NOI" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CashFlowOptimizer;