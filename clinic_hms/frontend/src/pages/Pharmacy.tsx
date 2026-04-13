import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { api } from '../api/axios';
import { Pill, CheckCircle, Package } from 'lucide-react';

const Pharmacy = () => {
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const pRes = await api.get('/pharmacy/prescriptions');
      setPrescriptions(pRes.data.data);
      const iRes = await api.get('/pharmacy/inventory');
      setInventory(iRes.data.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDispense = async (prescriptionId: number) => {
    setLoading(true);
    try {
      await api.post('/pharmacy/dispense', { prescriptionId });
      alert('Medicines Dispensed! Inventory Deducted.');
      fetchData();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Error dispensing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-6 h-full">
        <h1 className="text-2xl font-bold text-slate-800">Pharmacy Operations</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-8rem)]">
          {/* Pending Prescriptions */}
          <div className="lg:col-span-2 flex flex-col space-y-4 overflow-y-auto pb-8">
             <div className="flex items-center">
                <Pill className="h-6 w-6 text-blue-600 mr-2" />
                <h2 className="font-bold text-lg text-slate-700">Pending Prescriptions ({prescriptions.length})</h2>
             </div>
             
             {prescriptions.length === 0 && (
                <div className="bg-white p-12 text-center rounded-xl border border-slate-200 text-slate-500">
                  No active prescriptions waiting to be dispensed.
                </div>
             )}

             {prescriptions.map(p => (
               <div key={p.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                 <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-slate-800 text-lg">{p.consultation.patient.name}</h3>
                      <p className="text-xs text-slate-500">Ph: {p.consultation.patient.phone} • Dr: {p.consultation.doctor.name}</p>
                    </div>
                    <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-3 py-1 rounded-full">
                      WAITING
                    </span>
                 </div>
                 <div className="p-4">
                    <table className="min-w-full text-sm mb-4">
                       <thead className="bg-slate-50 border-b text-slate-500 text-left">
                         <tr>
                           <th className="px-3 py-2 font-medium">Medicine</th>
                           <th className="px-3 py-2 font-medium w-32">Dosage</th>
                           <th className="px-3 py-2 font-medium w-24">Qty</th>
                         </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-100">
                         {p.items.map((item: any) => (
                           <tr key={item.id}>
                             <td className="px-3 py-3 font-medium text-slate-800">{item.medicine.name}</td>
                             <td className="px-3 py-3 text-slate-600">{item.dosage} for {item.duration}</td>
                             <td className="px-3 py-3 text-slate-800 font-bold">{item.quantity}</td>
                           </tr>
                         ))}
                       </tbody>
                    </table>
                    <div className="flex justify-end">
                       <button 
                         onClick={() => handleDispense(p.id)}
                         disabled={loading}
                         className="flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded shadow transition"
                       >
                         <CheckCircle className="h-4 w-4 mr-2" />
                         Mark Dispensed & Pack
                       </button>
                    </div>
                 </div>
               </div>
             ))}
          </div>

          {/* Quick Inventory Tracker */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-full overflow-hidden">
             <div className="p-4 bg-slate-900 border-b border-slate-200 flex items-center shrink-0">
               <Package className="h-5 w-5 text-indigo-400 mr-2" />
               <h2 className="font-bold text-white">Live Inventory</h2>
             </div>
             <div className="flex-1 overflow-y-auto p-0">
                <table className="min-w-full">
                  <tbody>
                    {inventory.map(inv => (
                      <tr key={inv.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-3 px-4 text-sm font-medium text-slate-800">{inv.name}</td>
                        <td className="py-3 px-4 text-right">
                          <span className={`text-xs font-bold px-2 py-1 rounded ${inv.stock < 100 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                            {inv.stock} units
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

export default Pharmacy;
