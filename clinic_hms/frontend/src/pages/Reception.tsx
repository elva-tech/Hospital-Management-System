import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { api } from '../api/axios';
import { UserPlus, Users } from 'lucide-react';

const Reception = () => {
  const [queue, setQueue] = useState<any[]>([]);
  const [formData, setFormData] = useState({ phone: '', name: '', age: '', gender: '', address: '' });
  const [loading, setLoading] = useState(false);
  const [searchPhone, setSearchPhone] = useState('');

  const fetchQueue = async () => {
    try {
      const { data } = await api.get('/queue/today');
      setQueue(data.data);
    } catch (e) { console.error('Error fetching queue', e); }
  };

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 15000); // 15 sec polling
    return () => clearInterval(interval);
  }, []);

  const fetchPatientByPhone = async () => {
    if (searchPhone.length < 10) return;
    try {
      const { data } = await api.get(`/patients/${searchPhone}`);
      setFormData({
        phone: data.data.phone, name: data.data.name, age: data.data.age.toString(), gender: data.data.gender, address: data.data.address || ''
      });
    } catch (e) {
      // Patient not found, ignore
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...formData, age: parseInt(formData.age) };
      await api.post('/patients/register', payload);
      setFormData({ phone: '', name: '', age: '', gender: '', address: '' });
      setSearchPhone('');
      fetchQueue();
    } catch (error) {
      alert('Error registering patient');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-6">
        <h1 className="text-2xl font-bold text-slate-800">Reception Desk</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Registration Form */}
          <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center mb-6">
              <UserPlus className="h-6 w-6 text-blue-600 mr-2" />
              <h2 className="text-lg font-bold text-slate-800">Register Patient</h2>
            </div>
            
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                <input 
                  type="text" required value={searchPhone || formData.phone} 
                  onChange={(e) => { setSearchPhone(e.target.value); setFormData({...formData, phone: e.target.value}); }}
                  onBlur={fetchPatientByPhone}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                  placeholder="Scan or type phone..." 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input 
                  type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Age</label>
                  <input 
                    type="number" required value={formData.age} onChange={(e) => setFormData({...formData, age: e.target.value})}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
                  <select required value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Address (Optional)</label>
                <input 
                  type="text" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                />
              </div>
              <button disabled={loading} type="submit" className="w-full bg-blue-600 text-white font-medium py-2 rounded-lg hover:bg-blue-700 transition">
                {loading ? 'Processing...' : 'Register & Queue'}
              </button>
            </form>
          </div>

          {/* Live Queue */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-xl">
              <div className="flex items-center">
                <Users className="h-6 w-6 text-emerald-600 mr-2" />
                <h2 className="text-lg font-bold text-slate-800">Live Active Queue</h2>
              </div>
              <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">{queue.length} Total</span>
            </div>
            
            <div className="flex-1 overflow-auto p-0">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Token</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {queue.length === 0 ? (
                    <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500">No patients in the queue today.</td></tr>
                  ) : queue.map((q) => (
                    <tr key={q.id} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap text-lg font-bold text-blue-600">#{q.tokenNumber}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{q.patient.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{q.patient.phone}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          q.status === 'WAITING' ? 'bg-yellow-100 text-yellow-800' :
                          q.status === 'IN_CONSULTATION' ? 'bg-blue-100 text-blue-800' : 
                          'bg-green-100 text-green-800'
                        }`}>
                          {q.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Reception;
