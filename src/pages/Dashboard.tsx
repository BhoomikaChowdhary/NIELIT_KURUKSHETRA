import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '../components/Header';
import Navbar from '../components/Navbar';
import HeroBanner from '../components/HeroBanner';
import StatsCards from '../components/StatsCards';
import UploadPanel from '../components/UploadPanel';
import ActivityLog from '../components/ActivityLog';
import DownloadSection from '../components/DownloadSection';
import Footer from '../components/Footer';

export default function Dashboard() {
  const [stats, setStats] = useState({
    total_uploaded: 0,
    processed: 0,
    photos_extracted: 0,
    signatures_extracted: 0
  });
  const [logs, setLogs] = useState([]);

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/stats');
      if (response.data.stats) {
        setStats(response.data.stats);
      }
      if (response.data.logs) {
        setLogs(response.data.logs);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <Navbar />
      
      <main className="flex-grow">
        <HeroBanner />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div id="dashboard" className="mb-10">
            <h2 className="text-xl font-bold text-gov-blue mb-6 border-l-4 border-orange-600 pl-4 uppercase tracking-tight">
              Processing Dashboard
            </h2>
            <StatsCards stats={stats} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
            <div className="lg:col-span-2">
              <UploadPanel onUploadSuccess={fetchStats} />
            </div>
            <div className="lg:col-span-1">
              <ActivityLog logs={logs} onReset={fetchStats} />
            </div>
          </div>

          <DownloadSection />
          
          <div id="about" className="mt-12 gov-panel p-8">
            <h2 className="gov-title">About the System</h2>
            <div className="prose prose-sm max-w-none text-gov-text space-y-4">
              <p className="text-sm leading-relaxed">
                The <strong>NIELIT Intelligent Document Processing System</strong> is an official AI-powered platform 
                designed to streamline the digitization of physical application forms received by government departments. 
                The system supports <strong>multiple form formats</strong> and automatically builds a master dataset 
                containing all detected fields across different document types.
              </p>
              <p className="text-sm leading-relaxed">
                Leveraging advanced Optical Character Recognition (OCR) and Machine Learning models, the system automatically 
                identifies, extracts, and validates key information such as personal details, identification numbers, and contact 
                information. Additionally, it utilizes computer vision to detect and crop passport-sized photographs and signatures from the forms, 
                saving them as separate digital assets.
              </p>
              <p className="text-sm leading-relaxed">
                This initiative is part of the <strong>Digital India</strong> mission to transform government processes through 
                technology, reducing manual data entry errors and significantly improving processing turnaround times.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
