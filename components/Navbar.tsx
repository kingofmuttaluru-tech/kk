
import React from 'react';
import { User, UserRole } from '../types';
import { Stethoscope, LogOut, Menu, X, User as UserIcon } from 'lucide-react';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
  onNavigate: (page: string) => void;
  currentPage: string;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout, onNavigate, currentPage }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const navLinks = [
    { name: 'Home', id: 'home' },
    { name: 'Services', id: 'services' },
    { name: 'Book Appointment', id: 'book', primary: true },
  ];

  if (user) {
    if (user.role === UserRole.PATIENT) {
      navLinks.push({ name: 'My Dashboard', id: 'patient-dashboard' });
    } else if (user.role === UserRole.STAFF) {
      navLinks.push({ name: 'Staff Panel', id: 'staff-dashboard' });
    }
  }

  const handleNav = (id: string) => {
    onNavigate(id);
    setIsOpen(false);
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center cursor-pointer" onClick={() => handleNav('home')}>
            <div className="bg-blue-600 p-2 rounded-lg">
              <Stethoscope className="h-6 w-6 text-white" />
            </div>
            <div className="ml-3 hidden md:block">
              <span className="text-xl font-bold text-gray-900 block leading-tight">SRI VENKATESWAR</span>
              <span className="text-xs font-semibold text-blue-600 uppercase tracking-widest">Digital X-Ray & Lab</span>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNav(link.id)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  link.primary
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                    : currentPage === link.id
                    ? 'text-blue-600'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                {link.name}
              </button>
            ))}

            {user ? (
              <div className="flex items-center space-x-4 ml-4 pl-4 border-l border-gray-200">
                <div className="flex items-center space-x-2">
                  <UserIcon className="h-5 w-5 text-gray-400" />
                  <span className="text-sm font-semibold text-gray-700">{user.name}</span>
                </div>
                <button
                  onClick={onLogout}
                  className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => onNavigate('login')}
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Sign In
              </button>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md text-gray-600 hover:text-blue-600 focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 px-2 pt-2 pb-3 space-y-1">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleNav(link.id)}
              className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${
                link.primary ? 'text-blue-600 font-bold' : 'text-gray-600'
              }`}
            >
              {link.name}
            </button>
          ))}
          {user ? (
            <button
              onClick={onLogout}
              className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600"
            >
              Logout
            </button>
          ) : (
            <button
              onClick={() => handleNav('login')}
              className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-blue-600"
            >
              Sign In
            </button>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
