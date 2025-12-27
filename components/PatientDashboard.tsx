
import React, { useState, useMemo, useEffect } from 'react';
import { User, Appointment, TestResult, AppointmentStatus } from '../types';
import { 
  FileText, 
  Calendar, 
  Download, 
  Search, 
  Info, 
  BrainCircuit, 
  Activity, 
  Clock, 
  CheckCircle2, 
  ChevronRight,
  TrendingUp,
  AlertCircle,
  History,
  Ban,
  ArrowRight,
  Sparkles,
  Loader2
} from 'lucide-react';
import { generatePDFReport } from '../services/pdfService';
import { getHealthInsights, getWholeHealthSummary } from '../services/geminiService';

interface PatientDashboardProps {
  user: User;
  appointments: Appointment[];
  results: TestResult[];
}

const PatientDashboard: React.FC<PatientDashboardProps> = ({ user, appointments, results }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'results' | 'appointments' | 'history'>('overview');
  const [selectedResult, setSelectedResult] = useState<TestResult | null>(null);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);
  const [healthSummary, setHealthSummary] = useState<string | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);

  const myAppointments = useMemo(() => appointments.filter(a => a.patientId === user.id), [appointments, user.id]);
  const myResults = useMemo(() => results.filter(r => r.patientId === user.id).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [results, user.id]);

  useEffect(() => {
    if (activeTab === 'overview' && !healthSummary && myResults.length > 0) {
      fetchHealthSummary();
    }
  }, [activeTab]);

  const fetchHealthSummary = async () => {
    setIsLoadingSummary(true);
    const summary = await getWholeHealthSummary(myResults);
    setHealthSummary(summary);
    setIsLoadingSummary(false);
  };

  const upcomingAppointments = useMemo(() => 
    myAppointments.filter(a => a.status === AppointmentStatus.PENDING), 
    [myAppointments]
  );

  const pastAppointments = useMemo(() => 
    myAppointments.filter(a => a.status !== AppointmentStatus.PENDING)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [myAppointments]
  );

  const fetchAiInsight = async (result: TestResult) => {
    setIsLoadingInsight(true);
    const insight = await getHealthInsights(result);
    setAiInsight(insight);
    setIsLoadingInsight(false);
  };

  // Helper for trend chart
  const renderTrendChart = (paramName: string) => {
    const trendData = myResults
      .filter(r => r.parameters.some(p => p.name.includes(paramName)))
      .slice(0, 5)
      .reverse()
      .map(r => {
        const p = r.parameters.find(p => p.name.includes(paramName));
        return { date: r.date, value: parseFloat(p?.value || '0') };
      });

    if (trendData.length < 2) return null;

    const maxVal = Math.max(...trendData.map(d => d.value)) * 1.2;
    const points = trendData.map((d, i) => `${(i / (trendData.length - 1)) * 100},${100 - (d.value / maxVal) * 100}`).join(' ');

    return (
      <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
        <div className="flex justify-between items-center mb-2">
          <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{paramName} Trend</h5>
          <span className="text-[10px] font-bold text-blue-600">Last {trendData.length} Tests</span>
        </div>
        <svg viewBox="0 0 100 100" className="w-full h-24 overflow-visible">
          <polyline
            fill="none"
            stroke="#2563eb"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points}
            className="drop-shadow-sm"
          />
          {trendData.map((d, i) => (
            <circle
              key={i}
              cx={(i / (trendData.length - 1)) * 100}
              cy={100 - (d.value / maxVal) * 100}
              r="3"
              fill="white"
              stroke="#2563eb"
              strokeWidth="2"
            />
          ))}
        </svg>
        <div className="flex justify-between mt-2 text-[8px] font-bold text-gray-400">
          <span>{trendData[0].date}</span>
          <span>{trendData[trendData.length - 1].date}</span>
        </div>
      </div>
    );
  };

  const renderOverview = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* AI Health Summary Card */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] p-8 text-white shadow-xl shadow-blue-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Sparkles className="h-48 w-48 rotate-12" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-md mr-3">
              <BrainCircuit className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold">Smart Health Summary</h3>
          </div>
          {isLoadingSummary ? (
            <div className="flex items-center space-x-3 py-4">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="font-medium opacity-80">Synthesizing medical records...</span>
            </div>
          ) : healthSummary ? (
            <div className="space-y-4">
              <p className="text-blue-50 leading-relaxed font-medium">
                {healthSummary}
              </p>
              <button 
                onClick={fetchHealthSummary}
                className="text-xs font-bold text-white/60 hover:text-white flex items-center transition-colors"
              >
                Refresh Analysis <ChevronRight className="h-3 w-3 ml-1" />
              </button>
            </div>
          ) : (
            <p className="opacity-80">Complete a few diagnostic tests to unlock personalized health summaries.</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Statistics and Trends */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">Health Vitals Tracking</h4>
            {renderTrendChart('Hemoglobin') || (
              <div className="py-10 text-center text-gray-400">
                <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-20" />
                <p className="text-xs">No trend data yet.</p>
              </div>
            )}
            {renderTrendChart('Blood Sugar')}
          </div>
          
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-green-50 p-3 rounded-2xl mr-4">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Reports</p>
                <p className="text-2xl font-black text-gray-900">{myResults.length}</p>
              </div>
            </div>
            <button onClick={() => setActiveTab('results')} className="p-2 bg-gray-50 rounded-xl text-gray-400 hover:text-blue-600 transition-colors">
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Next and Latest */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden h-full flex flex-col">
            <div className="px-8 py-6 border-b border-gray-50 flex justify-between items-center">
              <h3 className="font-bold text-gray-900">Immediate Actions</h3>
              <button onClick={() => setActiveTab('appointments')} className="text-xs font-black text-blue-600 uppercase tracking-widest hover:underline">View Calendar</button>
            </div>
            <div className="p-8 flex-grow space-y-6">
              {/* Upcoming */}
              {upcomingAppointments.length > 0 ? (
                <div className="flex items-start space-x-6 p-6 bg-blue-50 rounded-3xl border border-blue-100/50">
                  <div className="bg-blue-600 text-white rounded-2xl px-5 py-3 text-center shadow-lg shadow-blue-500/20">
                    <span className="block text-2xl font-black">{new Date(upcomingAppointments[0].date).getDate()}</span>
                    <span className="text-[10px] uppercase font-black tracking-widest">{new Date(upcomingAppointments[0].date).toLocaleString('default', { month: 'short' })}</span>
                  </div>
                  <div className="flex-grow">
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Upcoming Visit</p>
                    <h4 className="font-black text-gray-900 text-xl">{upcomingAppointments[0].serviceName}</h4>
                    <div className="flex items-center text-gray-500 text-sm mt-1 font-medium">
                      <Clock className="h-4 w-4 mr-1.5" />
                      {upcomingAppointments[0].timeSlot}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 bg-gray-50 rounded-3xl text-center border border-dashed border-gray-200">
                  <p className="text-gray-400 text-sm font-medium">No appointments scheduled.</p>
                </div>
              )}

              {/* Latest Result */}
              {myResults.length > 0 ? (
                <div className="flex items-center justify-between p-6 bg-white border border-gray-100 rounded-3xl shadow-sm hover:border-blue-200 transition-all cursor-pointer group" onClick={() => { setSelectedResult(myResults[0]); setActiveTab('results'); }}>
                  <div className="flex items-center space-x-4">
                    <div className="bg-gray-100 p-4 rounded-2xl group-hover:bg-blue-50 transition-colors">
                      <FileText className="h-6 w-6 text-gray-600 group-hover:text-blue-600" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Latest Report</p>
                      <h4 className="font-black text-gray-900">{myResults[0].testName}</h4>
                      <p className="text-xs text-gray-500">{new Date(myResults[0].date).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
                    </div>
                  </div>
                  <ChevronRight className="h-6 w-6 text-gray-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12 gap-6">
        <div>
          <div className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-3">
            Clinical Health Portal
          </div>
          <h1 className="text-5xl font-black text-gray-900 tracking-tight">Patient Dashboard</h1>
          <p className="text-gray-500 mt-2 text-lg font-medium">Hello, {user.name}. Your latest diagnostics are ready.</p>
        </div>
        
        <div className="inline-flex p-1.5 bg-gray-100 rounded-[1.25rem] shadow-inner">
          {[
            { id: 'overview', label: 'Summary' },
            { id: 'results', label: 'Reports' },
            { id: 'appointments', label: 'Schedule' },
            { id: 'history', label: 'Archive' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === tab.id ? 'bg-white text-blue-600 shadow-md scale-105' : 'text-gray-400 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'overview' && renderOverview()}

      {activeTab === 'results' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-in fade-in duration-500">
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest">Medical Reports</h2>
              <span className="bg-blue-100 text-blue-600 text-[10px] font-black px-2 py-0.5 rounded-full">{myResults.length}</span>
            </div>
            {myResults.length > 0 ? (
              myResults.map(result => (
                <div
                  key={result.id}
                  onClick={() => {
                    setSelectedResult(result);
                    setAiInsight(null);
                  }}
                  className={`p-6 rounded-[2rem] cursor-pointer border-2 transition-all ${
                    selectedResult?.id === result.id ? 'border-blue-600 bg-blue-50 shadow-lg shadow-blue-500/5' : 'bg-white border-transparent hover:border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-black text-gray-900">{result.testName}</h3>
                      <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-wider">{new Date(result.date).toLocaleDateString(undefined, { dateStyle: 'medium' })}</p>
                    </div>
                    <div className={`p-2 rounded-xl ${selectedResult?.id === result.id ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-400'}`}>
                      <FileText className="h-5 w-5" />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white p-20 rounded-[2.5rem] border-2 border-dashed border-gray-100 text-center">
                <FileText className="h-12 w-12 text-gray-200 mx-auto mb-4" />
                <p className="text-gray-400 font-bold">No reports yet.</p>
              </div>
            )}
          </div>

          <div className="lg:col-span-8">
            {selectedResult ? (
              <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden sticky top-24 animate-in slide-in-from-right-4 duration-500">
                <div className="p-10 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gray-50/50">
                  <div>
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Official Clinical Record</p>
                    <h3 className="text-3xl font-black text-gray-900 leading-tight">{selectedResult.testName}</h3>
                    <div className="flex items-center space-x-4 mt-2">
                       <span className="text-xs font-bold text-gray-400">ID: {selectedResult.id}</span>
                       <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                       <span className="text-xs font-bold text-gray-400">Date: {new Date(selectedResult.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => generatePDFReport(selectedResult)}
                    className="flex items-center justify-center px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/25 active:scale-95"
                  >
                    <Download className="h-4 w-4 mr-2" /> Download Report
                  </button>
                </div>
                
                <div className="p-10">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                          <th className="pb-5 pr-4">Analysis Parameter</th>
                          <th className="pb-5 pr-4 text-center">Result</th>
                          <th className="pb-5 pr-4 text-center">Unit</th>
                          <th className="pb-5 text-right">Reference Range</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {selectedResult.parameters.map((p, i) => (
                          <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                            <td className="py-5 font-bold text-gray-900 pr-4">{p.name}</td>
                            <td className="py-5 text-center pr-4">
                              <span className="inline-block px-4 py-1 bg-blue-50 text-blue-700 rounded-xl font-black">
                                {p.value}
                              </span>
                            </td>
                            <td className="py-5 text-center text-gray-500 font-bold pr-4">{p.unit}</td>
                            <td className="py-5 text-right text-gray-400 text-xs italic font-medium">{p.referenceRange}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-10 p-8 bg-gray-50 rounded-[2rem] border border-gray-100">
                    <h4 className="font-black text-gray-700 text-xs uppercase tracking-widest mb-3 flex items-center">
                      <Info className="h-4 w-4 mr-2 text-blue-500" />
                      Doctor's Medical Remarks
                    </h4>
                    <p className="text-gray-600 italic font-medium leading-relaxed">"{selectedResult.doctorRemarks}"</p>
                  </div>

                  <div className="mt-8">
                    <button
                      onClick={() => fetchAiInsight(selectedResult)}
                      disabled={isLoadingInsight}
                      className="w-full flex items-center justify-center p-6 bg-indigo-50 text-indigo-700 rounded-[2rem] border border-indigo-100 font-black text-xs uppercase tracking-widest hover:bg-indigo-100 transition-all group shadow-sm active:scale-[0.98]"
                    >
                      {isLoadingInsight ? (
                        <Loader2 className="h-5 w-5 mr-3 animate-spin" />
                      ) : (
                        <BrainCircuit className="h-5 w-5 mr-3 transition-transform group-hover:scale-110" />
                      )}
                      {isLoadingInsight ? 'Analyzing Report...' : 'AI Medical Interpretation'}
                    </button>
                  </div>

                  {aiInsight && (
                    <div className="mt-6 p-8 bg-white border-2 border-indigo-50 rounded-[2rem] animate-in fade-in slide-in-from-top-4 duration-500">
                      <div className="flex items-center mb-4">
                        <Sparkles className="h-4 w-4 text-indigo-600 mr-2" />
                        <h5 className="font-black text-indigo-900 text-xs uppercase tracking-widest">AI Clinical Insights</h5>
                      </div>
                      <div className="prose prose-indigo text-gray-700 text-sm whitespace-pre-wrap leading-relaxed font-medium">
                        {aiInsight}
                      </div>
                      <div className="mt-6 flex items-start p-4 bg-amber-50 rounded-2xl border border-amber-100">
                        <AlertCircle className="h-4 w-4 text-amber-600 mr-3 mt-0.5 shrink-0" />
                        <p className="text-[10px] text-amber-800 uppercase font-black tracking-tight leading-tight">AI interpretation only. This tool is intended for educational purposes. Always consult a qualified medical professional for diagnosis.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-full min-h-[500px] flex flex-col items-center justify-center bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200 p-10 text-center">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-inner mb-6">
                  <FileText className="h-10 w-10 text-gray-200" />
                </div>
                <h3 className="text-2xl font-black text-gray-400">Select a report to analyze</h3>
                <p className="text-gray-400 max-w-xs mt-3 font-medium">Click on any record from the left panel to view detailed parameters and AI insights.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'appointments' && (
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden animate-in fade-in duration-500">
          <div className="p-10 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
             <div>
               <h2 className="font-black text-gray-900 text-2xl tracking-tight">Upcoming Appointments</h2>
               <p className="text-sm font-medium text-gray-400 mt-1">Confirmed laboratory visits</p>
             </div>
             <span className="bg-blue-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-blue-500/20">{upcomingAppointments.length} Active</span>
          </div>
          <div className="overflow-x-auto p-4">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  <th className="px-8 py-6">Diagnostic Service</th>
                  <th className="px-8 py-6">Schedule Time</th>
                  <th className="px-8 py-6 text-center">Progress Status</th>
                  <th className="px-8 py-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {upcomingAppointments.length > 0 ? (
                  upcomingAppointments.map(app => (
                    <tr key={app.id} className="hover:bg-blue-50/20 transition-all group">
                      <td className="px-8 py-8">
                        <div className="font-black text-gray-900 text-lg">{app.serviceName}</div>
                        <div className="text-[10px] text-gray-400 font-mono font-black mt-1 uppercase tracking-tighter">REF: {app.id}</div>
                      </td>
                      <td className="px-8 py-8">
                        <div className="flex items-center text-gray-700 font-bold">
                          <Calendar className="h-4 w-4 mr-3 text-blue-500" />
                          {new Date(app.date).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                        </div>
                        <div className="text-xs text-gray-400 ml-7 mt-1 font-medium">{app.timeSlot}</div>
                      </td>
                      <td className="px-8 py-8 text-center">
                        <span className="inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-50 text-amber-600 border border-amber-100">
                          <Clock className="h-3 w-3 mr-2" />
                          {app.status}
                        </span>
                      </td>
                      <td className="px-8 py-8 text-right">
                        <button className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-700 hover:underline transition-colors">Cancel Booking</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-8 py-32 text-center text-gray-400">
                      <div className="flex flex-col items-center">
                        <Activity className="h-16 w-16 text-gray-100 mb-6" />
                        <p className="font-bold text-xl">No pending visits.</p>
                        <p className="text-sm mt-2 opacity-60">Your medical calendar is currently empty.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">Diagnostic History</h2>
              <p className="text-gray-500 font-medium mt-1">A lifetime record of your laboratory consultations.</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-2xl">
              <History className="h-8 w-8 text-gray-400" />
            </div>
          </div>

          <div className="grid gap-6">
            {pastAppointments.length > 0 ? (
              pastAppointments.map((app) => (
                <div 
                  key={app.id} 
                  className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/5 transition-all group"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                    <div className="flex items-start space-x-6">
                      <div className={`p-5 rounded-2xl shadow-sm ${
                        app.status === AppointmentStatus.COMPLETED ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                      }`}>
                        {app.status === AppointmentStatus.COMPLETED ? <CheckCircle2 className="h-8 w-8" /> : <Ban className="h-8 w-8" />}
                      </div>
                      <div>
                        <div className="flex items-center space-x-3 mb-1">
                          <h4 className="font-black text-gray-900 text-2xl">{app.serviceName}</h4>
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                            app.status === AppointmentStatus.COMPLETED ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {app.status}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-x-6 gap-y-2 mt-2 text-sm text-gray-400 font-bold uppercase tracking-wider">
                          <span className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-gray-300" />
                            {new Date(app.date).toLocaleDateString(undefined, { dateStyle: 'long' })}
                          </span>
                          <span className="flex items-center">
                            <Clock className="h-4 w-4 mr-2 text-gray-300" />
                            {app.timeSlot}
                          </span>
                          <span className="font-mono text-[10px] tracking-tighter bg-gray-50 px-2 py-1 rounded border border-gray-100">
                            ID: {app.id}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {app.status === AppointmentStatus.COMPLETED && (
                      <div className="flex items-center space-x-6 lg:ml-auto">
                        <button 
                          onClick={() => {
                            const result = myResults.find(r => r.appointmentId === app.id);
                            if (result) generatePDFReport(result);
                          }}
                          className="flex items-center text-gray-500 font-black text-xs uppercase tracking-widest hover:text-blue-600 transition-colors"
                        >
                          <Download className="h-5 w-5 mr-2" /> PDF Report
                        </button>
                        <div className="w-px h-8 bg-gray-100"></div>
                        <button 
                          onClick={() => {
                            const result = myResults.find(r => r.appointmentId === app.id);
                            if (result) {
                              setSelectedResult(result);
                              setActiveTab('results');
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }
                          }}
                          className="flex items-center text-blue-600 font-black text-xs uppercase tracking-widest group-hover:underline"
                        >
                          View Parameters <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white p-32 rounded-[3rem] border-2 border-dashed border-gray-100 text-center">
                <History className="h-20 w-20 text-gray-100 mx-auto mb-8" />
                <h3 className="text-2xl font-black text-gray-400">Archive empty.</h3>
                <p className="text-gray-400 max-w-sm mx-auto mt-4 font-medium leading-relaxed">Once you complete diagnostic sessions, the records will be preserved here for your lifetime access.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDashboard;
