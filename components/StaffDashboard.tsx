
import React, { useState } from 'react';
import { Appointment, TestResult, AppointmentStatus, TestParameter } from '../types';
import { ClipboardList, Upload, CheckCircle, Search, Plus, Trash2, Printer, X, LayoutTemplate, Sparkles, Loader2 } from 'lucide-react';
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
  
  // Upload Form State
  const [parameters, setParameters] = useState<TestParameter[]>([{ name: '', value: '', unit: '', referenceRange: '' }]);
  const [remarks, setRemarks] = useState('');

  const filteredAppointments = appointments.filter(a => 
    a.patientName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    a.serviceName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addParameter = () => setParameters([...parameters, { name: '', value: '', unit: '', referenceRange: '' }]);
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
        referenceRange: p.referenceRange
      }));
      setParameters(templateParams);
    }
  };

  const handleSubmitResults = async () => {
    if (!selectedAppointment) return;

    // Basic validation
    if (parameters.some(p => !p.name || !p.value)) {
      alert("Please ensure all parameters have names and values.");
      return;
    }

    setIsFinalizing(true);

    const result: TestResult = {
      id: 'RES-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
      appointmentId: selectedAppointment.id,
      patientId: selectedAppointment.patientId,
      patientName: selectedAppointment.patientName,
      testName: selectedAppointment.serviceName,
      date: new Date().toISOString().split('T')[0],
      parameters,
      doctorRemarks: remarks || 'Results are within normal clinical limits.'
    };

    // Simulate clinical finalization delay
    await new Promise(resolve => setTimeout(resolve, 1200));

    onCompleteAppointment(selectedAppointment.id, result);
    generatePDFReport(result);
    
    setIsFinalizing(false);
    setShowSuccess(true);

    // Close modal after showing success
    setTimeout(() => {
      setShowSuccess(false);
      setSelectedAppointment(null);
      setParameters([{ name: '', value: '', unit: '', referenceRange: '' }]);
      setRemarks('');
    }, 1500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Lab Management Portal</h1>
          <p className="text-gray-500 mt-2 text-lg">Process patient reports and manage diagnostic laboratory flow.</p>
        </div>
        <div className="flex space-x-2">
           <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Find patient or test..." 
                className="pl-10 pr-4 py-3 border border-gray-200 bg-white rounded-xl outline-none focus:ring-4 focus:ring-blue-50 transition-all w-full md:w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
           </div>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-[0.15em]">
                <th className="px-8 py-5">Patient Identity</th>
                <th className="px-8 py-5">Assigned Test</th>
                <th className="px-8 py-5">Clinical Schedule</th>
                <th className="px-8 py-5">Progress</th>
                <th className="px-8 py-5 text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredAppointments.length > 0 ? (
                filteredAppointments.map(app => (
                  <tr key={app.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="font-bold text-gray-900">{app.patientName}</div>
                      <div className="text-[10px] font-mono text-gray-400 uppercase tracking-tighter mt-0.5">ID: {app.patientId.substring(0, 10)}</div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="text-gray-700 font-semibold">{app.serviceName}</div>
                      <div className="text-[10px] text-blue-500 font-bold uppercase tracking-widest mt-0.5">Diagnostic</div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="text-sm font-bold text-gray-800">{new Date(app.date).toLocaleDateString(undefined, { dateStyle: 'medium' })}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{app.timeSlot}</div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        app.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                        app.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                           app.status === 'COMPLETED' ? 'bg-green-500' :
                           app.status === 'PENDING' ? 'bg-amber-500' : 'bg-red-500'
                        }`}></span>
                        {app.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      {app.status === 'PENDING' && (
                        <button
                          onClick={() => setSelectedAppointment(app)}
                          className="inline-flex items-center px-4 py-2 bg-white border border-blue-200 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl font-bold text-xs transition-all shadow-sm active:scale-95"
                        >
                          <Upload className="h-3.5 w-3.5 mr-2" />
                          Record Results
                        </button>
                      )}
                      {app.status === 'COMPLETED' && (
                        <div className="flex items-center justify-end text-gray-300 font-bold text-xs italic">
                          <CheckCircle className="h-4 w-4 mr-1.5 text-green-400" />
                          Finalized
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-8 py-32 text-center">
                    <div className="flex flex-col items-center">
                       <ClipboardList className="h-16 w-16 text-gray-100 mb-4" />
                       <p className="text-gray-400 font-medium">No diagnostic assignments found.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Result Entry Modal - Full Screen Style */}
      {selectedAppointment && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] w-full max-w-5xl max-h-[92vh] overflow-hidden shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] flex flex-col relative">
            
            {/* Success Overlay */}
            {showSuccess && (
              <div className="absolute inset-0 z-[70] bg-white flex flex-col items-center justify-center animate-in zoom-in duration-300">
                <div className="bg-green-500 p-6 rounded-full text-white shadow-xl shadow-green-500/20 mb-6">
                  <CheckCircle className="h-16 w-16" />
                </div>
                <h2 className="text-4xl font-black text-gray-900">Report Finalized!</h2>
                <p className="text-gray-500 mt-2 text-lg">The clinical PDF is downloading now.</p>
              </div>
            )}

            {/* Header */}
            <div className="p-8 md:p-10 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center">
                <div className="bg-blue-600 p-3 rounded-2xl mr-5 shadow-lg shadow-blue-500/20">
                  <LayoutTemplate className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-gray-900">Clinical Data Entry</h2>
                  <p className="text-gray-500 font-medium">Processing <span className="text-blue-600 font-bold">{selectedAppointment.serviceName}</span></p>
                </div>
              </div>
              <button 
                disabled={isFinalizing}
                onClick={() => setSelectedAppointment(null)} 
                className="p-3 hover:bg-white hover:shadow-md rounded-full transition-all group active:scale-90 disabled:opacity-50"
              >
                <X className="h-6 w-6 text-gray-400 group-hover:text-red-500" />
              </button>
            </div>
            
            <div className="flex-grow overflow-y-auto p-8 md:p-10 scrollbar-thin">
              <div className="space-y-10">
                {/* Template Selection */}
                <div className="bg-blue-50/50 p-6 rounded-[2rem] border border-blue-100">
                  <div className="flex items-center mb-4">
                    <Sparkles className="h-4 w-4 text-blue-600 mr-2" />
                    <h3 className="text-xs font-black text-blue-900 uppercase tracking-widest">Rapid Template Application</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(TEST_TEMPLATES).map(([key, template]) => (
                      <button
                        key={key}
                        disabled={isFinalizing}
                        onClick={() => applyTemplate(key)}
                        className="px-4 py-2 bg-white border border-blue-100 text-blue-700 rounded-xl text-xs font-bold hover:border-blue-400 hover:shadow-sm transition-all active:scale-95 disabled:opacity-50"
                      >
                        {template.name}
                      </button>
                    ))}
                    <button
                      disabled={isFinalizing}
                      onClick={() => setParameters([{ name: '', value: '', unit: '', referenceRange: '' }])}
                      className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-200 transition-all active:scale-95 disabled:opacity-50"
                    >
                      Clear All
                    </button>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center">
                      Measured Parameters
                      <span className="ml-3 px-2 py-0.5 bg-gray-100 rounded text-[10px] text-gray-500 font-bold">{parameters.length} total</span>
                    </h3>
                    <button 
                      disabled={isFinalizing}
                      onClick={addParameter}
                      className="inline-flex items-center text-xs font-black text-blue-600 bg-white border border-blue-100 px-4 py-2 rounded-xl hover:bg-blue-50 transition-all shadow-sm disabled:opacity-50"
                    >
                      <Plus className="h-4 w-4 mr-1.5" /> New Row
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {parameters.map((param, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end bg-white border border-gray-100 p-4 rounded-2xl hover:shadow-md hover:border-blue-100 transition-all group relative">
                        <div className="md:col-span-4">
                          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Analyte / Parameter</label>
                          <input
                            type="text"
                            disabled={isFinalizing}
                            className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl outline-none focus:bg-white focus:border-blue-500 transition-all text-sm font-semibold disabled:opacity-75"
                            placeholder="e.g. Hemoglobin"
                            value={param.name}
                            onChange={(e) => updateParameter(index, 'name', e.target.value)}
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Observed Value</label>
                          <input
                            type="text"
                            disabled={isFinalizing}
                            className="w-full px-4 py-3 bg-blue-50/30 border border-transparent rounded-xl outline-none focus:bg-white focus:border-blue-600 transition-all text-sm font-bold text-blue-700 disabled:opacity-75"
                            placeholder="Value"
                            value={param.value}
                            onChange={(e) => updateParameter(index, 'value', e.target.value)}
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Unit</label>
                          <input
                            type="text"
                            disabled={isFinalizing}
                            className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl outline-none focus:bg-white focus:border-blue-500 transition-all text-sm font-semibold disabled:opacity-75"
                            placeholder="Unit"
                            value={param.unit}
                            onChange={(e) => updateParameter(index, 'unit', e.target.value)}
                          />
                        </div>
                        <div className="md:col-span-3">
                          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Ref. Interval</label>
                          <input
                            type="text"
                            disabled={isFinalizing}
                            className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl outline-none focus:bg-white focus:border-blue-500 transition-all text-xs font-medium text-gray-500 italic disabled:opacity-75"
                            placeholder="Range"
                            value={param.referenceRange}
                            onChange={(e) => updateParameter(index, 'referenceRange', e.target.value)}
                          />
                        </div>
                        <div className="md:col-span-1 flex justify-end">
                          <button 
                            disabled={isFinalizing}
                            onClick={() => removeParameter(index)}
                            className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100 disabled:hidden"
                            title="Remove Parameter"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="block text-sm font-black text-gray-700 uppercase tracking-wider ml-1">Clinical Remarks</label>
                    <textarea
                      disabled={isFinalizing}
                      className="w-full p-6 bg-gray-50 border border-transparent rounded-3xl outline-none focus:bg-white focus:border-blue-500 min-h-[150px] transition-all text-sm font-medium leading-relaxed disabled:opacity-75"
                      placeholder="Add medical interpretations, advice, or critical findings..."
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                    />
                  </div>
                  <div className="bg-amber-50 rounded-[2.5rem] p-8 border border-amber-100 flex flex-col justify-center">
                    <div className="flex items-center mb-3">
                      <div className="bg-amber-100 p-2 rounded-lg mr-3">
                        <Printer className="h-5 w-5 text-amber-700" />
                      </div>
                      <h4 className="font-black text-amber-900 uppercase text-xs tracking-widest">Post-Processing</h4>
                    </div>
                    <p className="text-sm text-amber-800 leading-relaxed font-medium">
                      Confirming this report will automatically:
                    </p>
                    <ul className="mt-4 space-y-2">
                      {[
                        'Finalize digital records for patient dashboard',
                        'Generate downloadable PDF medical report',
                        'Timestamp the clinical verification process',
                        'Archive the data for future diagnostic history'
                      ].map((item, i) => (
                        <li key={i} className="flex items-start text-xs text-amber-700/80 font-bold">
                          <CheckCircle className="h-3.5 w-3.5 mr-2 mt-0.5 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-8 md:p-10 border-t border-gray-100 bg-white flex flex-col md:flex-row gap-4">
              <button
                disabled={isFinalizing}
                onClick={() => setSelectedAppointment(null)}
                className="flex-1 py-4 px-6 border border-gray-200 text-gray-500 rounded-2xl font-black text-sm hover:bg-gray-50 transition-all uppercase tracking-widest disabled:opacity-50"
              >
                Discard Changes
              </button>
              <button
                disabled={isFinalizing}
                onClick={handleSubmitResults}
                className="flex-[2] py-4 px-6 bg-blue-600 text-white rounded-2xl font-black text-sm hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-500/20 transition-all flex items-center justify-center uppercase tracking-widest active:scale-[0.98] disabled:bg-blue-400"
              >
                {isFinalizing ? (
                  <Loader2 className="h-5 w-5 mr-3 animate-spin" />
                ) : (
                  <Printer className="h-5 w-5 mr-3" />
                )}
                {isFinalizing ? 'Generating Report...' : 'Finalize & Generate Report'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffDashboard;
