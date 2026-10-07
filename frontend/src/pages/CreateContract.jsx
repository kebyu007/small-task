import { useState } from 'react';
import useSWR from 'swr';
import api, { fetcher } from '../utils/api';
import toast from 'react-hot-toast';
import { Calculator, CheckCircle2, Package, User, Calendar, DollarSign } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CustomSelect from '../components/CustomSelect';
import CustomInput from '../components/CustomInput';
import Spinner from '../components/Spinner';

export default function CreateContract() {
  const { data: rawCustomers } = useSWR('/customers', fetcher);
  const { data: rawProducts } = useSWR('/products', fetcher);
  const { data: rawTariffs } = useSWR('/tariffs', fetcher);

  const customers = rawCustomers ? rawCustomers.map(c => ({ value: c.id, label: `${c.full_name} (Limit: ${Number(c.credit_limit).toLocaleString()})` })) : [];
  const products = rawProducts ? rawProducts.map(p => ({ value: p.id, label: `${p.name} - ${Number(p.price).toLocaleString()} UZS` })) : [];
  const tariffs = rawTariffs || [];
  
  const [form, setForm] = useState({
    customer_id: '',
    product_id: '',
    months: 6,
    down_payment: 0
  });

  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const handleCalculate = async () => {
    if (!form.customer_id || !form.product_id) {
      return toast.error("Mijoz va mahsulotni tanlang");
    }
    
    setLoading(true);
    try {
      const payload = {
        customer_id: Number(form.customer_id),
        items: [{ product_id: Number(form.product_id), qty: 1 }],
        months: Number(form.months),
        down_payment: Number(form.down_payment)
      };
      
      const res = await api.post('/contracts/calculate', payload);
      setSchedule(res.data.data);
      setStep(2);
      toast.success("Grafik hisoblandi!");
    } catch (error) {
      // Handled by global interceptor
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const payload = {
        customer_id: Number(form.customer_id),
        items: [{ product_id: Number(form.product_id), qty: 1 }],
        months: Number(form.months),
        down_payment: Number(form.down_payment)
      };
      
      await api.post('/contracts', payload);
      setStep(3);
      toast.success("Shartnoma muvaffaqiyatli tuzildi!");
    } catch (error) {
      // Handled by global interceptor
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Yangi Shartnoma</h1>
          <p className="text-gray-400 mt-2">Nasiya savdo shartnomasini rasmiylashtirish wizardi</p>
        </div>
        <div className="flex gap-2">
          {[1, 2, 3].map(i => (
            <div key={i} className={`h-2 w-16 rounded-full transition-colors ${step >= i ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'bg-white/10'}`}></div>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div 
            key="step1"
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
            className="glass-panel p-8 space-y-8"
          >
            <div className="grid grid-cols-2 gap-8 relative z-50">
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-400 flex items-center gap-2"><User size={16}/> Mijozni tanlang</label>
                <CustomSelect 
                  options={customers} 
                  value={form.customer_id} 
                  onChange={v => setForm({...form, customer_id: v})} 
                  icon={User}
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-400 flex items-center gap-2"><Package size={16}/> Mahsulot</label>
                <CustomSelect 
                  options={products} 
                  value={form.product_id} 
                  onChange={v => setForm({...form, product_id: v})} 
                  icon={Package}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-8 relative z-40">
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-400 flex items-center gap-2"><Calendar size={16}/> Tarif (Oylar)</label>
                <div className="flex gap-3">
                  {tariffs.map(t => (
                    <button
                      key={t.months}
                      onClick={() => setForm({...form, months: t.months})}
                      className={`flex-1 py-3 rounded-xl transition-all border ${
                        form.months === t.months 
                        ? 'bg-blue-500/20 border-blue-500 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)]' 
                        : 'glass-panel border-transparent hover:bg-white/5 hover:border-white/10'
                      }`}
                    >
                      {t.months} oy
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-400 flex items-center gap-2"><DollarSign size={16}/> Boshlang'ich to'lov (UZS)</label>
                <CustomInput 
                  type="number"
                  icon={DollarSign}
                  value={form.down_payment}
                  onChange={e => setForm({...form, down_payment: e.target.value})}
                />
              </div>
            </div>

            <div className="pt-6 flex justify-end">
              <button 
                onClick={handleCalculate}
                disabled={loading}
                className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white px-8 py-3 rounded-xl font-medium transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)]"
              >
                {loading ? <><Spinner size={18}/> Hisoblanmoqda...</> : <><Calculator size={18}/> Grafikni Hisoblash</>}
              </button>
            </div>
          </motion.div>
        )}

        {step === 2 && schedule && (
          <motion.div 
            key="step2"
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            <div className="glass-panel p-8 bg-gradient-to-br from-blue-900/20 to-purple-900/10 border-blue-500/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
              <h2 className="text-2xl font-bold mb-6">Shartnoma xulosasi</h2>
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Umumiy summa</p>
                  <p className="text-3xl font-bold tracking-tight">{Number(schedule.total_price).toLocaleString()} <span className="text-lg text-gray-500 font-normal">UZS</span></p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Tarif ustamasi</p>
                  <p className="text-3xl font-bold text-yellow-400 tracking-tight">{schedule.markup_percent}%</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Oylik to'lov</p>
                  <p className="text-3xl font-bold text-green-400 tracking-tight">~{Number(schedule.schedule[0].amount).toLocaleString()} <span className="text-lg text-green-600 font-normal">UZS</span></p>
                </div>
              </div>
            </div>

            <div className="glass-panel p-8">
              <h3 className="font-bold text-xl mb-6 flex items-center gap-2"><Calendar className="text-blue-400" /> To'lovlar grafigi</h3>
              <div className="space-y-3">
                {schedule.schedule.map((item, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    key={idx} 
                    className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-colors group"
                  >
                    <div className="flex gap-4 items-center">
                      <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-sm group-hover:bg-blue-500/20 transition-colors">
                        {item.seq_no}
                      </div>
                      <span className="font-medium text-lg">{new Date(item.due_date).toLocaleDateString()}</span>
                    </div>
                    <span className="font-bold text-lg">{Number(item.amount).toLocaleString()} UZS</span>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button 
                onClick={() => setStep(1)}
                className="px-8 py-3 rounded-xl font-medium border border-white/10 hover:bg-white/5 transition-all text-gray-300 hover:text-white"
              >
                Orqaga qaytish
              </button>
              <button 
                onClick={handleConfirm}
                disabled={loading}
                className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_30px_rgba(34,197,94,0.5)]"
              >
                {loading ? <><Spinner size={20}/> Yaratilmoqda...</> : <><CheckCircle2 size={20} /> Tasdiqlash va Shartnoma tuzish</>}
              </button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div 
            key="step3"
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="glass-panel p-16 flex flex-col items-center justify-center text-center space-y-6 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-green-500/5 pointer-events-none"></div>
            <motion.div 
              initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.5 }}
              className="w-24 h-24 bg-gradient-to-br from-green-500 to-green-400 text-white rounded-full flex items-center justify-center mb-4 shadow-[0_0_40px_rgba(34,197,94,0.4)]"
            >
              <CheckCircle2 size={48} />
            </motion.div>
            <h2 className="text-4xl font-bold text-white tracking-tight">Tabriklaymiz!</h2>
            <p className="text-gray-400 max-w-md text-lg">Shartnoma muvaffaqiyatli rasmiylashtirildi va tizimga saqlandi.</p>
            <button 
              onClick={() => { setForm({...form, customer_id:'', product_id:'', down_payment: 0}); setStep(1); }}
              className="mt-8 px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl font-medium transition-all text-white shadow-lg"
            >
              Yangi shartnoma ochish
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
