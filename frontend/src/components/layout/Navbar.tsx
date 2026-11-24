import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { FaUserCircle, FaSignOutAlt, FaHospitalAlt, FaBars } from 'react-icons/fa';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const roleNameMap: Record<string, string> = {
    admin: 'Administrator',
    doctor: 'Doctor',
    receptionist: 'Receptionist',
    patient: 'Patient',
    pharmacist: 'Pharmacist',
    lab_technician: 'Lab Technician',
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3.5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <FaBars className="w-5 h-5" />
          </button>
        )}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary-700 to-primary-500 flex items-center justify-center text-white shadow-sm shadow-primary-500/20">
            <FaHospitalAlt className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-slate-900 tracking-tight text-base sm:text-lg block leading-none">
              AuraCare <span className="text-primary-600 font-semibold text-xs sm:text-sm">HMS</span>
            </span>
            <span className="text-2xs text-slate-400 font-medium tracking-wider uppercase">
              Hospital Management
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {/* User Info & Role Badge */}
        {user && (
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <span className="text-sm font-semibold text-slate-900 block leading-tight">
                {user.name}
              </span>
              <span className="inline-block text-2xs font-semibold px-2 py-0.5 mt-0.5 rounded-full bg-primary-50 text-primary-700 border border-primary-200 uppercase tracking-wider">
                {roleNameMap[user.role] || user.role}
              </span>
            </div>

            <Link
              to="/profile"
              className="flex items-center gap-2 p-1.5 rounded-full hover:ring-2 hover:ring-primary-300 transition-all"
            >
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-9 h-9 rounded-full object-cover border border-slate-200"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm">
                  {user.name.charAt(0)}
                </div>
              )}
            </Link>

            <button
              onClick={handleLogout}
              title="Logout"
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            >
              <FaSignOutAlt className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
