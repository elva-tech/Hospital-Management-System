import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { api } from '../api/axios';
import { Pill, CheckCircle, Package, Plus, Edit2, Trash2, X } from 'lucide-react';

const Pharmacy = () => {
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Inventory Management State
  const [showModal, setShowModal] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', stock: '', price: '' });

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

  const handleOpenModal = (med: any = null) => {
    if (med) {
      setEditingMedicine(med);
      setFormData({ name: med.name, stock: med.stock.toString(), price: med.price.toString() });
    } else {
      setEditingMedicine(null);
      setFormData({ name: '', stock: '', price: '' });
    }
    setShowModal(true);
  };

  const handleSaveMedicine = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingMedicine) {
        await api.put(`/pharmacy/inventory/${editingMedicine.id}`, formData);
      } else {
        await api.post('/pharmacy/inventory', formData);
      }
      setShowModal(false);
      fetchData();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Error saving medicine');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMedicine = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this medicine?')) return;
    try {
      await api.delete(`/pharmacy/inventory/${id}`);
      fetchData();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Error deleting medicine');
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-6 h-full">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-slate-800">Pharmacy Operations</h1>
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow transition"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Medicine
          </button>
        </div>
        
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
                   <thead className="bg-slate-50 border-b text-slate-500 text-xs uppercase tracking-wider">
                     <tr>
                       <th className="py-2 px-4 text-left font-semibold">Medicine</th>
                       <th className="py-2 px-4 text-right font-semibold">Stock</th>
                       <th className="py-2 px-4 text-center font-semibold text-[10px]">Actions</th>
                     </tr>
                   </thead>
                   <tbody>
                    {inventory.map(inv => (
                      <tr key={inv.id} className="border-b border-slate-100 hover:bg-slate-50 group">
                        <td className="py-3 px-4">
                          <div className="text-sm font-medium text-slate-800">{inv.name}</div>
                          <div className="text-[10px] text-slate-500">₹{inv.price.toFixed(2)} / unit</div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${inv.stock < 100 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                            {inv.stock}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-center">
                          <div className="flex justify-center space-x-1">
                            <button 
                              onClick={() => handleOpenModal(inv)}
                              className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-md hover:bg-indigo-50 transition"
                              title="Edit"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button 
                              onClick={() => handleDeleteMedicine(inv.id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-red-50 transition"
                              title="Delete"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>
          </div>

        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-lg font-bold text-slate-800">
                {editingMedicine ? 'Edit Medicine' : 'Add New Medicine'}
              </h2>
              <button 
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-slate-200 rounded-full transition"
              >
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>
            
            <form onSubmit={handleSaveMedicine} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Medicine Name</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                  placeholder="e.g. Paracetamol 650mg"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Stock Quantity</label>
                  <input 
                    type="number" 
                    required
                    min="0"
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                    placeholder="0"
                    value={formData.stock}
                    onChange={e => setFormData({...formData, stock: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Price per unit</label>
                  <input 
                    type="number" 
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                    placeholder="0.00"
                    value={formData.price}
                    onChange={e => setFormData({...formData, price: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="pt-4 flex space-x-3">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 shadow-md shadow-indigo-200 disabled:opacity-50 transition"
                >
                  {loading ? 'Saving...' : 'Save Medicine'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Pharmacy;
