
import React, { useState, useMemo, useEffect } from 'react';
import { Appointment, TestResult, AppointmentStatus, TestParameter, User } from '../types';
import { 
  ClipboardList, 
  CheckCircle, 
  Clock, 
  Search, 
  Plus, 
  Trash2, 
  Printer, 
  X, 
  History, 
  AlertCircle, 
  Loader2, 
  FileCheck, 
  User as UserIcon,
  Phone,
  Calendar,
  ChevronRight,
  FileText,
  Activity,
  Upload,
  Layers
} from 'lucide-react';
import { generatePDFReport } from '../services/pdfService';
import { TEST_TEMPLATES } from '../constants';

interface StaffDashboardProps {
  appointments: Appointment[];
  results: TestResult[];
  onCompleteAppointment: (appointmentId: string, results: TestResult) => void;
}

const StaffDashboard: React.FC<StaffDashboardProps> = ({ appointments, results, onCompleteAppointment }) => {
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [viewingPatientId, setViewingPatientId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // NABL Report Fields State
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [refDoctor, setRefDoctor] = useState('Self');
  const [sampleType, setSampleType] = useState('EDTA Whole Blood');
  const [collectedAt, setCollectedAt] = useState(new Date().toISOString().slice(0, 16));
  const [receivedAt, setReceivedAt] = useState(new Date().toISOString().slice(0, 16));
  const [analyzerUsed, setAnalyzerUsed] = useState('Automated Hematology Analyzer');
  const [internalQC, setInternalQC] = useState('Within Acceptable Limits');
  const [morphology, setMorphology] = useState('RBC Morphology: Normocytic Normochromic. WBC Morphology: Within normal limits. Platelets: Adequate.');
  
  // Parameter State
  const [parameters, setParameters] = useState<TestParameter[]>([{ name: '', value: '', unit: '', referenceRange: '', method: '', section: '' }]);
  const [remarks, setRemarks] = useState('Clinical correlation suggested.');

  // Auto-apply template when appointment is selected
  useEffect(() => {
    if (selectedAppointment) {
      const templateKey = selectedAppointment.serviceId;
      if (TEST_TEMPLATES[templateKey]) {
        applyTemplate(templateKey);
      } else {
        // Fallback for custom entries
        setParameters([{ name: '', value: '', unit: '', referenceRange: '', method: '', section: '' }]);
      }
    }
  }, [selectedAppointment]);

  const filteredAppointments = useMemo(() => {
    return appointments.filter(a => 
      a.patientName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      a.serviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [appointments, searchQuery]);

  const patientGroups = useMemo(() => {
    const groups: Record<string, { name: string; appointments: Appointment[]; reports: TestResult[] }> = {};
    appointments.forEach(app => {
      if (!groups[app.patientId]) {
        groups[app.patientId] = { name: app.patientName, appointments: [], reports: [] };
      }
      groups[app.patientId].appointments.push(app);
    });
    results.forEach(res => {
      if (groups[res.patientId]) {
        groups[res.patientId].reports.push(res);
      }
    });
    return groups;
  }, [appointments, results]);

  const selectedPatientData = viewingPatientId ? patientGroups[viewingPatientId] : null;

  const patientHistory = useMemo(() => {
    if (!selectedAppointment) return [];
    return results
      .filter(r => r.patientId === selectedAppointment.patientId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [selectedAppointment, results]);

  const addParameter = () => setParameters([...parameters, { name: '', value: '', unit: '', referenceRange: '', method: '', section: '' }]);
  const removeParameter = (index: number) => setParameters(parameters.filter((_, i) => i !== index));
  
  const updateParameter = (index: number, field: keyof TestParameter, value: string) => {
    const newParams = [...parameters];
    newParams[index][field] = value;
    setParameters(newParams);
  };

  const applyTemplate = (templateKey: string) => {
    const template = TEST_TEMPLATES[templateKey];
    if (template) {
      const templateParams = template.params.map(p => ({
        name: p.name,
        value: '',
        unit: p.unit,
        referenceRange: p.referenceRange,
        method: p.method,
        section: p.section
      }));
      setParameters(templateParams);
      if (template.analyzer) setAnalyzerUsed(template.analyzer);
    }
  };

  const handleSubmitResults = async () => {
    if (!selectedAppointment) return;

    if (parameters.some(p => !p.name || !p.value)) {
      alert("Please ensure all parameters have names and values before finalization.");
      return;
    }

    setIsFinalizing(true);

    const result: TestResult = {
      id: 'REP-' + Math.floor(100000 + Math.random() * 900000),
      appointmentId: selectedAppointment.id,
      patientId: selectedAppointment.patientId,
      patientName: selectedAppointment.patientName,
      age,
      gender,
      refDoctor,
      sampleType,
      collectedAt,
      receivedAt,
      testName: selectedAppointment.serviceName,
      date: new Date().toISOString().split('T')[0],
      parameters,
      doctorRemarks: remarks,
      analyzerUsed,
      internalQC,
      morphology: selectedAppointment.serviceName.includes('CBP') || selectedAppointment.serviceName.includes('CBC') ? morphology : undefined
    };

    await new Promise(resolve => setTimeout(resolve, 1500));

    onCompleteAppointment(selectedAppointment.id, result);
    generatePDFReport(result);
    
    setIsFinalizing(false);
    setShowSuccess(true);

    setTimeout(() => {
      setShowSuccess(false);
      setSelectedAppointment(null);
      setAge('');
      setParameters([{ name: '', value: '', unit: '', referenceRange: '', method: '', section: '' }]);
    }, 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-10 gap-6">
        <div>
          <div className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-3">
            Administrative Control Panel
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight uppercase">Lab Operations</h1>
          <p className="text-gray-500 mt-2 text-lg font-medium">Manage patient bookings, samples, and diagnostic reports.</p>
        </div>
        <div className="relative group w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search patient, test, or ID..." 
            className="pl-12 pr-4 py-4 border-2 border-gray-100 bg-white rounded-2xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all w-full font-bold text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <th className="px-8 py-6">Patient & Reference</th>
                <th className="px-8 py-6">Diagnostic Service</th>
                <th className="px-8 py-6">Schedule</th>
                <th className="px-8 py-6 text-center">Status</th>
                <th className="px-8 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredAppointments.length > 0 ? (
                filteredAppointments.map(app => (
                  <tr key={app.id} className="hover:bg-blue-50/20 transition-all group">
                    <td className="px-8 py-6">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mr-4 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                          <UserIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <button 
                            onClick={() => setViewingPatientId(app.patientId)}
                            className="font-black text-gray-900 text-base hover:text-blue-600 transition-colors block text-left"
                          >
                            {app.patientName}
                          </button>
                          <div className="text-[10px] text-gray-400 font-mono font-bold uppercase tracking-wider">ID: {app.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="text-gray-900 font-bold text-sm">{app.serviceName}</div>
                      <div className="text-[10px] text-blue-600 font-black uppercase tracking-widest mt-0.5">Clinical Diagnostic</div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center text-sm font-black text-gray-800">
                        <Calendar className="h-3.5 w-3.5 mr-2 text-gray-300" />
                        {new Date(app.date).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-400 font-medium ml-5 mt-0.5">{app.timeSlot}</div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        app.status === 'COMPLETED' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-amber-100 text-amber-700 border border-amber-200'
                      }`}>
                        {app.status === 'COMPLETED' ? <CheckCircle className="h-3 w-3 mr-2" /> : <Clock className="h-3 w-3 mr-2" />}
                        {app.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-3">
                        <button 
                          onClick={() => setViewingPatientId(app.patientId)}
                          className="p-2.5 bg-gray-100 text-gray-500 rounded-xl hover:bg-gray-200 hover:text-gray-700 transition-all"
                          title="Patient Details"
                        >
                          <History className="h-4 w-4" />
                        </button>
                        {app.status === 'PENDING' ? (
                          <button
                            onClick={() => setSelectedAppointment(app)}
                            className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/10 active:scale-95 flex items-center"
                          >
                            <Upload className="h-3.5 w-3.5 mr-2" /> Enter Report Values
                          </button>
                        ) : (
                          <button 
                            onClick={() => {
                              const result = results.find(r => r.appointmentId === app.id);
                              if (result) generatePDFReport(result);
                            }}
                            className="px-6 py-2.5 bg-green-50 text-green-700 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-green-100 transition-all border border-green-100 flex items-center"
                          >
                            <Printer className="h-3.5 w-3.5 mr-2" /> Print Report
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-8 py-40 text-center text-gray-400">
                     <div className="bg-gray-50 w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                        <ClipboardList className="h-10 w-10 opacity-20" />
                     </div>
                     <p className="font-bold text-xl text-gray-600">No matching bookings found.</p>
                     <p className="text-sm mt-2 max-w-xs mx-auto">Waiting for patients to book services or try adjusting your search criteria.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Patient Profile Modal */}
      {viewingPatientId && selectedPatientData && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-[3rem] w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl border border-gray-100 flex flex-col">
            <div className="p-10 border-b border-gray-100 flex justify-between items-start bg-gray-50/50">
              <div className="flex items-center">
                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mr-6 shadow-xl shadow-blue-500/20 text-white">
                  <UserIcon className="h-8 w-8" />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-gray-900 leading-tight">{selectedPatientData.name}</h2>
                  <div className="flex items-center space-x-6 mt-1">
                    <div className="flex items-center text-sm font-bold text-gray-400">
                      <Phone className="h-3.5 w-3.5 mr-2" />
                      +91 95335 50105
                    </div>
                    <div className="flex items-center text-sm font-bold text-gray-400">
                      <Activity className="h-3.5 w-3.5 mr-2" />
                      Patient Portal ID: {viewingPatientId}
                    </div>
                  </div>
                </div>
              </div>
              <button onClick={() => setViewingPatientId(null)} className="p-3 hover:bg-white rounded-full transition-all bg-gray-100 text-gray-400 hover:text-red-500">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="flex-grow overflow-y-auto p-10 space-y-10 scrollbar-hide">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center">
                    <Calendar className="h-4 w-4 mr-2" /> Appointment Log
                  </h3>
                  <div className="space-y-4">
                    {selectedPatientData.appointments.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(app => (
                      <div key={app.id} className="p-5 bg-gray-50 rounded-2xl border border-transparent hover:border-blue-100 transition-all flex justify-between items-center group">
                        <div>
                          <p className="font-bold text-gray-900">{app.serviceName}</p>
                          <p className="text-[10px] text-gray-400 font-black uppercase mt-1">{new Date(app.date).toLocaleDateString()} at {app.timeSlot}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                          app.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {app.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center">
                    <FileText className="h-4 w-4 mr-2" /> Released Reports
                  </h3>
                  <div className="space-y-4">
                    {selectedPatientData.reports.length > 0 ? (
                      selectedPatientData.reports.map(res => (
                        <div key={res.id} className="p-5 bg-white border border-gray-100 rounded-2xl flex justify-between items-center hover:shadow-lg hover:shadow-gray-200/50 transition-all group">
                          <div>
                            <p className="font-bold text-gray-900">{res.testName}</p>
                            <p className="text-[10px] text-blue-600 font-black uppercase mt-1">REPORT ID: {res.id}</p>
                          </div>
                          <button 
                            onClick={() => generatePDFReport(res)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                          >
                            <Printer className="h-5 w-5" />
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="py-12 text-center border-2 border-dashed border-gray-100 rounded-3xl">
                        <p className="text-sm font-bold text-gray-300">No finalized reports yet.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-10 border-t border-gray-50 bg-gray-50/30">
              <button 
                onClick={() => setViewingPatientId(null)}
                className="w-full py-4 bg-white border border-gray-200 text-gray-500 font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-gray-50 transition-all shadow-sm"
              >
                Close Patient Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Entry Modal */}
      {selectedAppointment && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-[2.5rem] w-full max-w-[95vw] max-h-[95vh] overflow-hidden shadow-2xl flex flex-col relative border border-white/20">
            
            {showSuccess && (
              <div className="absolute inset-0 z-[70] bg-white/95 flex flex-col items-center justify-center animate-in zoom-in backdrop-blur-sm text-center">
                <div className="bg-green-100 p-8 rounded-full mb-8 animate-bounce">
                   <CheckCircle className="h-24 w-24 text-green-600" />
                </div>
                <h2 className="text-4xl font-black text-gray-900 tracking-tight uppercase">NABL Report Generated</h2>
                <p className="text-gray-500 mt-2 text-xl font-medium">Record is finalized and visible to {selectedAppointment.patientName}.</p>
                <div className="mt-10 p-6 bg-gray-50 rounded-[2rem] border border-gray-100 flex items-center animate-pulse">
                   <Printer className="h-6 w-6 text-blue-600 mr-4" />
                   <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Generating PDF Document...</p>
                </div>
              </div>
            )}

            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center">
                <div className="bg-blue-600 p-3.5 rounded-2xl mr-5 shadow-xl shadow-blue-500/20 text-white">
                  <FileText className="h-7 w-7" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight leading-tight">Report Entry: {selectedAppointment.patientName}</h2>
                  <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.2em] opacity-80 flex items-center">
                    <Layers className="h-3 w-3 mr-2 text-blue-600" />
                    AUTO-TEMPLATE: {selectedAppointment.serviceId} • REF: {selectedAppointment.id}
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedAppointment(null)} className="p-3 hover:bg-gray-100 rounded-full transition-all text-gray-400 hover:text-red-500">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="flex-grow overflow-hidden flex flex-col lg:flex-row">
              <div className="w-full lg:w-80 bg-gray-50/80 border-r border-gray-100 overflow-y-auto p-8 scrollbar-hide">
                <div className="flex items-center space-x-2 mb-8 text-gray-400">
                   <History className="h-4 w-4" />
                   <h3 className="text-[10px] font-black uppercase tracking-widest">Test History (Trend)</h3>
                </div>
                
                {patientHistory.length > 0 ? (
                  <div className="space-y-6">
                    {patientHistory.map((hist) => (
                      <div key={hist.id} className="bg-white p-6 rounded-[1.5rem] border border-gray-100 shadow-sm hover:border-blue-200 transition-all group">
                         <div className="flex justify-between items-start mb-3">
                            <p className="text-[10px] font-black text-blue-600 uppercase">{new Date(hist.date).toLocaleDateString()}</p>
                            <Printer className="h-3 w-3 text-gray-300" />
                         </div>
                         <h4 className="text-xs font-black text-gray-900 leading-tight mb-4">{hist.testName}</h4>
                         <div className="space-y-2">
                            {hist.parameters.slice(0, 3).map((p, idx) => (
                              <div key={idx} className="flex justify-between text-[10px] font-bold border-b border-gray-50 pb-1.5 last:border-0">
                                 <span className="text-gray-400">{p.name}</span>
                                 <span className="text-gray-800">{p.value} {p.unit}</span>
                              </div>
                            ))}
                         </div>
                         <button onClick={() => generatePDFReport(hist)} className="w-full mt-4 py-2 border border-gray-100 text-[8px] font-black uppercase tracking-widest text-gray-400 hover:text-blue-600 transition-colors">Download Copy</button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-gray-100">
                     <AlertCircle className="h-10 w-10 text-gray-100 mx-auto mb-4" />
                     <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest leading-relaxed">No Prior Records Found.<br/>New Clinical Profile.</p>
                  </div>
                )}
              </div>

              <div className="flex-grow overflow-y-auto p-8 md:p-12 scrollbar-thin">
                <div className="grid grid-cols-1 gap-12">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-6 bg-gray-50/50 p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 border-b border-gray-100 pb-2">Patient Demographics</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[9px] font-black text-gray-500 uppercase mb-2">Age</label>
                          <input type="text" className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl font-black text-sm outline-none focus:ring-4 focus:ring-blue-50 transition-all" value={age} onChange={(e) => setAge(e.target.value)} placeholder="e.g. 28 Y" />
                        </div>
                        <div>
                          <label className="block text-[9px] font-black text-gray-500 uppercase mb-2">Gender</label>
                          <select className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl font-black text-sm outline-none focus:ring-4 focus:ring-blue-50 transition-all" value={gender} onChange={(e) => setGender(e.target.value)}>
                            <option>Male</option>
                            <option>Female</option>
                            <option>Other</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[9px] font-black text-gray-500 uppercase mb-2">Ref. Doctor</label>
                        <input type="text" className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl font-black text-sm outline-none focus:ring-4 focus:ring-blue-50 transition-all" value={refDoctor} onChange={(e) => setRefDoctor(e.target.value)} />
                      </div>
                    </div>

                    <div className="space-y-6 bg-gray-50/50 p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 border-b border-gray-100 pb-2">Technical Collection</h4>
                      <div>
                        <label className="block text-[9px] font-black text-gray-500 uppercase mb-2">Sample Type</label>
                        <input type="text" className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl font-black text-sm outline-none focus:ring-4 focus:ring-blue-50 transition-all" value={sampleType} onChange={(e) => setSampleType(e.target.value)} />
                      </div>
                      <div className="grid grid-cols-1 gap-4">
                         <div>
                            <label className="block text-[9px] font-black text-blue-600 uppercase mb-2">Collected At</label>
                            <input type="datetime-local" className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl text-xs font-bold outline-none focus:ring-4 focus:ring-blue-50 transition-all" value={collectedAt} onChange={(e) => setCollectedAt(e.target.value)} />
                         </div>
                         <div>
                            <label className="block text-[9px] font-black text-blue-600 uppercase mb-2">Received At</label>
                            <input type="datetime-local" className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl text-xs font-bold outline-none focus:ring-4 focus:ring-blue-50 transition-all" value={receivedAt} onChange={(e) => setReceivedAt(e.target.value)} />
                         </div>
                      </div>
                    </div>

                    <div className="space-y-6 bg-gray-50/50 p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 border-b border-gray-100 pb-2">Lab Protocol</h4>
                      <div>
                        <label className="block text-[9px] font-black text-gray-500 uppercase mb-2">Analyzer Model</label>
                        <input type="text" className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl font-black text-[10px] outline-none focus:ring-4 focus:ring-blue-50 transition-all" value={analyzerUsed} onChange={(e) => setAnalyzerUsed(e.target.value)} />
                      </div>
                      <div>
                        <label className="block text-[9px] font-black text-gray-500 uppercase mb-2">Internal Quality Check</label>
                        <input type="text" className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl font-black text-[10px] outline-none focus:ring-4 focus:ring-blue-50 transition-all" value={internalQC} onChange={(e) => setInternalQC(e.target.value)} />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-100 pb-6 gap-6">
                      <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight flex items-center">
                        <Activity className="h-5 w-5 mr-3 text-blue-600" /> Clinical Data Entry
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {Object.keys(TEST_TEMPLATES).map(t => (
                          <button key={t} onClick={() => applyTemplate(t)} className={`px-5 py-2.5 border-2 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest shadow-sm active:scale-95 ${
                            selectedAppointment.serviceId === t ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-gray-100 text-gray-400 hover:border-blue-600 hover:text-blue-600'
                          }`}>Load {t} Pack</button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      {parameters.map((param, index) => (
                        <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end bg-white border border-gray-100 p-8 rounded-[2rem] group hover:shadow-2xl hover:shadow-gray-200/40 hover:border-blue-100 transition-all animate-in slide-in-from-left-2">
                          <div className="md:col-span-3">
                            <label className="block text-[8px] font-black text-gray-400 uppercase mb-2 tracking-widest">Section & Parameter</label>
                            <input type="text" placeholder="SECTION (e.g. BLOOD)" className="w-full px-4 py-2 bg-gray-50 border-0 rounded-xl text-[9px] mb-2 font-black text-blue-600 uppercase outline-none focus:bg-blue-50 transition-colors" value={param.section} onChange={(e) => updateParameter(index, 'section', e.target.value)} />
                            <input type="text" placeholder="Parameter Name" className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl text-xs font-black text-gray-900 outline-none focus:bg-blue-50 transition-colors" value={param.name} onChange={(e) => updateParameter(index, 'name', e.target.value)} />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-[8px] font-black text-gray-400 uppercase mb-2 tracking-widest">Result</label>
                            <input type="text" placeholder="0.0" className="w-full px-4 py-3 bg-blue-50 text-blue-700 border-2 border-transparent focus:border-blue-500 rounded-xl text-sm font-black outline-none text-center transition-all" value={param.value} onChange={(e) => updateParameter(index, 'value', e.target.value)} />
                          </div>
                          <div className="md:col-span-1">
                            <label className="block text-[8px] font-black text-gray-400 uppercase mb-2 tracking-widest text-center">Unit</label>
                            <input type="text" className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl text-[10px] font-bold text-center outline-none focus:bg-gray-100 transition-colors" value={param.unit} onChange={(e) => updateParameter(index, 'unit', e.target.value)} />
                          </div>
                          <div className="md:col-span-3">
                            <label className="block text-[8px] font-black text-gray-400 uppercase mb-2 tracking-widest">Ref. Interval</label>
                            <input type="text" className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl text-[10px] font-medium italic outline-none focus:bg-gray-100 transition-colors" value={param.referenceRange} onChange={(e) => updateParameter(index, 'referenceRange', e.target.value)} />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-[8px] font-black text-gray-400 uppercase mb-2 tracking-widest">Method</label>
                            <input type="text" className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl text-[10px] font-bold outline-none focus:bg-gray-100 transition-colors" value={param.method} onChange={(e) => updateParameter(index, 'method', e.target.value)} />
                          </div>
                          <div className="md:col-span-1 flex justify-center">
                            <button onClick={() => removeParameter(index)} className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all opacity-0 group-hover:opacity-100"><Trash2 className="h-5 w-5" /></button>
                          </div>
                        </div>
                      ))}
                      <button onClick={addParameter} className="w-full py-6 border-2 border-dashed border-gray-100 text-gray-400 rounded-[2rem] hover:border-blue-200 hover:text-blue-500 text-[10px] font-black uppercase flex items-center justify-center transition-all bg-gray-50/20 group active:scale-[0.99]">
                        <Plus className="h-5 w-5 mr-3 group-hover:rotate-90 transition-transform" /> Append Parameter Row
                      </button>
                    </div>

                    {(selectedAppointment.serviceName.includes('CBP') || selectedAppointment.serviceName.includes('CBC')) && (
                      <div className="space-y-3">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Morphological Findings (Peripheral Smear Analysis)</label>
                        <textarea className="w-full p-8 bg-gray-50 border border-gray-100 rounded-[2.5rem] text-sm font-medium focus:ring-4 focus:ring-blue-50 outline-none leading-relaxed transition-all min-h-[140px]" placeholder="RBC morphology, WBC differential analysis..." value={morphology} onChange={(e) => setMorphology(e.target.value)} />
                      </div>
                    )}

                    <div className="space-y-3">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Clinical Correlation & Expert Advice</label>
                      <textarea className="w-full p-10 bg-gray-50 border border-gray-100 rounded-[3rem] min-h-[160px] text-sm font-medium focus:ring-4 focus:ring-blue-50 outline-none leading-relaxed transition-all" placeholder="Enter findings that require clinical attention..." value={remarks} onChange={(e) => setRemarks(e.target.value)} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-10 border-t border-gray-100 bg-white flex gap-6">
              <button disabled={isFinalizing} onClick={() => setSelectedAppointment(null)} className="flex-1 py-5 text-gray-400 font-black uppercase tracking-widest text-xs disabled:opacity-50 hover:bg-gray-50 rounded-2xl transition-all">Discard Draft</button>
              <button disabled={isFinalizing} onClick={handleSubmitResults} className="flex-[4] py-5 bg-blue-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-sm flex items-center justify-center shadow-2xl shadow-blue-500/40 active:scale-95 transition-all disabled:opacity-50">
                {isFinalizing ? <Loader2 className="animate-spin h-6 w-6 mr-3" /> : <FileCheck className="h-6 w-6 mr-3" />}
                Validate & Finalize Clinical Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffDashboard;
