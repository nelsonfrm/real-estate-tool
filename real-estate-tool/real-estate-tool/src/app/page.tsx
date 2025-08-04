'use client';

import { useState } from 'react';
import CashFlowOptimizer from '@/components/CashFlowOptimizer';
import IRRModel from '@/components/IRRModel';

export default function Home() {
  const [activeTab, setActiveTab] = useState('cashflow');

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-800">Real Estate Analysis</h1>
          <p className="text-sm text-gray-600 mt-2">Professional Financial Tools</p>
        </div>
        
        <nav className="mt-8">
          <div className="px-6 space-y-2">
            <button
              onClick={() => setActiveTab('cashflow')}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'cashflow'
                  ? 'bg-blue-100 text-blue-700 border-r-4 border-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <div>
                  <div className="font-medium">Cash Flow Optimizer</div>
                  <div className="text-xs text-gray-500">Rental Portfolio Analysis</div>
                </div>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('irr')}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'irr'
                  ? 'bg-green-100 text-green-700 border-r-4 border-green-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <div>
                  <div className="font-medium">IRR Model</div>
                  <div className="text-xs text-gray-500">Development Projects</div>
                </div>
              </div>
            </button>
          </div>
        </nav>

        <div className="absolute bottom-0 w-64 p-6 border-t bg-gray-50">
          <div className="text-xs text-gray-500">
            <p>© 2024 Real Estate Analysis</p>
            <p className="mt-1">Professional Financial Tools</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'cashflow' && <CashFlowOptimizer />}
        {activeTab === 'irr' && <IRRModel />}
      </div>
    </div>
  );
}