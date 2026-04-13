import React, { useState } from 'react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { api } from '../api/axios';
import { Search, Receipt, CheckCircle, Smartphone } from 'lucide-react';
import { shareOnWhatsApp } from '../utils/whatsapp';

const Billing = () => {
  const [searchPhone, setSearchPhone] = useState('');
  const [patient, setPatient] = useState<any>(null);
  const [bill, setBill] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [payMode, setPayMode] = useState('CASH');

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setPatient(null);
    setBill(null);

    try {
      // 1. Find Patient
      const { data: pData } = await api.get(`/patients/${searchPhone}`);
      setPatient(pData.data);

      // 2. Fetch or Generate Bill
      const { data: bData } = await api.get(`/billing/${pData.data.id}`);
      setBill(bData.data);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error finding pending bills');
    } finally {
      setLoading(false);
    }
  };

  const processPayment = async () => {
    if (!bill) return;
    setLoading(true);
    try {
      await api.post('/billing/pay', { billingId: bill.id, paymentMode: payMode });
      setBill({ ...bill, status: 'PAID', paymentMode: payMode });
      alert(`Payment Processed via ${payMode}.`);
    } catch (e) {
      alert('Error processing payment');
    } finally {
      setLoading(false);
    }
  };

  const shareReceipt = () => {
    if (!bill || !patient) return;
    const msg = `*Clinic HMS - Invoice Receipt*\n\nBill ID: #${bill.id}\nPatient: ${patient.name}\nAmount Paid: ₹${bill.amount}\nMode: ${bill.paymentMode || payMode}\nDate: ${new Date(bill.date).toLocaleDateString()}\n\n_Thank you for your visit. Stay healthy!_`;
    shareOnWhatsApp(patient.phone, msg);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-6 max-w-4xl mx-auto h-full">
        <h1 className="text-2xl font-bold text-slate-800">Billing & Checkout</h1>

        {/* Search */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-slate-700 mb-1">Patient Phone Number</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchPhone}
                onChange={(e) => setSearchPhone(e.target.value)}
                className="pl-10 w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Enter 10-digit number"
                onKeyDown={(e) => { if(e.key === 'Enter') handleSearch() }}
              />
            </div>
          </div>
          <button onClick={() => handleSearch()} disabled={loading || searchPhone.length < 10} className="bg-blue-600 text-white font-medium py-2 px-6 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 h-[42px]">
            {loading ? 'Searching...' : 'Find Bills'}
          </button>
        </div>

        {/* Invoice Display */}
        {patient && bill && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-6 bg-slate-900 text-white flex justify-between items-center sm:flex-row flex-col gap-4">
               <div className="flex items-center">
                 <Receipt className="h-8 w-8 text-blue-400 mr-3" />
                 <div>
                   <h2 className="font-bold text-xl">Tax Invoice</h2>
                   <p className="text-slate-400 text-sm">Bill #{bill.id} • {new Date(bill.date).toLocaleDateString()}</p>
                 </div>
               </div>
               <div className="text-right">
                 <p className="text-2xl font-bold">₹{bill.amount.toFixed(2)}</p>
                 <span className={`inline-flex px-2 mt-1 rounded text-xs font-bold ${bill.status === 'PAID' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-yellow-500/20 text-yellow-500'}`}>
                   {bill.status}
                 </span>
               </div>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 border-b border-slate-100">
               <div>
                 <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Billed To</h3>
                 <p className="font-bold text-slate-800">{patient.name}</p>
                 <p className="text-slate-500">{patient.phone}</p>
                 <p className="text-slate-500 text-sm">{patient.address || 'Walk-in Patient'}</p>
               </div>
               <div className="md:text-right">
                 <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Service Details</h3>
                 <p className="font-medium text-slate-800">Consultation #{bill.consultationId}</p>
               </div>
            </div>

            <div className="p-0">
               <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 text-sm">
                    <tr>
                      <th className="py-3 px-6 font-medium">Description</th>
                      <th className="py-3 px-6 font-medium text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    <tr>
                      <td className="py-4 px-6 text-slate-800 font-medium">Doctor Consultation Fee</td>
                      <td className="py-4 px-6 text-right font-medium text-slate-800">₹500.00</td>
                    </tr>
                    {bill.consultation?.prescription?.items?.map((item: any) => (
                      <tr key={item.id}>
                        <td className="py-4 px-6 text-slate-600 pl-10 text-sm">↳ {item.medicine.name} ({item.quantity} qty)</td>
                        <td className="py-4 px-6 text-right font-medium text-slate-600 text-sm">₹{(item.medicine.price * item.quantity).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
               </table>
            </div>

            {bill.status === 'PENDING' && (
              <div className="p-6 bg-slate-50 border-t border-slate-100 mt-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                 <div className="flex items-center space-x-4 w-full sm:w-auto">
                    <label className="flex items-center text-sm font-medium text-slate-700 cursor-pointer">
                      <input type="radio" value="CASH" checked={payMode === 'CASH'} onChange={() => setPayMode('CASH')} className="mr-2 text-blue-600 focus:ring-blue-500" />
                      Cash
                    </label>
                    <label className="flex items-center text-sm font-medium text-slate-700 cursor-pointer">
                      <input type="radio" value="UPI" checked={payMode === 'UPI'} onChange={() => setPayMode('UPI')} className="mr-2 text-blue-600 focus:ring-blue-500" />
                      UPI
                    </label>
                 </div>
                 <button onClick={processPayment} disabled={loading} className="w-full sm:w-auto flex items-center justify-center px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm transition">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    {loading ? 'Processing...' : `Mark ₹${bill.amount} as Paid`}
                 </button>
              </div>
            )}
            
            {bill.status === 'PAID' && (
              <div className="p-6 bg-slate-50 border-t border-slate-100 flex flex-col items-center justify-center gap-4">
                <div className="flex items-center text-emerald-600 font-medium">
                  <CheckCircle className="h-5 w-5 mr-2" /> Invoice fully settled.
                </div>
                <button 
                  onClick={shareReceipt}
                  className="flex items-center justify-center px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm transition"
                >
                  <Smartphone className="h-4 w-4 mr-2" />
                  Share Receipt on WhatsApp
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Billing;
