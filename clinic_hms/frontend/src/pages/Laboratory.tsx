import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { api } from '../api/axios';
import { Beaker, CheckCircle, Clock } from 'lucide-react';

const Laboratory = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [testResults, setTestResults] = useState<{ [key: string]: string }>({});
  const [submitting, setSubmitting] = useState<number | null>(null);

  const fetchPending = async () => {
    try {
      const { data } = await api.get('/diagnosis/pending');
      setRequests(data.data);
    } catch (err) {
      console.error('Error fetching lab requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleResultSubmit = async (requestId: number) => {
    const results = testResults[requestId];
    if (!results) return alert('Please enter results first');

    setSubmitting(requestId);
    try {
      await api.patch('/diagnosis/results', { requestId, results });
      alert('Lab report completed and shared on WhatsApp!');
      fetchPending(); // Refresh list
    } catch (err) {
      alert('Error updating results');
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-6 max-w-6xl mx-auto h-full">
        <div className="flex justify-between items-center sm:flex-row flex-col gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center">
              <Beaker className="h-6 w-6 mr-2 text-indigo-600" />
              Laboratory Desk
            </h1>
            <p className="text-slate-500">Manage investigations and diagnostic reports</p>
          </div>
          <button onClick={fetchPending} className="bg-white border border-slate-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition">
            Refresh List
          </button>
        </div>

        {loading ? (
          <div className="h-64 flex items-center justify-center">
             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
             <Clock className="h-12 w-12 text-slate-300 mx-auto mb-4" />
             <h3 className="text-lg font-bold text-slate-800">No Pending Investigations</h3>
             <p className="text-slate-500">All lab requests have been processed.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {requests.map((req) => (
              <div key={req.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col hover:border-indigo-300 transition-colors">
                <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                  <div className="flex justify-between items-start mb-2">
                    <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">Lab Request #{req.id}</span>
                    <span className="text-slate-400 text-xs">{new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <h3 className="font-bold text-slate-800 text-lg leading-tight uppercase mb-1">{req.testName}</h3>
                  <div className="flex items-center text-sm text-slate-600">
                    <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold mr-2">
                      {req.consultation.patient.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold leading-none">{req.consultation.patient.name}</p>
                      <p className="text-[10px] mt-1 text-slate-400">{req.consultation.patient.phone}</p>
                    </div>
                  </div>
                </div>

                <div className="p-5 flex flex-col flex-1 gap-4">
                   <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-2">Symptoms Noted:</h4>
                      <p className="text-xs text-slate-700 italic">"{req.consultation.symptoms}"</p>
                   </div>

                   <div className="mt-auto">
                     <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Findings / Results</label>
                     <textarea 
                       value={testResults[req.id] || ''}
                       onChange={(e) => setTestResults({ ...testResults, [req.id]: e.target.value })}
                       className="w-full text-sm border border-slate-200 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 outline-none h-24 transition bg-white"
                       placeholder="Enter quantitative or qualitative results..."
                     />
                   </div>

                   <button 
                     onClick={() => handleResultSubmit(req.id)}
                     disabled={submitting === req.id}
                     className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg flex items-center justify-center transition shadow-sm disabled:opacity-50"
                   >
                     {submitting === req.id ? 'Processing...' : (
                       <>
                         <CheckCircle className="h-4 w-4 mr-2" />
                         Complete & Notify Patient
                       </>
                     )}
                   </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Laboratory;
