import { useState } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { UserPlus, User, Phone, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';
import CustomInput from '../components/CustomInput';
import Spinner from '../components/Spinner';

export default function CreateCustomer() {
  const [form, setForm] = useState({
    full_name: '',
    phone: '+998',
    credit_limit: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const payload = {
        full_name: form.full_name,
        phone: form.phone.replace(/\s+/g, ''),
        credit_limit: Number(form.credit_limit)
      };
      
      await api.post('/customers', payload);
      toast.success("Yangi mijoz muvaffaqiyatli qo'shildi!");
      setForm({ full_name: '', phone: '+998', credit_limit: '' });
    } catch (error) {
      // Handled by global interceptor
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Yangi Mijoz</h1>
        <p className="text-gray-400 mt-2">Tizimga yangi xaridor qo'shish va limit belgilash</p>
      </div>

      <motion.form 
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-8 space-y-6 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

        <div className="space-y-3 relative z-10">
          <label className="text-sm font-medium text-gray-400">F.I.O (To'liq ism)</label>
          <CustomInput 
            type="text"
            required
            icon={User}
            placeholder="Masalan: Sardor Rahimov"
            value={form.full_name}
            onChange={e => setForm({...form, full_name: e.target.value})}
          />
        </div>

        <div className="space-y-3 relative z-10">
          <label className="text-sm font-medium text-gray-400">Telefon raqam</label>
          <CustomInput 
            type="text"
            required
            icon={Phone}
            placeholder="+998901234567"
            className="font-mono tracking-wider"
            value={form.phone}
            onChange={e => setForm({...form, phone: e.target.value})}
          />
        </div>

        <div className="space-y-3 relative z-10">
          <label className="text-sm font-medium text-gray-400">Kredit Limiti (UZS)</label>
          <CustomInput 
            type="number"
            required
            icon={CreditCard}
            placeholder="10000000"
            value={form.credit_limit}
            onChange={e => setForm({...form, credit_limit: e.target.value})}
          />
        </div>

        <div className="pt-6 flex justify-end relative z-10">
          <button 
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white px-8 py-3 rounded-xl font-medium transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)]"
          >
            {loading ? <><Spinner size={18}/> Saqlanmoqda...</> : <><UserPlus size={18}/> Mijozni Saqlash</>}
          </button>
        </div>
      </motion.form>
    </div>
  );
}
