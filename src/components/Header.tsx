import React from 'react';

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center space-x-4">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Emblem_of_India.svg/960px-Emblem_of_India.svg.png" 
            alt="Emblem of India" 
            className="h-16 w-auto object-contain"
            referrerPolicy="no-referrer"
            loading="eager"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Seal_of_the_Government_of_India.svg/200px-Seal_of_the_Government_of_India.svg.png";
            }}
          />
          <div className="border-l-2 border-gray-300 pl-4">
            <h1 className="text-sm font-bold text-gray-800 uppercase leading-tight">
              Government of India
            </h1>
            <h2 className="text-xs font-semibold text-gray-600 uppercase leading-tight">
              Ministry of Electronics and Information Technology
            </h2>
            <h3 className="text-lg font-bold text-[#003366] leading-tight">
              National Institute of Electronics & Information Technology (NIELIT)
            </h3>
          </div>
        </div>
        
        <div className="mt-4 md:mt-0 flex items-center space-x-6 text-xs font-medium text-gray-500">
          <div className="flex space-x-3">
            <button className="hover:text-[#003366] cursor-pointer">Skip to main content</button>
            <span>|</span>
            <button className="hover:text-[#003366] cursor-pointer">Accessibility Options</button>
            <span>|</span>
            <button className="hover:text-[#003366] cursor-pointer">Language: English</button>
          </div>
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search..." 
              className="pl-8 pr-4 py-1 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-[#003366]"
            />
            <svg className="w-4 h-4 absolute left-2 top-1.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>
    </header>
  );
}
