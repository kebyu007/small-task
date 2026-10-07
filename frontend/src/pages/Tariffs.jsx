import { useState } from 'react';
import useSWR from 'swr';
import api, { fetcher } from '../utils/api';
import toast from 'react-hot-toast';
import { Percent, Edit2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CustomInput from '../components/CustomInput';
import Skeleton from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import Spinner from '../components/Spinner';

export default function Tariffs() {
  const { data: tariffs, error, isLoading, mutate } = useSWR('/tariffs', fetcher);
  const [editingTariff, setEditingTariff] = useState(null);
  const [newMarkup, setNewMarkup] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleEdit = (tariff) => {
    setEditingTariff(tariff);
    setNewMarkup(tariff.markup_percent);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.put(`/tariffs/${editingTariff.months}`, {
        markup_percent: Number(newMarkup)
      });
      toast.success("Ustama yangilandi!");
      setEditingTariff(null);
      mutate();
    } catch (err) {
      // Handled by global interceptor
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tariflar (Ustama foizi)</h1>
        <p className="text-gray-400 mt-2">Muddatga qarab narxga qo'shiladigan foiz miqdori</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <Skeleton count={1} className="h-24" />
          <Skeleton count={1} className="h-24" />
          <Skeleton count={1} className="h-24" />
        </div>
      ) : error ? (
        <EmptyState message="Ta'riflarni yuklashda xatolik" />
      ) : tariffs?.length === 0 ? (
        <EmptyState message="Hozircha ta'riflar kiritilmagan" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {tariffs.map((t, idx) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
              key={t.months} className="glass-panel p-6 hover:bg-white/5 transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-xl border border-blue-500/20">
                  {t.months}
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Oylik muddat</p>
                  <p className="font-bold text-2xl flex items-center gap-1">{t.markup_percent}<Percent size={18} className="text-yellow-400"/></p>
                </div>
              </div>
              <button 
                onClick={() => handleEdit(t)}
                className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-300 hover:text-white transition-colors"
              >
                <Edit2 size={18}/>
              </button>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {editingTariff && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setEditingTariff(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass-panel w-full max-w-sm p-8 relative z-10 shadow-2xl border-white/10 text-center"
            >
              <button onClick={() => setEditingTariff(null)} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
                <X size={20}/>
              </button>
              
              <div className="w-16 h-16 mx-auto bg-blue-500/10 text-blue-400 rounded-full flex items-center justify-center font-bold text-2xl mb-4">
                {editingTariff.months}
              </div>
              <h2 className="text-xl font-bold mb-6">{editingTariff.months} oylik ustamani tahrirlash</h2>
              
              <form onSubmit={handleSubmit} className="space-y-5 text-left">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">Yangi ustama foizi (%)</label>
                  <CustomInput required type="number" icon={Percent} value={newMarkup} onChange={e => setNewMarkup(e.target.value)} />
                </div>
                
                <button type="submit" disabled={submitting} className="flex justify-center items-center gap-2 w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-medium transition-all mt-4">
                  {submitting ? <><Spinner size={18}/> Saqlanmoqda...</> : 'Saqlash'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
