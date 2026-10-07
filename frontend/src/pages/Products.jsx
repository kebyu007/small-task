import { useState } from 'react';
import useSWR from 'swr';
import api, { fetcher } from '../utils/api';
import { formatCurrency } from '../utils/formatters';
import toast from 'react-hot-toast';
import { Package, Plus, DollarSign, Archive, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CustomInput from '../components/CustomInput';
import Skeleton from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import Spinner from '../components/Spinner';

export default function Products() {
  const { data: products, error, isLoading, mutate } = useSWR('/products', fetcher);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', price: '', stock_qty: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/products', {
        name: form.name,
        price: Number(form.price),
        stock_qty: Number(form.stock_qty)
      });
      toast.success("Maxsulot saqlandi!");
      setIsModalOpen(false);
      setForm({ name: '', price: '', stock_qty: '' });
      mutate(); // Re-fetch the data via SWR
    } catch (err) {
      // Error is handled by global interceptor
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mahsulotlar</h1>
          <p className="text-gray-400 mt-2">Ombordagi tovarlar va ularning qoldig'i</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(37,99,235,0.3)]"
        >
          <Plus size={18}/> Yangi qo'shish
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <Skeleton count={1} className="h-40" />
          <Skeleton count={1} className="h-40" />
          <Skeleton count={1} className="h-40" />
        </div>
      ) : error ? (
        <EmptyState message="Mahsulotlarni yuklashda xatolik" />
      ) : products?.length === 0 ? (
        <EmptyState message="Omborda mahsulotlar yo'q" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {products.map((p, idx) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
              key={p.id} className="glass-panel p-6 hover:bg-white/5 transition-colors relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-500/10 transition-colors"></div>
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="p-3 bg-white/5 rounded-lg text-blue-400"><Package size={24}/></div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold ${p.stock_qty > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  Qoldiq: {p.stock_qty} ta
                </div>
              </div>
              <h3 className="text-xl font-bold mb-1 relative z-10">{p.name}</h3>
              <p className="text-gray-400 font-medium relative z-10">{formatCurrency(p.price)}</p>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass-panel w-full max-w-md p-8 relative z-10 shadow-2xl border-white/10"
            >
              <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
                <X size={20}/>
              </button>
              <h2 className="text-2xl font-bold mb-6">Yangi Mahsulot</h2>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">Nomi</label>
                  <CustomInput required icon={Package} placeholder="Nomi" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">Narxi (UZS)</label>
                  <CustomInput required type="number" icon={DollarSign} placeholder="Narxi" value={form.price} onChange={e => setForm({...form, price: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">Soni (Omborda)</label>
                  <CustomInput required type="number" icon={Archive} placeholder="Soni" value={form.stock_qty} onChange={e => setForm({...form, stock_qty: e.target.value})} />
                </div>
                
                <button type="submit" disabled={submitting} className="flex justify-center items-center gap-2 w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-medium transition-all mt-4">
                  {submitting ? <><Spinner size={18} /> Saqlanmoqda...</> : 'Saqlash'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
