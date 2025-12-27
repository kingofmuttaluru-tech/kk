
import React, { useState, useMemo } from 'react';
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
  FileDown
} from 'lucide-react';
import { generatePDFReport } from '../services/pdfService';
import { getHealthInsights } from '../services/geminiService';

interface PatientDashboardProps {
  user: User;
  appointments: Appointment[];
  results: TestResult[];
}

const PatientDashboard: React.FC<PatientDashboardProps> = ({ user, appointments, results }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'appointments' | 'results' | 'history'>('overview');
  const [selectedResult, setSelectedResult] = useState<TestResult | null>(null);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);

  const myAppointments = useMemo(() => appointments.filter(a => a.patientId === user.id), [appointments, user.id]);
  const myResults = useMemo(() => results.filter(r => r.patientId === user.id), [results, user.id]);

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

  const renderOverview = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center">
          <div className="bg-blue-50 p-3 rounded-xl mr-4">
            <Calendar className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Upcoming</p>
            <p className="text-2xl font-bold text-gray-900">{upcomingAppointments.length} Appointments</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center">
          <div className="bg-green-50 p-3 rounded-xl mr-4">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Completed</p>
            <p className="text-2xl font-bold text-gray-900">{myResults.length} Test Reports</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center">
          <div className="bg-purple-50 p-3 rounded-xl mr-4">
            <TrendingUp className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Health Score</p>
            <p className="text-2xl font-bold text-gray-900">Optimal</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Next Appointment Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50 flex justify-between items-center">
            <h3 className="font-bold text-gray-900">Next Scheduled Visit</h3>
            <button onClick={() => setActiveTab('appointments')} className="text-sm text-blue-600 font-semibold hover:underline">View All</button>
          </div>
          <div className="p-6">
            {upcomingAppointments.length > 0 ? (
              <div className="flex items-start space-x-4">
                <div className="bg-blue-600 text-white rounded-xl px-4 py-2 text-center">
                  <span className="block text-xl font-bold">{new Date(upcomingAppointments[0].date).getDate()}</span>
                  <span className="text-xs uppercase font-medium">{new Date(upcomingAppointments[0].date).toLocaleString('default', { month: 'short' })}</span>
                </div>
                <div className="flex-grow">
                  <h4 className="font-bold text-gray-900 text-lg">{upcomingAppointments[0].serviceName}</h4>
                  <div className="flex items-center text-gray-500 text-sm mt-1">
                    <Clock className="h-4 w-4 mr-1" />
                    {upcomingAppointments[0].timeSlot}
                  </div>
                  <div className="mt-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Confirmed
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-300" />
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-400 text-sm">No upcoming appointments scheduled.</p>
                <button className="mt-2 text-blue-600 font-bold text-sm">Schedule a test now</button>
              </div>
            )}
          </div>
        </div>

        {/* Latest Report Preview */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50 flex justify-between items-center">
            <h3 className="font-bold text-gray-900">Latest Test Result</h3>
            <button onClick={() => setActiveTab('results')} className="text-sm text-blue-600 font-semibold hover:underline">View All</button>
          </div>
          <div className="p-6">
            {myResults.length > 0 ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-gray-100 p-3 rounded-xl">
                    <FileText className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{myResults[0].testName}</h4>
                    <p className="text-sm text-gray-500">{new Date(myResults[0].date).toLocaleDateString()}</p>
                  </div>
                </div>
                <button 
                  onClick={() => generatePDFReport(myResults[0])}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg flex items-center space-x-1"
                  title="Download PDF"
                >
                  <Download className="h-5 w-5" />
                  <span className="text-xs font-bold hidden sm:inline">PDF</span>
                </button>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-400 text-sm">No test results available yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-8">
        <div>
          <p className="text-blue-600 font-bold tracking-widest uppercase text-xs mb-1">Patient Portal</p>
          <h1 className="text-4xl font-extrabold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-2">Welcome back, {user.name}. Here's your clinical overview.</p>
        </div>
        
        <div className="mt-6 md:mt-0 inline-flex p-1 bg-gray-100 rounded-xl">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'results', label: 'Reports' },
            { id: 'appointments', label: 'Upcoming' },
            { id: 'history', label: 'History' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === tab.id ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'overview' && renderOverview()}

      {activeTab === 'results' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-blue-600" />
              All Reports
            </h2>
            {myResults.length > 0 ? (
              myResults.map(result => (
                <div
                  key={result.id}
                  onClick={() => {
                    setSelectedResult(result);
                    setAiInsight(null);
                  }}
                  className={`p-4 rounded-xl cursor-pointer border transition-all ${
                    selectedResult?.id === result.id ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' : 'bg-white border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-gray-900">{result.testName}</h3>
                      <p className="text-sm text-gray-500">{new Date(result.date).toLocaleDateString()}</p>
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          generatePDFReport(result);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                        title="Download PDF"
                      >
                        <Download className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white p-10 rounded-xl border border-dashed border-gray-300 text-center">
                <p className="text-gray-400">No reports available yet.</p>
              </div>
            )}
          </div>

          <div className="lg:col-span-2">
            {selectedResult ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden sticky top-24">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{selectedResult.testName}</h3>
                    <p className="text-sm text-gray-500">Report ID: {selectedResult.id}</p>
                  </div>
                  <button
                    onClick={() => generatePDFReport(selectedResult)}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/10"
                  >
                    <Download className="h-4 w-4 mr-2" /> Download PDF
                  </button>
                </div>
                <div className="p-6">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-gray-200 text-sm font-bold text-gray-500 uppercase">
                          <th className="pb-3 pr-4">Parameter</th>
                          <th className="pb-3 pr-4 text-center">Result</th>
                          <th className="pb-3 pr-4">Unit</th>
                          <th className="pb-3">Ref Range</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {selectedResult.parameters.map((p, i) => (
                          <tr key={i}>
                            <td className="py-4 font-medium text-gray-900 pr-4">{p.name}</td>
                            <td className="py-4 text-center pr-4">
                              <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 rounded-lg font-bold">
                                {p.value}
                              </span>
                            </td>
                            <td className="py-4 text-gray-600 pr-4">{p.unit}</td>
                            <td className="py-4 text-gray-400 text-sm italic">{p.referenceRange}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-8 p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <h4 className="font-bold text-gray-700 mb-2 flex items-center">
                      <Info className="h-4 w-4 mr-2 text-blue-500" />
                      Doctor's Remarks
                    </h4>
                    <p className="text-gray-600 italic">"{selectedResult.doctorRemarks}"</p>
                  </div>

                  <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      onClick={() => fetchAiInsight(selectedResult)}
                      disabled={isLoadingInsight}
                      className="w-full flex items-center justify-center p-4 bg-purple-50 text-purple-700 rounded-xl border border-purple-200 font-bold hover:bg-purple-100 transition-all group shadow-sm hover:shadow-md"
                    >
                      <BrainCircuit className={`h-5 w-5 mr-2 transition-transform group-hover:scale-110 ${isLoadingInsight ? 'animate-spin' : ''}`} />
                      {isLoadingInsight ? 'Analyzing...' : 'AI Medical Interpretation'}
                    </button>
                    
                    <button
                      onClick={() => generatePDFReport(selectedResult)}
                      className="w-full flex items-center justify-center p-4 bg-blue-50 text-blue-700 rounded-xl border border-blue-200 font-bold hover:bg-blue-100 transition-all group shadow-sm hover:shadow-md"
                    >
                      <FileDown className="h-5 w-5 mr-2 transition-transform group-hover:translate-y-0.5" />
                      Save Official Report (PDF)
                    </button>
                  </div>

                  {aiInsight && (
                    <div className="mt-6 p-6 bg-white border-2 border-purple-100 rounded-xl animate-in fade-in slide-in-from-top-4 duration-500">
                      <h5 className="font-bold text-purple-900 mb-2 flex items-center">
                        <BrainCircuit className="h-4 w-4 mr-2" />
                        AI Clinical Insights
                      </h5>
                      <div className="prose prose-purple text-gray-700 text-sm whitespace-pre-wrap leading-relaxed">
                        {aiInsight}
                      </div>
                      <div className="mt-4 flex items-start p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                        <AlertCircle className="h-4 w-4 text-yellow-600 mr-2 mt-0.5" />
                        <p className="text-[10px] text-yellow-800 uppercase font-bold tracking-tight">AI interpretation only. Always consult a qualified medical professional.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 p-10 text-center">
                <FileText className="h-16 w-16 text-gray-200 mb-4" />
                <h3 className="text-xl font-bold text-gray-400">Select a report to view details</h3>
                <p className="text-gray-400 max-w-xs mt-2">Past laboratory test results will be displayed here as soon as they are finalized by the lab.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'appointments' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden animate-in fade-in duration-500">
          <div className="p-6 border-b border-gray-50 flex justify-between items-center">
             <h2 className="font-bold text-gray-900 text-lg">Upcoming Appointments</h2>
             <span className="text-sm text-gray-500">{upcomingAppointments.length} scheduled</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-sm font-bold text-gray-500 uppercase">
                  <th className="px-6 py-4">Test Service</th>
                  <th className="px-6 py-4">Date & Time</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {upcomingAppointments.length > 0 ? (
                  upcomingAppointments.map(app => (
                    <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900">{app.serviceName}</div>
                        <div className="text-xs text-gray-400 font-mono tracking-tighter">REF: {app.id}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-gray-700 font-medium">
                          <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                          {new Date(app.date).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                        </div>
                        <div className="text-sm text-gray-500 ml-6">{app.timeSlot}</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-blue-100 text-blue-800">
                          <Clock className="h-3 v-3 mr-1" />
                          {app.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-sm font-bold text-red-600 hover:text-red-800 hover:underline">Cancel</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-20 text-center text-gray-400">
                      <div className="flex flex-col items-center">
                        <Activity className="h-12 w-12 text-gray-200 mb-2" />
                        <p>No upcoming appointments scheduled.</p>
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
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Medical History</h2>
              <p className="text-sm text-gray-500">A comprehensive record of all your past visits and diagnostic tests.</p>
            </div>
            <div className="p-3 bg-gray-100 rounded-xl">
              <History className="h-6 w-6 text-gray-600" />
            </div>
          </div>

          <div className="space-y-4">
            {pastAppointments.length > 0 ? (
              pastAppointments.map((app) => (
                <div 
                  key={app.id} 
                  className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:border-blue-200 transition-all group"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 rounded-xl ${
                        app.status === AppointmentStatus.COMPLETED ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                      }`}>
                        {app.status === AppointmentStatus.COMPLETED ? <CheckCircle2 className="h-6 w-6" /> : <Ban className="h-6 w-6" />}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-lg">{app.serviceName}</h4>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-gray-500">
                          <span className="flex items-center">
                            <Calendar className="h-3.5 w-3.5 mr-1.5" />
                            {new Date(app.date).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                          </span>
                          <span className="flex items-center">
                            <Clock className="h-3.5 w-3.5 mr-1.5" />
                            {app.timeSlot}
                          </span>
                          <span className="font-mono text-[10px] uppercase tracking-wider bg-gray-100 px-1.5 py-0.5 rounded">
                            REF: {app.id}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 md:ml-auto">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                        app.status === AppointmentStatus.COMPLETED ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {app.status}
                      </span>
                      
                      {app.status === AppointmentStatus.COMPLETED && (
                        <div className="flex items-center space-x-3">
                          <button 
                            onClick={() => {
                              const result = myResults.find(r => r.appointmentId === app.id);
                              if (result) {
                                generatePDFReport(result);
                              }
                            }}
                            className="flex items-center text-gray-600 font-bold text-xs hover:text-blue-600 transition-colors"
                            title="Download Report"
                          >
                            <Download className="h-4 w-4 mr-1.5" /> PDF
                          </button>
                          <div className="w-px h-4 bg-gray-200"></div>
                          <button 
                            onClick={() => {
                              const result = myResults.find(r => r.appointmentId === app.id);
                              if (result) {
                                setSelectedResult(result);
                                setActiveTab('results');
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }
                            }}
                            className="flex items-center text-blue-600 font-bold text-sm hover:underline"
                          >
                            View Report <ArrowRight className="h-4 w-4 ml-1.5 group-hover:translate-x-1 transition-transform" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white p-20 rounded-2xl border-2 border-dashed border-gray-200 text-center">
                <History className="h-12 w-12 text-gray-200 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-400">No history available</h3>
                <p className="text-gray-400 max-w-xs mx-auto mt-1">When you complete or cancel a medical visit, it will be archived here for your records.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDashboard;
