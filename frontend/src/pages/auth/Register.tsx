import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { authApi } from '../../services/hospitalApi';
import { FormInput } from '../../components/forms/FormInput';
import { FormSelect } from '../../components/forms/FormSelect';
import { FaHospitalAlt, FaEnvelope, FaLock, FaUser, FaPhone } from 'react-icons/fa';
import toast from 'react-hot-toast';

export const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    gender: 'Male',
    dob: '1995-01-01',
    bloodGroup: 'O+',
  });
  const [loading, setLoading] = useState(false);

  const { dispatch } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password || !formData.phone) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.register({
        ...formData,
        role: 'patient',
      });
      if (res.data.success) {
        const { user, accessToken, refreshToken } = res.data.data;
        dispatch({
          type: 'auth/setCredentials',
          payload: { user, accessToken, refreshToken },
        });
        toast.success('Registration successful! Welcome to AuraCare.');
        navigate('/patient/dashboard');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Registration failed.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-primary-50/30 to-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-lg w-full">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary-700 to-primary-500 text-white shadow-lg shadow-primary-500/30 mb-3">
            <FaHospitalAlt className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Patient Portal Registration
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Create your personal medical record account with AuraCare
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 p-6 sm:p-8">
          <form onSubmit={handleRegister} className="space-y-4">
            <FormInput
              label="Full Name"
              name="name"
              icon={FaUser}
              placeholder="e.g. John Doe"
              value={formData.name}
              onChange={handleChange}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput
                label="Email"
                type="email"
                name="email"
                icon={FaEnvelope}
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <FormInput
                label="Phone Number"
                type="tel"
                name="phone"
                icon={FaPhone}
                placeholder="+1 555-0100"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormSelect
                label="Gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                options={[
                  { label: 'Male', value: 'Male' },
                  { label: 'Female', value: 'Female' },
                  { label: 'Other', value: 'Other' },
                ]}
              />
              <FormSelect
                label="Blood Group"
                name="bloodGroup"
                value={formData.bloodGroup}
                onChange={handleChange}
                options={[
                  { label: 'A+', value: 'A+' },
                  { label: 'A-', value: 'A-' },
                  { label: 'B+', value: 'B+' },
                  { label: 'B-', value: 'B-' },
                  { label: 'AB+', value: 'AB+' },
                  { label: 'AB-', value: 'AB-' },
                  { label: 'O+', value: 'O+' },
                  { label: 'O-', value: 'O-' },
                  { label: 'Unknown', value: 'Unknown' },
                ]}
              />
              <FormInput
                label="Birth Date"
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                required
              />
            </div>

            <FormInput
              label="Create Password"
              type="password"
              name="password"
              icon={FaLock}
              placeholder="At least 6 characters"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl shadow-md shadow-primary-500/20 transition-all disabled:opacity-50 mt-4"
            >
              {loading ? 'Creating Account...' : 'Complete Patient Registration'}
            </button>
          </form>
        </div>

        <p className="mt-5 text-center text-xs text-slate-500">
          Already registered?{' '}
          <Link
            to="/login"
            className="font-semibold text-primary-600 hover:text-primary-700"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};
