
import React, { useState } from 'react';
import { Appointment, TestResult, AppointmentStatus, TestParameter } from '../types';
import { ClipboardList, Upload, CheckCircle, Clock, Search, Plus, Trash2, Printer, X, Sparkles, Loader2, FileCheck } from 'lucide-react';
import { generatePDFReport } from '../services/pdfService';
import { TEST_TEMPLATES } from '../constants';

interface StaffDashboardProps {
  appointments: Appointment[];
  onCompleteAppointment: (appointmentId: string, results: TestResult) => void;
}

const StaffDashboard: React.FC<StaffDashboardProps> = ({ appointments, onCompleteAppointment }) => {
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
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

  const filteredAppointments = appointments.filter(a => 
    a.patientName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    a.serviceName.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Staff Operations</h1>
          <p className="text-gray-500 mt-2 text-lg">Manage NABL-standard diagnostic reporting.</p>
        </div>
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search patient..." 
            className="pl-10 pr-4 py-3 border border-gray-200 bg-white rounded-xl outline-none focus:ring-4 focus:ring-blue-50 transition-all w-full md:w-64 font-medium"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <th className="px-8 py-5">Patient Details</th>
                <th className="px-8 py-5">Assigned Test</th>
                <th className="px-8 py-5">Schedule</th>
                <th className="px-8 py-5 text-center">Status</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredAppointments.length > 0 ? (
                filteredAppointments.map(app => (
                  <tr key={app.id} className="hover:bg-blue-50/20 transition-colors">
                    <td className="px-8 py-6">
                      <div className="font-bold text-gray-900">{app.patientName}</div>
                      <div className="text-[10px] text-gray-400 font-mono">ID: {app.patientId}</div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="text-gray-700 font-semibold">{app.serviceName}</div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="text-sm font-bold text-gray-800">{new Date(app.date).toLocaleDateString()}</div>
                      <div className="text-xs text-gray-400">{app.timeSlot}</div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        app.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      {app.status === 'PENDING' ? (
                        <button
                          onClick={() => setSelectedAppointment(app)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-xs hover:bg-blue-700 transition-all shadow-md active:scale-95"
                        >
                          Process NABL Report
                        </button>
                      ) : (
                        <div className="text-green-600 font-bold text-xs flex items-center justify-end">
                          <CheckCircle className="h-4 w-4 mr-1" /> Reported
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-gray-400 font-medium italic">No pending reports for processing.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedAppointment && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-[2.5rem] w-full max-w-7xl max-h-[95vh] overflow-hidden shadow-2xl flex flex-col relative border border-white/20">
            
            {showSuccess && (
              <div className="absolute inset-0 z-[70] bg-white/95 flex flex-col items-center justify-center animate-in zoom-in backdrop-blur-sm">
                <CheckCircle className="h-24 w-24 text-green-600 mb-6" />
                <h2 className="text-4xl font-black text-gray-900 tracking-tight">NABL Report Generated</h2>
                <p className="text-gray-500 mt-2 text-xl font-medium">Report is saved and ready for patient portal.</p>
              </div>
            )}

            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center">
                <div className="bg-blue-600 p-3 rounded-2xl mr-5">
                  <Printer className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">NABL Diagnostic Entry</h2>
                  <p className="text-gray-500 font-semibold">Processing: {selectedAppointment.serviceName}</p>
                </div>
              </div>
              <button onClick={() => setSelectedAppointment(null)} className="p-3 hover:bg-gray-100 rounded-full transition-all">
                <X className="h-6 w-6 text-gray-400 hover:text-red-500" />
              </button>
            </div>
            
            <div className="flex-grow overflow-y-auto p-8 md:p-10 scrollbar-thin">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Demographics Panel */}
                <div className="lg:col-span-1 space-y-6">
                  <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest border-b pb-2">Patient Demographics</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-gray-500 uppercase mb-2">Age</label>
                      <input type="text" className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl font-bold focus:ring-2 focus:ring-blue-500" value={age} onChange={(e) => setAge(e.target.value)} placeholder="e.g. 28 Y" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-500 uppercase mb-2">Gender</label>
                      <select className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl font-bold focus:ring-2 focus:ring-blue-500" value={gender} onChange={(e) => setGender(e.target.value)}>
                        <option>Male</option>
                        <option>Female</option>
                        <option>Other</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase mb-2">Referring Doctor</label>
                    <input type="text" className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl font-bold focus:ring-2 focus:ring-blue-500" value={refDoctor} onChange={(e) => setRefDoctor(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase mb-2">Sample Type</label>
                    <input type="text" className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl font-bold focus:ring-2 focus:ring-blue-500" value={sampleType} onChange={(e) => setSampleType(e.target.value)} />
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                      <label className="block text-[9px] font-black text-blue-600 uppercase mb-2">Sample Collection Time</label>
                      <input type="datetime-local" className="w-full px-3 py-2 bg-white border-0 rounded-lg text-xs font-bold" value={collectedAt} onChange={(e) => setCollectedAt(e.target.value)} />
                    </div>
                    <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                      <label className="block text-[9px] font-black text-blue-600 uppercase mb-2">Sample Reception Time</label>
                      <input type="datetime-local" className="w-full px-3 py-2 bg-white border-0 rounded-lg text-xs font-bold" value={receivedAt} onChange={(e) => setReceivedAt(e.target.value)} />
                    </div>
                  </div>
                </div>

                {/* Parameters Editor */}
                <div className="lg:col-span-3 space-y-6">
                  <div className="flex justify-between items-center border-b pb-2">
                    <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">Test Parameters & Methodology</h3>
                    <div className="flex gap-2">
                      {['CBC', 'SUGAR', 'KFT', 'LFT'].map(t => (
                        <button key={t} onClick={() => applyTemplate(t)} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-[10px] font-black hover:bg-blue-600 hover:text-white transition-all uppercase tracking-widest">{t}</button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[9px] font-black text-gray-400 uppercase mb-1">Analyzer Equipment</label>
                      <input type="text" className="w-full px-3 py-2 bg-gray-50 border-0 rounded-lg text-xs font-bold" value={analyzerUsed} onChange={(e) => setAnalyzerUsed(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-[9px] font-black text-gray-400 uppercase mb-1">Internal QC Status</label>
                      <input type="text" className="w-full px-3 py-2 bg-gray-50 border-0 rounded-lg text-xs font-bold" value={internalQC} onChange={(e) => setInternalQC(e.target.value)} />
                    </div>
                  </div>

                  <div className="space-y-3">
                    {parameters.map((param, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end bg-white border border-gray-100 p-4 rounded-2xl group shadow-sm">
                        <div className="md:col-span-3">
                          <label className="block text-[9px] font-black text-gray-400 uppercase mb-1">Section / Parameter</label>
                          <input type="text" placeholder="e.g. HAEMOGRAM" className="w-full px-3 py-1 bg-gray-50 border-0 rounded-lg text-[9px] mb-1 font-black text-blue-600 uppercase" value={param.section} onChange={(e) => updateParameter(index, 'section', e.target.value)} />
                          <input type="text" className="w-full px-3 py-2 bg-gray-50 border-0 rounded-lg text-xs font-bold" value={param.name} onChange={(e) => updateParameter(index, 'name', e.target.value)} />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-[9px] font-black text-gray-400 uppercase mb-1">Result</label>
                          <input type="text" className="w-full px-3 py-2 bg-blue-50 text-blue-700 border-0 rounded-lg text-xs font-black" value={param.value} onChange={(e) => updateParameter(index, 'value', e.target.value)} />
                        </div>
                        <div className="md:col-span-1">
                          <label className="block text-[9px] font-black text-gray-400 uppercase mb-1">Unit</label>
                          <input type="text" className="w-full px-3 py-2 bg-gray-50 border-0 rounded-lg text-xs" value={param.unit} onChange={(e) => updateParameter(index, 'unit', e.target.value)} />
                        </div>
                        <div className="md:col-span-3">
                          <label className="block text-[9px] font-black text-gray-400 uppercase mb-1">Reference Range</label>
                          <input type="text" className="w-full px-3 py-2 bg-gray-50 border-0 rounded-lg text-[10px] italic" value={param.referenceRange} onChange={(e) => updateParameter(index, 'referenceRange', e.target.value)} />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-[9px] font-black text-gray-400 uppercase mb-1">Method</label>
                          <input type="text" className="w-full px-3 py-2 bg-gray-50 border-0 rounded-lg text-[9px]" placeholder="e.g. GOD-PAP" value={param.method} onChange={(e) => updateParameter(index, 'method', e.target.value)} />
                        </div>
                        <div className="md:col-span-1 flex justify-end">
                          <button onClick={() => removeParameter(index)} className="p-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </div>
                    ))}
                    <button onClick={addParameter} className="w-full py-4 border-2 border-dashed border-gray-100 text-gray-400 rounded-2xl hover:border-blue-200 hover:text-blue-500 text-xs font-black uppercase flex items-center justify-center transition-all bg-gray-50/30">
                      <Plus className="h-4 w-4 mr-2" /> Append Analysis Row
                    </button>
                  </div>

                  {(selectedAppointment.serviceName.includes('CBP') || selectedAppointment.serviceName.includes('CBC')) && (
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">PERIPHERAL SMEAR (Morphology)</label>
                      <textarea className="w-full p-4 bg-gray-50 border-0 rounded-2xl text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none" rows={3} value={morphology} onChange={(e) => setMorphology(e.target.value)} />
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Medical Interpretation / Comments</label>
                    <textarea className="w-full p-6 bg-gray-50 border-0 rounded-3xl min-h-[100px] text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Clinical correlation recommended..." value={remarks} onChange={(e) => setRemarks(e.target.value)} />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 border-t border-gray-100 bg-white flex gap-4">
              <button disabled={isFinalizing} onClick={() => setSelectedAppointment(null)} className="flex-1 py-4 text-gray-400 font-black uppercase tracking-widest text-sm disabled:opacity-50">Cancel Entry</button>
              <button disabled={isFinalizing} onClick={handleSubmitResults} className="flex-[3] py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center shadow-xl shadow-blue-500/20 active:scale-95 transition-all">
                {isFinalizing ? <Loader2 className="animate-spin h-5 w-5 mr-3" /> : <Printer className="h-5 w-5 mr-3" />}
                Sign & Finalize NABL Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffDashboard;
