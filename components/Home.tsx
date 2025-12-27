
import React from 'react';
import { Calendar, Shield, Clock, Phone, MapPin, Activity, ChevronRight } from 'lucide-react';

interface HomeProps {
  onNavigate: (page: string) => void;
}

const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  return (
    <div className="animate-in fade-in duration-700">
      {/* Hero Section */}
      <div className="relative bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block xl:inline">Modern Diagnostics for</span>{' '}
                  <span className="block text-blue-600 xl:inline">Your Healthy Future</span>
                </h1>
                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  Sri Venkateswar Digital X-Ray and Clinical Laboratory (Balu Diagnostics) provides high-quality diagnostic services with state-of-the-art technology and expert medical supervision.
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    <button
                      onClick={() => onNavigate('book')}
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
                    >
                      Book Appointment
                    </button>
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                    <button
                      onClick={() => onNavigate('services')}
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 md:py-4 md:text-lg md:px-10"
                    >
                      Our Services
                    </button>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
          <img
            className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full"
            src="https://images.unsplash.com/photo-1579152276506-5d5ec244328a?auto=format&fit=crop&q=80&w=1470"
            alt="Laboratory"
          />
        </div>
      </div>

      {/* Quick Info */}
      <div className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-y-12 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-4 lg:gap-x-8">
            {[
              { icon: Clock, title: 'Quick Reports', desc: 'Get results within 24 hours' },
              { icon: Shield, title: 'Safe & Secure', desc: 'ISO certified lab standards' },
              { icon: Activity, title: 'Modern Tech', desc: 'Digital X-Ray & Auto-Analyzers' },
              { icon: Phone, title: '24/7 Support', desc: 'Dedicated patient helpline' },
            ].map((feature, i) => (
              <div key={i} className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-100 text-blue-600">
                    <feature.icon className="h-6 w-6" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">{feature.title}</h3>
                  <p className="mt-2 text-sm text-gray-500">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Services Preview */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Popular Services</h2>
          <p className="mt-4 text-xl text-gray-500">We offer a wide range of diagnostic tests tailored for you.</p>
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { name: 'Full Body Checkup', price: '₹1499', icon: Activity },
              { name: 'Diabetes Screening', price: '₹299', icon: Activity },
              { name: 'Vitamin D & B12', price: '₹1800', icon: Activity },
            ].map((service, i) => (
              <div key={i} className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow bg-white flex flex-col items-center">
                <div className="p-3 bg-blue-50 rounded-full mb-4">
                  <service.icon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">{service.name}</h3>
                <p className="text-blue-600 font-semibold mt-2">{service.price}</p>
                <button
                   onClick={() => onNavigate('book')}
                   className="mt-4 text-sm font-semibold text-blue-600 flex items-center hover:text-blue-800"
                >
                  Book Now <ChevronRight className="h-4 w-4 ml-1" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="bg-blue-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white">
          <div className="lg:flex lg:items-center lg:justify-between">
            <div className="lg:w-1/2">
              <h2 className="text-3xl font-extrabold sm:text-4xl">Visit Us Today</h2>
              <p className="mt-4 text-lg text-blue-100">
                Experience world-class diagnostic care in a comfortable environment.
              </p>
              <div className="mt-8 space-y-4">
                <div className="flex items-center">
                  <MapPin className="h-6 w-6 mr-3 text-blue-200" />
                  <span>Plot 45, Beside City Hospital, Main Road, Hyderabad</span>
                </div>
                <div className="flex items-center">
                  <Phone className="h-6 w-6 mr-3 text-blue-200" />
                  <span>+91 98765 43210</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-6 w-6 mr-3 text-blue-200" />
                  <span>Mon - Sat: 07:30 AM - 08:30 PM | Sun: Closed</span>
                </div>
              </div>
            </div>
            <div className="mt-10 lg:mt-0 lg:w-1/2 rounded-2xl overflow-hidden h-64 bg-gray-200 shadow-2xl">
                {/* Mock Map */}
                <img 
                  src="https://picsum.photos/seed/map/800/600" 
                  className="w-full h-full object-cover" 
                  alt="Location Map" 
                />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
