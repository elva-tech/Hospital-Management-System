import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { api } from '../api/axios';
import { Activity, User, PlusCircle, Share2 } from 'lucide-react';
import { shareOnWhatsApp } from '../utils/whatsapp';

const DoctorRoom = () => {
  const [queue, setQueue] = useState<any[]>([]);
  const [activePatient, setActivePatient] = useState<any | null>(null);
  const [activeQueueId, setActiveQueueId] = useState<number | null>(null);
  const [consultationData, setConsultationData] = useState({ symptoms: '', diagnosis: '', notes: '' });
  const [lastConsultation, setLastConsultation] = useState<any>(null);
  
  // Prescription State
  const [inventory, setInventory] = useState<any[]>([]);
  const [prescriptionItems, setPrescriptionItems] = useState<any[]>([]);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchQueue();
    fetchInventory();
    const interval = setInterval(fetchQueue, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchQueue = async () => {
    try {
      const { data } = await api.get('/queue/today');
      setQueue(data.data.filter((q: any) => q.status !== 'COMPLETED'));
    } catch (e) { console.error(e); }
  };

  const fetchInventory = async () => {
    try {
      const { data } = await api.get('/pharmacy/inventory');
      setInventory(data.data);
    } catch (e) { console.error(e); }
  };

  const callPatient = async (q: any) => {
    try {
      await api.patch('/queue/status', { queueId: q.id, status: 'IN_CONSULTATION' });
      setActivePatient(q.patient);
      setActiveQueueId(q.id);
      fetchQueue();
    } catch (e) { alert('Error updating status'); }
  };

  const addMedicine = () => setPrescriptionItems([...prescriptionItems, { medicineId: '', dosage: '1-0-1', duration: '3 days', quantity: 6 }]);

  const handleFinishConsultation = async () => {
    if (!activePatient) return;
    setProcessing(true);
    try {
      // 1. Create Consultation
      const consultPayload = {
        queueId: activeQueueId,
        patientId: activePatient.id,
        ...consultationData
      };
      
      const res = await api.post('/doctor/consultation', consultPayload);
      const consultationId = res.data.data.id;

      let medText = '';
      // 2. Issue Prescription if exist
      if (prescriptionItems.length > 0) {
        const validItems = prescriptionItems.filter(i => i.medicineId).map(i => {
          const med = inventory.find(m => m.id.toString() === i.medicineId.toString());
          if (med) medText += `- ${med.name}: ${i.dosage} x ${i.duration}\n`;
          return {
            ...i,
            medicineId: parseInt(i.medicineId),
            quantity: parseInt(i.quantity)
          };
        });
        
        if (validItems.length > 0) {
           await api.post('/doctor/prescription', { consultationId, items: validItems });
        }
      }

      const shareData = {
        phone: activePatient.phone,
        name: activePatient.name,
        diagnosis: consultationData.diagnosis,
        medText
      };

      setLastConsultation(shareData);

      // Reset
      setActivePatient(null);
      setActiveQueueId(null);
      setConsultationData({ symptoms: '', diagnosis: '', notes: '' });
      setPrescriptionItems([]);
      fetchQueue();
    } catch (e) {
      alert('Error saving record');
    } finally {
      setProcessing(false);
    }
  };

  const sharePrescription = () => {
    if (!lastConsultation) return;
    const msg = `*Clinic HMS - Prescription*\n\nPatient: ${lastConsultation.name}\nDiagnosis: ${lastConsultation.diagnosis}\n\n*Medicines:*\n${lastConsultation.medText || 'No medicines prescribed.'}\n\n_Please proceed to the pharmacy._`;
    shareOnWhatsApp(lastConsultation.phone, msg);
    setLastConsultation(null);
  };

  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
        {/* Patient Queue Sidebar */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[calc(100vh-6rem)]">
          <div className="bg-slate-900 p-4 text-white">
            <h2 className="font-bold">Waiting Room</h2>
            <p className="text-xs text-slate-400">{queue.length} pending</p>
          </div>
          <div className="overflow-y-auto flex-1 p-2 space-y-2 bg-slate-50">
            {queue.map(q => (
              <div key={q.id} className="bg-white p-3 rounded shadow-sm border border-slate-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-lg text-blue-600">#{q.tokenNumber}</span>
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">{q.status}</span>
                </div>
                <p className="font-medium text-slate-800">{q.patient.name}</p>
                <p className="text-xs text-slate-500 mb-3">{q.patient.age} yrs • {q.patient.gender}</p>
                
                <button 
                  disabled={activePatient !== null}
                  onClick={() => callPatient(q)}
                  className="w-full text-xs font-semibold py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded transition disabled:opacity-50"
                >
                  Call In
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Action Panel */}
        <div className="lg:col-span-3 h-[calc(100vh-6rem)] flex flex-col">
          {lastConsultation && (
            <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="flex items-center text-emerald-800">
                <div className="bg-emerald-100 p-2 rounded-full mr-3">
                  <Share2 className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="font-bold text-sm">Consultation Finished!</p>
                  <p className="text-xs">Would you like to share the prescription with {lastConsultation.name}?</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button onClick={sharePrescription} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition flex items-center shadow-sm">
                   Share on WhatsApp
                </button>
                <button onClick={() => setLastConsultation(null)} className="text-slate-400 text-xs hover:text-slate-600 transition">Dismiss</button>
              </div>
            </div>
          )}

          {!activePatient ? (
            <div className="flex-1 bg-white rounded-xl border border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400">
              <Activity className="h-16 w-16 mb-4 text-slate-200" />
              <p className="text-lg">No active consultation.</p>
              <p className="text-sm">Call a patient from the waiting room to begin.</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col">
              {/* Header */}
              <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-blue-50/50">
                <div className="flex items-center">
                  <div className="h-14 w-14 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                    <User className="h-7 w-7 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">{activePatient.name}</h2>
                    <p className="text-slate-500">{activePatient.phone} • {activePatient.age} yrs</p>
                  </div>
                </div>
              </div>

              {/* Consultation Area */}
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
                <div className="space-y-4">
                   <h3 className="font-bold text-slate-700 border-b pb-2">Vitals & Diagnosis</h3>
                   <div>
                     <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Symptoms observed</label>
                     <textarea rows={3} value={consultationData.symptoms} onChange={e => setConsultationData({...consultationData, symptoms: e.target.value})} className="w-full rounded-lg border-slate-300 border p-3 text-sm focus:ring-1 outline-none" placeholder="E.g., Fever, dry cough..." />
                   </div>
                   <div>
                     <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Final Diagnosis</label>
                     <input type="text" value={consultationData.diagnosis} onChange={e => setConsultationData({...consultationData, diagnosis: e.target.value})} className="w-full rounded-lg border-slate-300 border px-3 py-2 text-sm focus:ring-1 outline-none" placeholder="E.g., Viral Pharyngitis" />
                   </div>
                   <div>
                     <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Doctor's Notes</label>
                     <textarea rows={2} value={consultationData.notes} onChange={e => setConsultationData({...consultationData, notes: e.target.value})} className="w-full rounded-lg border-slate-300 border p-3 text-sm focus:ring-1 outline-none" placeholder="Rest for 3 days..." />
                   </div>

                   {/* Lab Request Section */}
                   <div className="pt-4 border-t border-slate-100">
                     <label className="block text-xs font-medium text-slate-500 uppercase mb-2">Request Lab Test (Investigation)</label>
                     <div className="flex gap-2">
                        <input 
                          type="text" 
                          id="labTestInput"
                          placeholder="e.g. Blood Test, X-Ray" 
                          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-500"
                         />
                        <button 
                          type="button"
                          onClick={async () => {
                            const el = document.getElementById('labTestInput') as HTMLInputElement;
                            if (!el.value || !activeQueueId) return;
                            try {
                              await api.post('/diagnosis/request', { consultationId: activeQueueId, testName: el.value });
                              alert(`Lab request for "${el.value}" sent!`);
                              el.value = '';
                            } catch (e) {
                              alert('Error sending lab request');
                            }
                          }}
                          className="bg-slate-800 text-white px-3 py-2 rounded-lg text-xs font-bold hover:bg-slate-900 transition"
                        >
                          Request
                        </button>
                     </div>
                   </div>
                </div>

                <div className="space-y-4">
                   <div className="flex justify-between items-center border-b pb-2">
                     <h3 className="font-bold text-slate-700">Prescription</h3>
                     <button onClick={addMedicine} className="text-xs flex items-center text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded">
                       <PlusCircle className="h-3 w-3 mr-1" /> Add Med
                     </button>
                   </div>
                   
                   <div className="space-y-3">
                      {prescriptionItems.map((item, idx) => (
                        <div key={idx} className="bg-slate-50 p-3 rounded border border-slate-200 grid grid-cols-12 gap-2">
                           <div className="col-span-12">
                              <select className="w-full text-sm border-slate-300 rounded" value={item.medicineId} onChange={e => { const n = [...prescriptionItems]; n[idx].medicineId = e.target.value; setPrescriptionItems(n); }}>
                                <option value="">Select Medicine</option>
                                {inventory.map(m => <option key={m.id} value={m.id}>{m.name} (Stock: {m.stock}) - ₹{m.price}</option>)}
                              </select>
                           </div>
                           <div className="col-span-4">
                              <input type="text" placeholder="Dosage" className="w-full text-xs border-slate-300 rounded" value={item.dosage} onChange={e => { const n = [...prescriptionItems]; n[idx].dosage = e.target.value; setPrescriptionItems(n); }} />
                           </div>
                           <div className="col-span-4">
                              <input type="text" placeholder="Duration" className="w-full text-xs border-slate-300 rounded" value={item.duration} onChange={e => { const n = [...prescriptionItems]; n[idx].duration = e.target.value; setPrescriptionItems(n); }} />
                           </div>
                           <div className="col-span-3">
                              <input type="number" placeholder="Qty" className="w-full text-xs border-slate-300 rounded" value={item.quantity} onChange={e => { const n = [...prescriptionItems]; n[idx].quantity = e.target.value; setPrescriptionItems(n); }} />
                           </div>
                           <div className="col-span-1 flex items-center justify-center">
                              <button onClick={() => setPrescriptionItems(prescriptionItems.filter((_, i) => i !== idx))} className="text-red-500 text-xl leading-none">&times;</button>
                           </div>
                        </div>
                      ))}
                      {prescriptionItems.length === 0 && <p className="text-xs text-slate-400 italic">No medicines added.</p>}
                   </div>
                </div>
              </div>
              
              <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
                 <button onClick={handleFinishConsultation} disabled={processing} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-8 rounded-lg shadow-sm transition">
                   {processing ? 'Saving...' : 'Finish & Share'}
                 </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DoctorRoom;
