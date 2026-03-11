import React from 'react';

const navItems = [
  { name: 'Home', href: '#' },
  { name: 'Dashboard', href: '#dashboard' },
  { name: 'Upload', href: '#upload' },
  { name: 'About', href: '#about' },
  { name: 'Contact', href: '#' },
];

export default function Navbar() {
  return (
    <nav className="bg-[#003366] text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-12">
          <div className="flex space-x-8">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-sm font-medium hover:bg-[#004080] px-3 py-2 rounded transition-colors"
              >
                {item.name}
              </a>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
