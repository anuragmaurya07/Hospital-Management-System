import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { authApi } from '../../services/hospitalApi';
import { FormInput } from '../../components/forms/FormInput';
import {
  FaHospitalAlt,
  FaEnvelope,
  FaLock,
  FaUserShield,
  FaUserMd,
  FaUserCheck,
  FaUserInjured,
  FaPills,
  FaFlask
} from 'react-icons/fa';
import toast from 'react-hot-toast';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('admin@hospital.com');
  const [password, setPassword] = useState('Admin@123');
  const [loading, setLoading] = useState(false);

  const { dispatch } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e?: React.FormEvent, customEmail?: string, customPass?: string) => {
    if (e) e.preventDefault();
    const loginEmail = customEmail || email;
    const loginPass = customPass || password;

    if (!loginEmail || !loginPass) {
      toast.error('Please enter both email and password');
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.login({ email: loginEmail, password: loginPass });
      if (res.data.success) {
        const { user, profile, accessToken, refreshToken } = res.data.data;
        dispatch({
          type: 'auth/setCredentials',
          payload: { user, profile, accessToken, refreshToken }
        });
        toast.success(`Welcome back, ${user.name}!`);

        // Route to respective role dashboard
        const roleRouteMap: Record<string, string> = {
          admin: '/admin/dashboard',
          doctor: '/doctor/dashboard',
          receptionist: '/receptionist/dashboard',
          patient: '/patient/dashboard',
          pharmacist: '/pharmacist/dashboard',
          lab_technician: '/laboratory/dashboard'
        };
        navigate(roleRouteMap[user.role] || '/admin/dashboard');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const demoAccounts = [
    {
      role: 'Admin',
      name: 'Dr. Vance',
      email: 'admin@hospital.com',
      pass: 'Admin@123',
      icon: FaUserShield,
      color: 'bg-primary-50 text-primary-700 hover:bg-primary-100 border-primary-200'
    },
    {
      role: 'Doctor',
      name: 'Dr. Jenkins',
      email: 'doctor@hospital.com',
      pass: 'Doctor@123',
      icon: FaUserMd,
      color: 'bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200'
    },
    {
      role: 'Receptionist',
      name: 'Emily Watson',
      email: 'receptionist@hospital.com',
      pass: 'Reception@123',
      icon: FaUserCheck,
      color: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200'
    },
    {
      role: 'Patient',
      name: 'John Doe',
      email: 'patient@hospital.com',
      pass: 'Patient@123',
      icon: FaUserInjured,
      color: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-200'
    },
    {
      role: 'Pharmacist',
      name: 'David Miller',
      email: 'pharmacist@hospital.com',
      pass: 'Pharma@123',
      icon: FaPills,
      color: 'bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200'
    },
    {
      role: 'Lab Tech',
      name: 'Robert Vance',
      email: 'lab@hospital.com',
      pass: 'Lab@123',
      icon: FaFlask,
      color: 'bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200'
    }
  ];

  const quickDemoLogin = (accEmail: string, accPass: string) => {
    setEmail(accEmail);
    setPassword(accPass);
    handleLogin(undefined, accEmail, accPass);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-primary-50/30 to-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-xl w-full">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary-700 to-primary-500 text-white shadow-lg shadow-primary-500/30 mb-4">
            <FaHospitalAlt className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            AuraCare Hospital Management
          </h1>
          <p className="mt-1.5 text-sm text-slate-500">
            Sign in to access your role-based medical dashboard
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 p-6 sm:p-8">
          <form onSubmit={handleLogin} className="space-y-4">
            <FormInput
              label="Email Address"
              type="email"
              icon={FaEnvelope}
              placeholder="name@hospital.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <FormInput
              label="Password"
              type="password"
              icon={FaLock}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded border-slate-300 text-primary-600 focus:ring-primary-500 mr-2"
                />
                Remember this session
              </label>
              <Link
                to="/forgot-password"
                className="font-medium text-primary-600 hover:text-primary-700"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl shadow-md shadow-primary-500/20 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                'Sign In to Portal'
              )}
            </button>
          </form>

          {/* Quick 1-Click Role Switcher */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                ⚡ 1-Click Demo Login
              </span>
              <span className="text-2xs text-slate-400">Click role to auto-sign-in</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {demoAccounts.map((acc) => {
                const Icon = acc.icon;
                return (
                  <button
                    key={acc.role}
                    type="button"
                    onClick={() => quickDemoLogin(acc.email, acc.pass)}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all text-xs font-semibold ${acc.color}`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <div className="truncate">
                      <span className="block truncate">{acc.role}</span>
                      <span className="block text-2xs opacity-70 font-normal truncate">
                        {acc.name}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-slate-500">
          New patient?{' '}
          <Link
            to="/register"
            className="font-semibold text-primary-600 hover:text-primary-700"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};
