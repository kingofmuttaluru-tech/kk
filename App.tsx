
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Services from './components/Services';
import AppointmentBooking from './components/AppointmentBooking';
import PatientDashboard from './components/PatientDashboard';
import StaffDashboard from './components/StaffDashboard';
import { User, UserRole, Appointment, TestResult, AppointmentStatus } from './types';
import { SERVICES } from './constants';
import { User as UserIcon, Lock, ChevronRight, Stethoscope, Mail, AlertCircle, Phone, UserCircle, MapPin } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedServiceId, setSelectedServiceId] = useState<string | undefined>();
  
  // Login States
  const [loginName, setLoginName] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  
  // Mock Initial State
  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: 'APP-1029',
      patientId: 'patient_01',
      patientName: 'Rahul Sharma',
      serviceId: 'h1',
      serviceName: 'Thyroid Profile',
      date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      timeSlot: '09:30 AM',
      status: AppointmentStatus.PENDING
    },
    {
      id: 'APP-1010',
      patientId: 'patient_01',
      patientName: 'Rahul Sharma',
      serviceId: 'b1',
      serviceName: 'Complete Blood Picture (CBC)',
      date: '2023-11-20',
      timeSlot: '10:00 AM',
      status: AppointmentStatus.COMPLETED
    }
  ]);
  
  const [results, setResults] = useState<TestResult[]>([
    {
      id: 'RES-XJ92L',
      appointmentId: 'APP-1010',
      patientId: 'patient_01',
      patientName: 'Rahul Sharma',
      age: '28',
      gender: 'Male',
      refDoctor: 'Self',
      sampleType: 'EDTA Whole Blood',
      collectedAt: '2023-11-20T09:00',
      receivedAt: '2023-11-20T09:30',
      testName: 'Complete Blood Picture (CBC)',
      date: '2023-11-20',
      doctorRemarks: 'Hemoglobin slightly below range. Suggest Iron-rich diet.',
      parameters: [
        { name: 'Hemoglobin (Hb)', value: '11.5', unit: 'g/dL', referenceRange: '13.5 - 17.5', method: 'Cyanmethaemoglobin' },
        { name: 'Total RBC Count', value: '4.2', unit: 'million/µL', referenceRange: '4.5–5.9', method: 'Electrical Impedance' },
        { name: 'Platelet Count', value: '240000', unit: '/µL', referenceRange: '150,000–450,000', method: 'Electrical Impedance' }
      ]
    }
  ]);

  const handleLogout = () => {
    setUser(null);
    setCurrentPage('home');
    setLoginName('');
    setLoginPassword('');
    setLoginError('');
  };

  const loginAs = (role: UserRole) => {
    const trimmedName = loginName.trim();
    const trimmedPass = loginPassword.trim();

    if (!trimmedName) {
      setLoginError('Please enter your User Name / Name.');
      return;
    }
    if (!trimmedPass) {
      setLoginError('Please enter your Password / Cell Number.');
      return;
    }

    if (role === UserRole.STAFF) {
      if (trimmedName.toUpperCase() === 'BALU' && trimmedPass === '9533550105') {
        setLoginError('');
        setUser({ id: 'staff_01', name: 'Dr. Balu', email: 'balu@lab.com', role: UserRole.STAFF });
        setCurrentPage('staff-dashboard');
      } else {
        setLoginError('Unauthorized! Invalid Admin Username or Password.');
      }
      return;
    }

    if (trimmedPass.length < 10) {
      setLoginError('Please enter a valid 10-digit cell number as password.');
      return;
    }
    
    setLoginError('');
    setUser({ 
      id: 'patient_01', 
      name: trimmedName, 
      email: `${trimmedName.toLowerCase().replace(/\s/g, '')}@example.com`, 
      role: UserRole.PATIENT, 
      phone: trimmedPass 
    });
    setCurrentPage('patient-dashboard');
  };

  const handleBookSuccess = (newApp: Appointment) => {
    setAppointments(prev => [newApp, ...prev]);
  };

  const handleCompleteAppointment = (appId: string, result: TestResult) => {
    setAppointments(prev => prev.map(a => a.id === appId ? { ...a, status: AppointmentStatus.COMPLETED } : a));
    setResults(prev => [result, ...prev]);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home onNavigate={setCurrentPage} />;
      case 'services':
        return <Services onBook={(id) => { setSelectedServiceId(id); setCurrentPage('book'); }} />;
      case 'book':
        return (
          <AppointmentBooking 
            user={user} 
            onBookSuccess={handleBookSuccess} 
            onLoginRequest={() => setCurrentPage('login')}
            initialServiceId={selectedServiceId}
          />
        );
      case 'patient-dashboard':
        return user?.role === UserRole.PATIENT ? (
          <PatientDashboard user={user} appointments={appointments} results={results} />
        ) : <Home onNavigate={setCurrentPage} />;
      case 'staff-dashboard':
        return user?.role === UserRole.STAFF ? (
          <StaffDashboard appointments={appointments} results={results} onCompleteAppointment={handleCompleteAppointment} />
        ) : <Home onNavigate={setCurrentPage} />;
      case 'login':
        return (
          <div className="max-w-md mx-auto py-16 md:py-24 px-4 animate-in fade-in zoom-in duration-500">
            <div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(8,112,184,0.12)] overflow-hidden border border-gray-100">
              <div className="bg-blue-600 p-12 text-center text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full border-8 border-white animate-pulse"></div>
                  <div className="absolute left-1/4 bottom-0 w-12 h-12 rounded-full border-4 border-white opacity-20"></div>
                </div>
                
                <div className="relative z-10">
                  <div className="bg-white/20 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-md shadow-inner animate-bounce duration-[3000ms]">
                     <Lock className="h-10 w-10 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold tracking-tight">Portal Login</h2>
                  <p className="text-blue-100 mt-2 font-medium opacity-90">Secure Patient & Staff Access</p>
                </div>
                
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-white rotate-45 border-l border-t border-gray-50"></div>
              </div>
              
              <div className="p-10 space-y-6 pt-14">
                <div className="space-y-2 group">
                  <label htmlFor="loginName" className="text-sm font-bold text-gray-700 ml-1 group-focus-within:text-blue-600 transition-colors">
                    Username / Name
                  </label>
                  <div className="relative">
                    <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                    <input
                      id="loginName"
                      type="text"
                      placeholder="Enter username or name"
                      autoFocus
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50 focus:-translate-y-0.5 focus:shadow-lg focus:shadow-blue-500/5 transition-all duration-300"
                      value={loginName}
                      onChange={(e) => {
                        setLoginName(e.target.value);
                        if (loginError) setLoginError('');
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-2 group">
                  <label htmlFor="loginPassword" className="text-sm font-bold text-gray-700 ml-1 group-focus-within:text-blue-600 transition-colors">
                    Password / Cell Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                    <input
                      id="loginPassword"
                      type="password"
                      placeholder="Enter security password"
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50 focus:-translate-y-0.5 focus:shadow-lg focus:shadow-blue-500/5 transition-all duration-300"
                      value={loginPassword}
                      onChange={(e) => {
                        setLoginPassword(e.target.value);
                        if (loginError) setLoginError('');
                      }}
                    />
                  </div>
                </div>

                {loginError && (
                  <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex items-start space-x-3 animate-in slide-in-from-top-2">
                    <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                    <p className="text-red-600 text-xs font-semibold leading-relaxed">
                      {loginError}
                    </p>
                  </div>
                )}

                <div className="space-y-4 pt-4">
                  <div className="relative flex items-center py-2">
                    <div className="flex-grow border-t border-gray-100"></div>
                    <span className="flex-shrink mx-4 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Select Portal</span>
                    <div className="flex-grow border-t border-gray-100"></div>
                  </div>
                  
                  <div className="grid gap-4">
                    <button
                      onClick={() => loginAs(UserRole.PATIENT)}
                      className="w-full flex items-center justify-between p-5 bg-white border-2 border-gray-100 hover:border-blue-500 hover:bg-blue-50/40 rounded-3xl transition-all duration-300 group hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1 active:scale-[0.98]"
                    >
                      <div className="flex items-center">
                        <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mr-5 group-hover:bg-blue-100 group-hover:scale-110 transition-all duration-300 shadow-sm">
                          <UserIcon className="h-7 w-7 text-blue-600" />
                        </div>
                        <div className="text-left">
                          <div className="font-bold text-gray-900 text-lg">Patient Portal</div>
                          <div className="text-xs text-gray-500 font-medium">Results & Tracking</div>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                    </button>

                    <button
                      onClick={() => loginAs(UserRole.STAFF)}
                      className="w-full flex items-center justify-between p-5 bg-white border-2 border-gray-100 hover:border-blue-500 hover:bg-blue-50/40 rounded-3xl transition-all duration-300 group hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1 active:scale-[0.98]"
                    >
                      <div className="flex items-center">
                        <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mr-5 group-hover:bg-blue-100 group-hover:scale-110 transition-all duration-300 shadow-sm">
                          <Stethoscope className="h-7 w-7 text-blue-600" />
                        </div>
                        <div className="text-left">
                          <div className="font-bold text-gray-900 text-lg">Staff Portal</div>
                          <div className="text-xs text-gray-500 font-medium">Admin & Lab Control</div>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="px-10 pb-10 text-center">
                 <p className="text-[10px] text-gray-400 font-medium leading-relaxed">
                   Sri Venkateswar Clinical Laboratory uses bank-grade security for your data. Admin access is logged and monitored.
                 </p>
              </div>
            </div>
          </div>
        );
      default:
        return <Home onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar 
        user={user} 
        onLogout={handleLogout} 
        onNavigate={setCurrentPage} 
        currentPage={currentPage} 
      />
      <main className="flex-grow">
        {renderPage()}
      </main>
      <footer className="bg-white border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-4">
                <div className="bg-blue-600 p-1.5 rounded-lg">
                  <Stethoscope className="h-5 w-5 text-white" />
                </div>
                <span className="ml-2 text-lg font-bold text-gray-900 uppercase tracking-tight">Sri Venkateswar Lab</span>
              </div>
              <p className="text-gray-500 max-w-sm mb-6 leading-relaxed">
                Leading the way in medical excellence, we provide a wide range of laboratory services to help you maintain optimal health.
              </p>
              <div className="flex space-x-4">
                 <div className="w-10 h-10 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 hover:text-blue-600 hover:border-blue-200 cursor-pointer transition-all">FB</div>
                 <div className="w-10 h-10 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 hover:text-blue-600 hover:border-blue-200 cursor-pointer transition-all">TW</div>
                 <div className="w-10 h-10 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 hover:text-blue-600 hover:border-blue-200 cursor-pointer transition-all">IG</div>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-4 uppercase text-xs tracking-widest">Navigation</h4>
              <ul className="space-y-3 text-sm text-gray-500">
                <li><button onClick={() => setCurrentPage('home')} className="hover:text-blue-600 transition-colors">Home</button></li>
                <li><button onClick={() => setCurrentPage('services')} className="hover:text-blue-600 transition-colors">Services</button></li>
                <li><button onClick={() => setCurrentPage('book')} className="hover:text-blue-600 transition-colors">Book Appointment</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-4 uppercase text-xs tracking-widest">Contact</h4>
              <ul className="space-y-3 text-sm text-gray-500">
                <li className="flex items-center"><Phone className="h-4 w-4 mr-2" /> +91 99669 41485</li>
                <li className="flex items-center"><MapPin className="h-4 w-4 mr-2" /> Allagadda, AP</li>
                <li className="cursor-pointer hover:text-blue-600 transition-colors">Lab Accreditation</li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-400 font-medium">&copy; {new Date().getFullYear()} Sri Venkateswar Clinical Laboratory. All Rights Reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
