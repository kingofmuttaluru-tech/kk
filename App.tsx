
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Services from './components/Services';
import AppointmentBooking from './components/AppointmentBooking';
import PatientDashboard from './components/PatientDashboard';
import StaffDashboard from './components/StaffDashboard';
import { User, UserRole, Appointment, TestResult, AppointmentStatus } from './types';
import { SERVICES } from './constants';
import { User as UserIcon, Lock, ChevronRight, Stethoscope, Mail, AlertCircle } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedServiceId, setSelectedServiceId] = useState<string | undefined>();
  const [loginEmail, setLoginEmail] = useState('');
  const [loginError, setLoginError] = useState('');
  
  // Mock Initial State
  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: 'APP-1029',
      patientId: 'patient_01',
      patientName: 'Rahul Sharma',
      serviceId: 'h1',
      serviceName: 'Thyroid Profile (T3, T4, TSH)',
      date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0], // 2 days from now
      timeSlot: '09:30 AM',
      status: AppointmentStatus.PENDING
    },
    {
      id: 'APP-1010',
      patientId: 'patient_01',
      patientName: 'Rahul Sharma',
      serviceId: 'b1',
      serviceName: 'Complete Blood Count (CBC)',
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
      testName: 'Complete Blood Count (CBC)',
      date: '2023-11-20',
      doctorRemarks: 'Hemoglobin slightly below range. Suggest Iron-rich diet.',
      parameters: [
        { name: 'Hemoglobin', value: '11.5', unit: 'g/dL', referenceRange: '13.5 - 17.5' },
        { name: 'White Blood Cell Count', value: '7200', unit: 'cells/mcL', referenceRange: '4500 - 11000' },
        { name: 'Platelets', value: '240000', unit: 'cells/mcL', referenceRange: '150000 - 450000' }
      ]
    }
  ]);

  const handleLogout = () => {
    setUser(null);
    setCurrentPage('home');
    setLoginEmail('');
    setLoginError('');
  };

  const loginAs = (role: UserRole) => {
    if (!loginEmail || !loginEmail.trim()) {
      setLoginError('Please enter your email address to continue.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginEmail)) {
      setLoginError('This email address doesn’t look quite right. Please check it.');
      return;
    }
    setLoginError('');

    const mockUser: User = role === UserRole.STAFF 
      ? { id: 'staff_01', name: 'Dr. Balu', email: loginEmail, role: UserRole.STAFF }
      : { id: 'patient_01', name: 'Rahul Sharma', email: loginEmail, role: UserRole.PATIENT, phone: '9876543210' };
    
    setUser(mockUser);
    
    // Better UX: Navigate directly to relevant dashboard on login
    if (role === UserRole.STAFF) {
      setCurrentPage('staff-dashboard');
    } else {
      setCurrentPage('patient-dashboard');
    }
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
          <StaffDashboard appointments={appointments} onCompleteAppointment={handleCompleteAppointment} />
        ) : <Home onNavigate={setCurrentPage} />;
      case 'login':
        return (
          <div className="max-w-md mx-auto py-16 md:py-24 px-4 animate-in fade-in zoom-in duration-500">
            <div className="bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(8,112,184,0.12)] overflow-hidden border border-gray-100">
              <div className="bg-blue-600 p-12 text-center text-white relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full border-8 border-white"></div>
                  <div className="absolute left-1/4 bottom-0 w-12 h-12 rounded-full border-4 border-white"></div>
                </div>
                
                <div className="relative z-10">
                  <div className="bg-white/20 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-md shadow-inner">
                     <Lock className="h-10 w-10 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold tracking-tight">Secure Access</h2>
                  <p className="text-blue-100 mt-2 font-medium opacity-90">Manage your health securely</p>
                </div>
                
                {/* Decorative Notch */}
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-white rotate-45 border-l border-t border-gray-50"></div>
              </div>
              
              <div className="p-10 space-y-8 pt-14">
                {/* Email Section */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center ml-1">
                    <label htmlFor="email" className="text-sm font-bold text-gray-700">
                      Email Address
                    </label>
                    {loginError && (
                      <span className="text-red-500 text-[10px] font-bold uppercase tracking-wider animate-pulse flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Check Email
                      </span>
                    )}
                  </div>
                  <div className="relative group">
                    <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors duration-300 ${
                      loginError ? 'text-red-400' : 'text-gray-400 group-focus-within:text-blue-600'
                    }`} />
                    <input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      autoFocus
                      className={`w-full pl-12 pr-4 py-4 bg-gray-50 border-2 rounded-2xl outline-none transition-all duration-300 ${
                        loginError 
                          ? 'border-red-200 bg-red-50 focus:border-red-500 focus:ring-4 focus:ring-red-100' 
                          : 'border-transparent focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50'
                      }`}
                      value={loginEmail}
                      onChange={(e) => {
                        setLoginEmail(e.target.value);
                        if (loginError) setLoginError('');
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') loginAs(UserRole.PATIENT);
                      }}
                    />
                  </div>
                  {loginError && (
                    <p className="text-red-500 text-xs mt-2 ml-1 font-medium leading-relaxed animate-in slide-in-from-top-1">
                      {loginError}
                    </p>
                  )}
                </div>

                {/* Portal Buttons Section */}
                <div className="space-y-4">
                  <div className="relative flex items-center py-2">
                    <div className="flex-grow border-t border-gray-100"></div>
                    <span className="flex-shrink mx-4 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Select Your Portal</span>
                    <div className="flex-grow border-t border-gray-100"></div>
                  </div>
                  
                  <div className="grid gap-4">
                    <button
                      onClick={() => loginAs(UserRole.PATIENT)}
                      className="w-full flex items-center justify-between p-5 bg-white border-2 border-gray-100 hover:border-blue-500 hover:bg-blue-50/40 rounded-3xl transition-all duration-300 group hover:shadow-lg hover:shadow-blue-500/5"
                    >
                      <div className="flex items-center">
                        <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mr-5 group-hover:bg-blue-100 group-hover:scale-110 transition-all duration-300 shadow-sm">
                          <UserIcon className="h-7 w-7 text-blue-600" />
                        </div>
                        <div className="text-left">
                          <div className="font-bold text-gray-900 text-lg">Patient Portal</div>
                          <div className="text-xs text-gray-500 font-medium">Reports & Appointments</div>
                        </div>
                      </div>
                      <div className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center group-hover:border-blue-200 group-hover:bg-white transition-all">
                        <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </button>

                    <button
                      onClick={() => loginAs(UserRole.STAFF)}
                      className="w-full flex items-center justify-between p-5 bg-white border-2 border-gray-100 hover:border-blue-500 hover:bg-blue-50/40 rounded-3xl transition-all duration-300 group hover:shadow-lg hover:shadow-blue-500/5"
                    >
                      <div className="flex items-center">
                        <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mr-5 group-hover:bg-blue-100 group-hover:scale-110 transition-all duration-300 shadow-sm">
                          <Stethoscope className="h-7 w-7 text-blue-600" />
                        </div>
                        <div className="text-left">
                          <div className="font-bold text-gray-900 text-lg">Staff Portal</div>
                          <div className="text-xs text-gray-500 font-medium">Admin & Lab Processing</div>
                        </div>
                      </div>
                      <div className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center group-hover:border-blue-200 group-hover:bg-white transition-all">
                        <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="px-10 pb-10 text-center">
                 <p className="text-xs text-gray-400 font-medium leading-relaxed">
                   Protected by high-level encryption. Your health data is private. By continuing, you agree to our <span className="text-blue-500 cursor-pointer hover:underline">Privacy Policy</span>.
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
              <h4 className="font-bold text-gray-900 mb-4 uppercase text-xs tracking-widest">Legal</h4>
              <ul className="space-y-3 text-sm text-gray-500">
                <li className="cursor-pointer hover:text-blue-600 transition-colors">Privacy Policy</li>
                <li className="cursor-pointer hover:text-blue-600 transition-colors">Terms of Service</li>
                <li className="cursor-pointer hover:text-blue-600 transition-colors">Lab Accreditation</li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-400 font-medium">&copy; {new Date().getFullYear()} Balu Diagnostic Centre. All Rights Reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
