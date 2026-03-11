import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-[#003366] text-white pt-12 pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div>
            <h4 className="text-lg font-bold mb-6 border-b border-white/20 pb-2">Explore NIELIT</h4>
            <ul className="space-y-3 text-sm text-blue-100">
              <li><a href="#" className="hover:text-white transition-colors">About NIELIT</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Training Programs</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Examination & Certification</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Digital Literacy</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-bold mb-6 border-b border-white/20 pb-2">Useful Links</h4>
            <ul className="space-y-3 text-sm text-blue-100">
              <li><a href="#" className="hover:text-white transition-colors">MeitY Portal</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Digital India</a></li>
              <li><a href="#" className="hover:text-white transition-colors">National Portal of India</a></li>
              <li><a href="#" className="hover:text-white transition-colors">RTI Information</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-6 border-b border-white/20 pb-2">Online Services</h4>
            <ul className="space-y-3 text-sm text-blue-100">
              <li><a href="#" className="hover:text-white transition-colors">Student Portal</a></li>
              <li><a href="#" className="hover:text-white transition-colors">E-Governance Services</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Skill India</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Placement Portal</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-6 border-b border-white/20 pb-2">Contact Information</h4>
            <address className="not-italic text-sm text-blue-100 space-y-3">
              <p className="font-bold text-white text-base">NIELIT Kurukshetra</p>
              <p>Govt Polytechnic Campus<br />NH-44 (GT Road), Kurukshetra<br />Haryana - 136 131</p>
              <p>Contact No.: +91 93501 21146</p>
              <p>
                Website: <a href="https://www.nielit.gov.in/kurukshetra/index.php" target="_blank" rel="noopener noreferrer" className="hover:text-white underline">www.nielit.gov.in/kurukshetra</a>
              </p>
              <p>
                <a href="https://goo.gl/maps/GX4mwqKyiVQ2" target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-orange-400 hover:text-orange-300 font-medium">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  Google Map Location
                </a>
              </p>
            </address>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-blue-200 space-y-4 md:space-y-0">
          <div className="text-center md:text-left">
            <p className="font-bold text-white mb-1">National Institute of Electronics and Information Technology (NIELIT)</p>
            <p>Ministry of Electronics and Information Technology, Government of India</p>
          </div>
          <div className="flex space-x-6">
            <a href="#" className="hover:text-white">Privacy Policy</a>
            <a href="#" className="hover:text-white">Terms of Use</a>
            <a href="#" className="hover:text-white">Copyright Policy</a>
          </div>
        </div>
        
        <div className="mt-8 text-center text-[10px] text-blue-300">
          <p>© 2026 National Institute of Electronics and Information Technology. All rights reserved.</p>
          <p className="mt-1">Website Content Managed by NIELIT, Ministry of Electronics and Information Technology, Government of India</p>
        </div>
      </div>
    </footer>
  );
}
