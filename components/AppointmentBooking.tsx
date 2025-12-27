
import React, { useState } from 'react';
import { SERVICES, TIME_SLOTS } from '../constants';
import { User, Appointment, AppointmentStatus } from '../types';
import { Calendar as CalendarIcon, Clock, CheckCircle, ChevronRight, AlertCircle } from 'lucide-react';

interface AppointmentBookingProps {
  user: User | null;
  onBookSuccess: (appointment: Appointment) => void;
  onLoginRequest: () => void;
  initialServiceId?: string;
}

const AppointmentBooking: React.FC<AppointmentBookingProps> = ({ user, onBookSuccess, onLoginRequest, initialServiceId }) => {
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState(initialServiceId || '');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center">
        <div className="bg-white rounded-2xl p-10 shadow-lg border border-gray-100">
          <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="h-10 w-10 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Account Required</h2>
          <p className="text-gray-500 mb-8">Please sign in to your account to schedule a medical appointment.</p>
          <button
            onClick={onLoginRequest}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors"
          >
            Sign In Now
          </button>
        </div>
      </div>
    );
  }

  const handleBooking = () => {
    setIsProcessing(true);
    // Simulate API call
    setTimeout(() => {
      const service = SERVICES.find(s => s.id === selectedService);
      const newAppointment: Appointment = {
        id: Math.random().toString(36).substr(2, 9),
        patientId: user.id,
        patientName: user.name,
        serviceId: selectedService,
        serviceName: service?.name || 'Diagnostic Test',
        date: selectedDate,
        timeSlot: selectedTime,
        status: AppointmentStatus.PENDING
      };
      setIsProcessing(false);
      setStep(4);
      onBookSuccess(newAppointment);
    }, 1500);
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header/Stepper */}
        <div className="bg-blue-600 p-8 text-white">
          <h2 className="text-2xl font-bold mb-6">Book an Appointment</h2>
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  step === s ? 'bg-white text-blue-600' : 
                  step > s ? 'bg-blue-400 text-white' : 'bg-blue-500 text-blue-200'
                }`}>
                  {step > s ? <CheckCircle className="h-5 w-5" /> : s}
                </div>
                {s < 3 && <div className="w-10 h-0.5 mx-2 bg-blue-400" />}
              </div>
            ))}
          </div>
        </div>

        <div className="p-8">
          {step === 1 && (
            <div className="animate-in slide-in-from-right duration-300">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Select Diagnostic Service</h3>
              <div className="space-y-3 max-h-80 overflow-y-auto pr-2 scrollbar-thin">
                {SERVICES.map(s => (
                  <label key={s.id} className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedService === s.id ? 'border-blue-600 bg-blue-50' : 'border-gray-100 hover:border-blue-200'
                  }`}>
                    <input
                      type="radio"
                      name="service"
                      className="hidden"
                      value={s.id}
                      checked={selectedService === s.id}
                      onChange={() => setSelectedService(s.id)}
                    />
                    <div className="flex-grow">
                      <div className="font-bold text-gray-900">{s.name}</div>
                      <div className="text-xs text-blue-600 font-medium uppercase">{s.category}</div>
                    </div>
                    <div className="font-bold text-gray-700">₹{s.price}</div>
                  </label>
                ))}
              </div>
              <button
                disabled={!selectedService}
                onClick={() => setStep(2)}
                className="w-full mt-8 bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Continue to Scheduling
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="animate-in slide-in-from-right duration-300">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Pick Date & Time</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Select Date</label>
                  <div className="relative">
                    <CalendarIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="date"
                      min={today}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Select Time Slot</label>
                  <div className="grid grid-cols-2 gap-2">
                    {TIME_SLOTS.map(t => (
                      <button
                        key={t}
                        onClick={() => setSelectedTime(t)}
                        className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                          selectedTime === t ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex space-x-4 mt-12">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-4 border border-gray-300 text-gray-600 rounded-xl font-bold hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  disabled={!selectedDate || !selectedTime}
                  onClick={() => setStep(3)}
                  className="flex-[2] bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 disabled:bg-gray-300 transition-colors"
                >
                  Review Booking
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-in slide-in-from-right duration-300">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Confirm Your Appointment</h3>
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                  <span className="text-gray-500">Service</span>
                  <span className="font-bold text-gray-900">{SERVICES.find(s => s.id === selectedService)?.name}</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                  <span className="text-gray-500">Patient Name</span>
                  <span className="font-bold text-gray-900">{user.name}</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                  <span className="text-gray-500">Date</span>
                  <span className="font-bold text-gray-900">{new Date(selectedDate).toLocaleDateString('en-IN', { dateStyle: 'long' })}</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                  <span className="text-gray-500">Time</span>
                  <span className="font-bold text-gray-900">{selectedTime}</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-gray-500">Total Payable</span>
                  <span className="text-2xl font-extrabold text-blue-600">₹{SERVICES.find(s => s.id === selectedService)?.price}</span>
                </div>
              </div>
              <div className="flex space-x-4 mt-8">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 py-4 border border-gray-300 text-gray-600 rounded-xl font-bold hover:bg-gray-50"
                >
                  Edit
                </button>
                <button
                  onClick={handleBooking}
                  disabled={isProcessing}
                  className="flex-[2] bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  {isProcessing ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Scheduling...
                    </div>
                  ) : 'Confirm Appointment'}
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="animate-in zoom-in duration-500 text-center py-10">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
              <h3 className="text-3xl font-extrabold text-gray-900 mb-2">Booking Confirmed!</h3>
              <p className="text-gray-500 max-w-sm mx-auto mb-10">
                Your appointment has been successfully scheduled. You can view your details in your dashboard.
              </p>
              <button
                onClick={() => setStep(1)}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors"
              >
                Back to Appointments
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppointmentBooking;
