import React from 'react';

export default function HeroBanner() {
  return (
    <div className="bg-[#f8f9fa] border-b border-gov-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex-1 text-left">
            <h1 className="text-2xl md:text-3xl font-bold text-gov-blue mb-4 leading-tight">
              NIELIT Intelligent Document Processing System
            </h1>
            <p className="text-base text-gov-text max-w-2xl font-normal leading-relaxed">
              An official platform for AI-powered document digitization and data extraction. 
              Automating the conversion of physical application forms into structured digital datasets 
              to support the Digital India mission.
            </p>
            <div className="mt-8 flex space-x-4">
              <a 
                href="#upload" 
                className="gov-button"
              >
                Upload Documents
              </a>
              <a 
                href="#dashboard" 
                className="bg-white text-gov-blue border border-gov-blue px-4 py-2 rounded-none font-medium hover:bg-gray-50 transition-colors uppercase text-sm"
              >
                View Dashboard
              </a>
            </div>
          </div>
          <div className="hidden md:block w-1/3">
            <div className="bg-white p-4 border border-gov-border shadow-sm">
              <div className="text-xs font-bold text-gov-blue uppercase mb-2 border-b border-gov-border pb-1">Quick Stats</div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">System Status:</span>
                  <span className="text-green-600 font-bold">ACTIVE</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Last Update:</span>
                  <span className="text-gov-text">{new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
