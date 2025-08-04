'use client';

import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { exportToPDF } from '@/utils/pdfExport';

const IRRModel = () => {
  // Project Parameters (adjusted to more realistic defaults)
  const [projectParams, setProjectParams] = useState({
    totalUnits: 100,
    studioUnits: 30,
    oneBRUnits: 40,
    twoBRUnits: 25,
    threeBRUnits: 5,
    studioSqm: 35,
    oneBRSqm: 55,
    twoBRSqm: 75,
    threeBRSqm: 95,
    pricePerSqm: 2900, // Reduced from 3500
    developmentYears: 2.5, // Increased from 2
    totalProjectYears: 4.5, // Increased from 4
    unitsPerMonth: 5 // Reduced from 8
  });

  // Cost Parameters (adjusted to more realistic defaults)
  const [costParams, setCostParams] = useState({
    landAcquisitionTotal: 2200000, // Increased
    constructionCostPerUnit: 58000, // Increased from 45000
    softCostPerUnit: 12000, // Increased from 8000
    marketingTotal: 250000, // Increased from 150000
    agencyFeeRate: 0.03,
    overheadPerUnit: 5000, // Increased from 3000
    contingencyRate: 0.08 // Added contingency
  });

  // Financial Parameters
  const [financeParams, setFinanceParams] = useState({
    debtToEquityRatio: 1.2,
    euribor6m: 0.035,
    spread: 0.01,
    equityInvestment: 4000000 // Increased from 3000000
  });

  // Exit Strategy
  const [exitStrategy, setExitStrategy] = useState('presales'); // 'presales' or 'postconstruction'

  // Sensitivity Analysis
  const [sensitivityRange, setSensitivityRange] = useState(0.2); // +/- 20%

  const calculations = useMemo(() => {
    const interestRate = financeParams.euribor6m + financeParams.spread;
    const totalDebt = financeParams.equityInvestment * financeParams.debtToEquityRatio;
    const totalInvestment = financeParams.equityInvestment + totalDebt;

    // Unit mix and revenues
    const unitMix = [
      { type: 'Studio', count: projectParams.studioUnits, sqm: projectParams.studioSqm },
      { type: '1BR', count: projectParams.oneBRUnits, sqm: projectParams.oneBRSqm },
      { type: '2BR', count: projectParams.twoBRUnits, sqm: projectParams.twoBRSqm },
      { type: '3BR', count: projectParams.threeBRUnits, sqm: projectParams.threeBRSqm }
    ];

    const totalRevenue = unitMix.reduce((sum, unit) => 
      sum + (unit.count * unit.sqm * projectParams.pricePerSqm), 0);

    // Total costs (now includes contingency)
    const totalConstructionCost = projectParams.totalUnits * costParams.constructionCostPerUnit;
    const totalSoftCost = projectParams.totalUnits * costParams.softCostPerUnit;
    const totalAgencyFees = totalRevenue * costParams.agencyFeeRate;
    const totalOverhead = projectParams.totalUnits * costParams.overheadPerUnit;
    const contingencyCost = (totalConstructionCost + totalSoftCost) * costParams.contingencyRate;
    
    const totalCosts = costParams.landAcquisitionTotal + totalConstructionCost + 
                      totalSoftCost + costParams.marketingTotal + totalAgencyFees + 
                      totalOverhead + contingencyCost;

    // Reality Check Flags
    const realityChecks: Array<{type: string, message: string}> = [];
    
    // Check construction cost per sqm
    const avgSqmPerUnit = (projectParams.studioUnits * projectParams.studioSqm + 
                          projectParams.oneBRUnits * projectParams.oneBRSqm + 
                          projectParams.twoBRUnits * projectParams.twoBRSqm + 
                          projectParams.threeBRUnits * projectParams.threeBRSqm) / projectParams.totalUnits;
    const constructionCostPerSqm = costParams.constructionCostPerUnit / avgSqmPerUnit;
    
    if (constructionCostPerSqm < 800) {
      realityChecks.push({ type: 'warning', message: `Construction cost of €${constructionCostPerSqm.toFixed(0)}/sqm seems low. Typical range: €900-1,400/sqm` });
    }
    
    // Check price vs construction cost ratio
    const priceToConstructionRatio = projectParams.pricePerSqm / constructionCostPerSqm;
    if (priceToConstructionRatio > 4) {
      realityChecks.push({ type: 'warning', message: `Price-to-construction ratio of ${priceToConstructionRatio.toFixed(1)}x is very high. Typical range: 2.5-3.5x` });
    }
    
    // Check sales pace
    const monthsToSellOut = projectParams.totalUnits / projectParams.unitsPerMonth;
    if (monthsToSellOut < 15) {
      realityChecks.push({ type: 'warning', message: `Selling ${projectParams.unitsPerMonth} units/month (${monthsToSellOut.toFixed(1)} months to sell out) is very aggressive` });
    }
    
    // Check debt service coverage
    const grossProfit = totalRevenue - totalCosts;
    const grossMargin = grossProfit / totalRevenue;
    if (grossMargin > 0.45) {
      realityChecks.push({ type: 'warning', message: `Gross margin of ${(grossMargin * 100).toFixed(1)}% is exceptionally high. Typical range: 20-35%` });
    }
    
    // Check land cost as % of total project cost
    const landPercentage = costParams.landAcquisitionTotal / totalRevenue;
    if (landPercentage < 0.08) {
      realityChecks.push({ type: 'info', message: `Land cost at ${(landPercentage * 100).toFixed(1)}% of revenue is quite low. Typical range: 15-25%` });
    } else if (landPercentage > 0.30) {
      realityChecks.push({ type: 'warning', message: `Land cost at ${(landPercentage * 100).toFixed(1)}% of revenue is very high. Consider reducing` });
    }

    // Cash flow projections
    const cashFlows = [];
    const monthsInProject = projectParams.totalProjectYears * 12;
    const constructionMonths = projectParams.developmentYears * 12;
    
    let cumulativeRevenue = 0;
    let cumulativeCosts = 0;
    let outstandingDebt = totalDebt;

    for (let month = 0; month <= monthsInProject; month++) {
      let revenue = 0;
      let costs = 0;
      let interestExpense = 0;

      // Year 0: Land acquisition
      if (month === 0) {
        costs += costParams.landAcquisitionTotal;
      }

      // During construction period
      if (month > 0 && month <= constructionMonths) {
        // Staged construction costs (including contingency)
        const monthlyConstructionCost = totalConstructionCost / constructionMonths;
        const monthlySoftCost = totalSoftCost / constructionMonths;
        const monthlyOverhead = totalOverhead / constructionMonths;
        const monthlyContingency = contingencyCost / constructionMonths;
        
        costs += monthlyConstructionCost + monthlySoftCost + monthlyOverhead + monthlyContingency;

        // Pre-sales revenue (if strategy allows)
        if (exitStrategy === 'presales' && month >= constructionMonths * 0.3) {
          const unitsSold = Math.min(projectParams.unitsPerMonth, 
            projectParams.totalUnits - (cumulativeRevenue / (totalRevenue / projectParams.totalUnits)));
          revenue = unitsSold * (totalRevenue / projectParams.totalUnits);
        }

        // Marketing costs spread over construction
        costs += costParams.marketingTotal / constructionMonths;
      }

      // Post-construction sales (if strategy is post-completion)
      if (exitStrategy === 'postconstruction' && month > constructionMonths) {
        const remainingUnits = projectParams.totalUnits - (cumulativeRevenue / (totalRevenue / projectParams.totalUnits));
        const unitsSold = Math.min(projectParams.unitsPerMonth, remainingUnits);
        revenue = unitsSold * (totalRevenue / projectParams.totalUnits);
      }

      // Agency fees on sales
      if (revenue > 0) {
        costs += revenue * costParams.agencyFeeRate;
      }

      // Interest on outstanding debt
      if (outstandingDebt > 0) {
        interestExpense = outstandingDebt * (interestRate / 12);
        costs += interestExpense;
      }

      const netCashFlow = revenue - costs;
      cumulativeRevenue += revenue;
      cumulativeCosts += costs;

      // Update debt (pay down with positive cash flows)
      if (netCashFlow > 0 && outstandingDebt > 0) {
        const debtPayment = Math.min(netCashFlow, outstandingDebt);
        outstandingDebt = Math.max(0, outstandingDebt - debtPayment);
      }

      cashFlows.push({
        month,
        year: Math.floor(month / 12),
        revenue,
        costs,
        interestExpense,
        netCashFlow,
        cumulativeRevenue,
        cumulativeCosts,
        outstandingDebt
      });
    }

    // Calculate annual cash flows for IRR
    const annualCashFlows = [];
    for (let year = 0; year <= projectParams.totalProjectYears; year++) {
      const yearCashFlows = cashFlows.filter(cf => cf.year === year);
      const annualNet = yearCashFlows.reduce((sum, cf) => sum + cf.netCashFlow, 0);
      
      // Year 0 includes initial equity investment
      const finalCashFlow = year === 0 ? annualNet - financeParams.equityInvestment : annualNet;
      
      annualCashFlows.push({
        year,
        cashFlow: finalCashFlow
      });
    }

    // IRR calculation using Newton-Raphson method
    const calculateIRR = (cashFlows: Array<{cashFlow: number}>) => {
      let rate = 0.1; // Initial guess
      let iterations = 0;
      const maxIterations = 100;
      const tolerance = 0.0001;

      while (iterations < maxIterations) {
        let npv = 0;
        let dnpv = 0;

        for (let i = 0; i < cashFlows.length; i++) {
          const cf = cashFlows[i].cashFlow;
          npv += cf / Math.pow(1 + rate, i);
          dnpv += -i * cf / Math.pow(1 + rate, i + 1);
        }

        if (Math.abs(npv) < tolerance) break;
        
        rate = rate - npv / dnpv;
        iterations++;
      }

      return rate;
    };

    const irr = calculateIRR(annualCashFlows);
    
    // Add IRR reality check after calculation
    if (irr > 0.45) {
      realityChecks.push({ type: 'warning', message: `IRR of ${(irr * 100).toFixed(1)}% is exceptionally high. Consider reviewing assumptions` });
    } else if (irr > 0.35) {
      realityChecks.push({ type: 'info', message: `IRR of ${(irr * 100).toFixed(1)}% is above average. Verify market assumptions` });
    } else if (irr < 0.15) {
      realityChecks.push({ type: 'warning', message: `IRR of ${(irr * 100).toFixed(1)}% may be too low for development risk` });
    }
    
    // Calculate NPV at 10% discount rate
    const discountRate = 0.10;
    const npv = annualCashFlows.reduce((sum, cf, index) => 
      sum + cf.cashFlow / Math.pow(1 + discountRate, index), 0);

    // Cash-on-cash return
    const totalCashReturned = annualCashFlows.slice(1).reduce((sum, cf) => sum + Math.max(0, cf.cashFlow), 0);
    const cashOnCash = totalCashReturned / financeParams.equityInvestment;

    // Equity multiple
    const equityMultiple = (totalRevenue - totalCosts - totalDebt * interestRate * (projectParams.totalProjectYears / 2)) / financeParams.equityInvestment;

    // Sensitivity analysis
    const sensitivityData = [];
    const basePrice = projectParams.pricePerSqm;
    const range = sensitivityRange;
    
    for (let i = -5; i <= 5; i++) {
      const priceAdjustment = 1 + (i * range / 5);
      const adjustedPrice = basePrice * priceAdjustment;
      const adjustedRevenue = unitMix.reduce((sum, unit) => 
        sum + (unit.count * unit.sqm * adjustedPrice), 0);
      
      // Recalculate IRR with adjusted revenue
      const adjustedAnnualCashFlows = annualCashFlows.map((cf, index) => {
        if (index === 0) return cf;
        const revenueAdjustment = (adjustedRevenue - totalRevenue) / projectParams.totalProjectYears;
        return { ...cf, cashFlow: cf.cashFlow + revenueAdjustment };
      });
      
      const adjustedIRR = calculateIRR(adjustedAnnualCashFlows);
      
      sensitivityData.push({
        priceChange: ((priceAdjustment - 1) * 100).toFixed(1),
        irr: (adjustedIRR * 100).toFixed(1),
        price: adjustedPrice
      });
    }

    return {
      totalRevenue,
      totalCosts,
      totalInvestment,
      irr: irr * 100,
      npv,
      cashOnCash,
      equityMultiple,
      annualCashFlows,
      cashFlows,
      unitMix,
      sensitivityData,
      interestRate: interestRate * 100,
      realityChecks,
      avgSqmPerUnit,
      constructionCostPerSqm,
      grossMargin,
      contingencyCost
    };
  }, [projectParams, costParams, financeParams, exitStrategy, sensitivityRange]);

  const updateProjectParam = (key: string, value: string) => {
    setProjectParams(prev => ({ ...prev, [key]: parseFloat(value) || 0 }));
  };

  const updateCostParam = (key: string, value: string) => {
    setCostParams(prev => ({ ...prev, [key]: parseFloat(value) || 0 }));
  };

  const updateFinanceParam = (key: string, value: string) => {
    setFinanceParams(prev => ({ ...prev, [key]: parseFloat(value) || 0 }));
  };

  const handleExportPDF = async () => {
    await exportToPDF('irr-model', 'IRR Development Model Report');
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 bg-gray-50">
      <div className="bg-white rounded-xl shadow-lg p-8" id="irr-model">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Real Estate Development IRR Model
            </h1>
            <p className="text-gray-600 mt-2">Development Project Analysis</p>
          </div>
          <button
            onClick={handleExportPDF}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export PDF
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          
          {/* Project Parameters */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-blue-600">Project Parameters</h2>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Total Units</label>
                <input
                  type="number"
                  value={projectParams.totalUnits}
                  onChange={(e) => updateProjectParam('totalUnits', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Studio Units</label>
                  <input
                    type="number"
                    value={projectParams.studioUnits}
                    onChange={(e) => updateProjectParam('studioUnits', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Studio SqM</label>
                  <input
                    type="number"
                    value={projectParams.studioSqm}
                    onChange={(e) => updateProjectParam('studioSqm', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">1BR Units</label>
                  <input
                    type="number"
                    value={projectParams.oneBRUnits}
                    onChange={(e) => updateProjectParam('oneBRUnits', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">1BR SqM</label>
                  <input
                    type="number"
                    value={projectParams.oneBRSqm}
                    onChange={(e) => updateProjectParam('oneBRSqm', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">2BR Units</label>
                  <input
                    type="number"
                    value={projectParams.twoBRUnits}
                    onChange={(e) => updateProjectParam('twoBRUnits', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">2BR SqM</label>
                  <input
                    type="number"
                    value={projectParams.twoBRSqm}
                    onChange={(e) => updateProjectParam('twoBRSqm', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">3BR Units</label>
                  <input
                    type="number"
                    value={projectParams.threeBRUnits}
                    onChange={(e) => updateProjectParam('threeBRUnits', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">3BR SqM</label>
                  <input
                    type="number"
                    value={projectParams.threeBRSqm}
                    onChange={(e) => updateProjectParam('threeBRSqm', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Price per SqM (€)</label>
                <input
                  type="number"
                  value={projectParams.pricePerSqm}
                  onChange={(e) => updateProjectParam('pricePerSqm', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Development Years</label>
                <input
                  type="number"
                  step="0.5"
                  value={projectParams.developmentYears}
                  onChange={(e) => updateProjectParam('developmentYears', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Total Project Years</label>
                <input
                  type="number"
                  step="0.5"
                  value={projectParams.totalProjectYears}
                  onChange={(e) => updateProjectParam('totalProjectYears', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Units Sold per Month</label>
                <input
                  type="number"
                  value={projectParams.unitsPerMonth}
                  onChange={(e) => updateProjectParam('unitsPerMonth', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                />
              </div>
            </div>
          </div>

          {/* Cost Parameters */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-green-600">Cost Parameters</h2>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Land Acquisition (€)</label>
                <input
                  type="number"
                  value={costParams.landAcquisitionTotal}
                  onChange={(e) => updateCostParam('landAcquisitionTotal', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Construction Cost per Unit (€)</label>
                <input
                  type="number"
                  value={costParams.constructionCostPerUnit}
                  onChange={(e) => updateCostParam('constructionCostPerUnit', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Soft Cost per Unit (€)</label>
                <input
                  type="number"
                  value={costParams.softCostPerUnit}
                  onChange={(e) => updateCostParam('softCostPerUnit', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Marketing Total (€)</label>
                <input
                  type="number"
                  value={costParams.marketingTotal}
                  onChange={(e) => updateCostParam('marketingTotal', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Agency Fee Rate (%)</label>
                <input
                  type="number"
                  step="0.001"
                  value={costParams.agencyFeeRate * 100}
                  onChange={(e) => updateCostParam('agencyFeeRate', (parseFloat(e.target.value) / 100).toString())}
                  className="w-full p-3 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Overhead per Unit (€)</label>
                <input
                  type="number"
                  value={costParams.overheadPerUnit}
                  onChange={(e) => updateCostParam('overheadPerUnit', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Contingency Rate (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={costParams.contingencyRate * 100}
                  onChange={(e) => updateCostParam('contingencyRate', (parseFloat(e.target.value) / 100).toString())}
                  className="w-full p-3 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                />
              </div>
            </div>
          </div>

          {/* Financial Parameters */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-purple-600">Financial Parameters</h2>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Debt-to-Equity Ratio</label>
                <input
                  type="number"
                  step="0.1"
                  value={financeParams.debtToEquityRatio}
                  onChange={(e) => updateFinanceParam('debtToEquityRatio', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Euribor 6M (%)</label>
                <input
                  type="number"
                  step="0.001"
                  value={financeParams.euribor6m * 100}
                  onChange={(e) => updateFinanceParam('euribor6m', (parseFloat(e.target.value) / 100).toString())}
                  className="w-full p-3 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Spread (%)</label>
                <input
                  type="number"
                  step="0.001"
                  value={financeParams.spread * 100}
                  onChange={(e) => updateFinanceParam('spread', (parseFloat(e.target.value) / 100).toString())}
                  className="w-full p-3 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Equity Investment (€)</label>
                <input
                  type="number"
                  value={financeParams.equityInvestment}
                  onChange={(e) => updateFinanceParam('equityInvestment', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Exit Strategy</label>
                <select
                  value={exitStrategy}
                  onChange={(e) => setExitStrategy(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                >
                  <option value="presales">Pre-sales during construction</option>
                  <option value="postconstruction">Sales after completion</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Sensitivity Range (±%)</label>
                <input
                  type="number"
                  step="0.05"
                  value={sensitivityRange * 100}
                  onChange={(e) => setSensitivityRange(parseFloat(e.target.value) / 100)}
                  className="w-full p-3 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Reality Check Alerts */}
        {calculations.realityChecks.length > 0 && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Reality Check</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <ul className="list-disc pl-5 space-y-1">
                    {calculations.realityChecks.map((check, index) => (
                      <li key={index} className={check.type === 'warning' ? 'text-red-600' : 'text-blue-600'}>
                        {check.message}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-blue-600 text-white p-6 rounded-lg text-center">
            <h3 className="text-lg font-semibold">Project IRR</h3>
            <p className="text-3xl font-bold">{calculations.irr.toFixed(1)}%</p>
          </div>
          
          <div className="bg-green-600 text-white p-6 rounded-lg text-center">
            <h3 className="text-lg font-semibold">NPV (10%)</h3>
            <p className="text-2xl font-bold">€{(calculations.npv / 1000).toFixed(0)}K</p>
          </div>
          
          <div className="bg-purple-600 text-white p-6 rounded-lg text-center">
            <h3 className="text-lg font-semibold">Cash-on-Cash</h3>
            <p className="text-3xl font-bold">{(calculations.cashOnCash * 100).toFixed(1)}%</p>
          </div>
          
          <div className="bg-orange-600 text-white p-6 rounded-lg text-center">
            <h3 className="text-lg font-semibold">Equity Multiple</h3>
            <p className="text-3xl font-bold">{calculations.equityMultiple.toFixed(1)}x</p>
          </div>
        </div>

        {/* Project Summary */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h3 className="text-xl font-semibold mb-4 text-gray-600">Project Summary</h3>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 text-sm text-gray-600">
            <div>
              <p className="font-medium">Total Revenue:</p>
              <p className="text-lg">€{(calculations.totalRevenue / 1000000).toFixed(2)}M</p>
            </div>
            <div>
              <p className="font-medium">Total Costs:</p>
              <p className="text-lg">€{(calculations.totalCosts / 1000000).toFixed(2)}M</p>
            </div>
            <div>
              <p className="font-medium">Gross Margin:</p>
              <p className="text-lg">{(calculations.grossMargin * 100).toFixed(1)}%</p>
            </div>
            <div>
              <p className="font-medium">Construction Cost/SqM:</p>
              <p className="text-lg">€{calculations.constructionCostPerSqm.toFixed(0)}</p>
            </div>
            <div>
              <p className="font-medium">Interest Rate:</p>
              <p className="text-lg">{calculations.interestRate.toFixed(2)}%</p>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t">
            <h4 className="font-semibold mb-2 text-gray-600">Industry Benchmarks:</h4>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs text-gray-600">
              <div>
                <p><strong>IRR Range:</strong> Conservative 15-25%, Market 20-35%, High-risk 30-50%+</p>
              </div>
              <div>
                <p><strong>Gross Margin:</strong> Typical 20-35%, Exceptional 35%+</p>
              </div>
              <div>
                <p><strong>Construction Cost:</strong> €900-1,400/sqm depending on quality/location</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          
          {/* Annual Cash Flow */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4 text-gray-600">Annual Cash Flow</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={calculations.annualCashFlows}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip formatter={(value: number) => [`€${(value/1000).toFixed(0)}K`, 'Cash Flow']} />
                <Bar dataKey="cashFlow" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Sensitivity Analysis */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4 text-gray-600">Price Sensitivity Analysis</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={calculations.sensitivityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="priceChange" label={{ value: 'Price Change (%)', position: 'insideBottom', offset: -5 }} />
                <YAxis label={{ value: 'IRR (%)', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value: number) => [`${value}%`, 'IRR']} />
                <Line type="monotone" dataKey="irr" stroke="#10B981" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Unit Mix Table */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4 text-gray-600">Unit Mix & Revenue Breakdown</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-gray-600">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 text-left">Unit Type</th>
                  <th className="p-2 text-right">Count</th>
                  <th className="p-2 text-right">SqM</th>
                  <th className="p-2 text-right">Price/SqM</th>
                  <th className="p-2 text-right">Unit Price</th>
                  <th className="p-2 text-right">Total Revenue</th>
                </tr>
              </thead>
              <tbody>
                {calculations.unitMix.map((unit, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2 font-medium">{unit.type}</td>
                    <td className="p-2 text-right">{unit.count}</td>
                    <td className="p-2 text-right">{unit.sqm}</td>
                    <td className="p-2 text-right">€{projectParams.pricePerSqm.toLocaleString()}</td>
                    <td className="p-2 text-right">€{(unit.sqm * projectParams.pricePerSqm).toLocaleString()}</td>
                    <td className="p-2 text-right">€{(unit.count * unit.sqm * projectParams.pricePerSqm).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IRRModel;