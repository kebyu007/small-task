import { useState } from 'react';
import useSWR from 'swr';
import { fetcher } from '../utils/api';
import { formatCurrency, formatPhone, formatDate } from '../utils/formatters';
import { Users, Bell, X, CreditCard, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Skeleton from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import Spinner from '../components/Spinner';

export default function Customers() {
  const { data: customers, error, isLoading } = useSWR('/customers', fetcher);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // SWR conditionally fetches notifications only when selectedCustomer is truthy
  const { data: notifications, isLoading: isLoadingNotifs } = useSWR(
    selectedCustomer ? `/customers/${selectedCustomer.id}/notifications` : null,
    fetcher
  );

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mijozlar Bazasi</h1>
        <p className="text-gray-400 mt-2">Barcha ro'yxatdan o'tgan mijozlar va ularning tarixi</p>
      </div>

      {isLoading ? (
        <Skeleton count={3} className="h-20" />
      ) : error ? (
        <EmptyState message="Mijozlarni yuklashda xatolik" />
      ) : customers?.length === 0 ? (
        <EmptyState message="Hozircha mijozlar mavjud emas" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {customers.map((c, idx) => (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.05 }}
              key={c.id} 
              onClick={() => setSelectedCustomer(c)}
              className="glass-panel p-6 cursor-pointer hover:bg-white/5 hover:border-blue-500/30 transition-all group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-500/20 transition-all"></div>
              
              <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center font-bold text-lg text-blue-400">
                  {c.full_name.charAt(0)}
                </div>
                <ChevronRight size={20} className="text-gray-500 group-hover:text-white transition-colors" />
              </div>
              
              <h3 className="font-bold text-lg mb-1 relative z-10">{c.full_name}</h3>
              <p className="text-sm text-gray-400 mb-4 font-mono relative z-10">{formatPhone(c.phone)}</p>
              
              <div className="pt-4 border-t border-white/5 space-y-2 relative z-10">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">Umumiy Limit</span>
                  <span className="font-bold text-gray-300 flex items-center gap-1"><CreditCard size={14}/> {formatCurrency(c.credit_limit)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">Bo'sh Limit</span>
                  <span className="font-bold text-blue-400 flex items-center gap-1"><CreditCard size={14}/> {formatCurrency(c.free_limit)}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {selectedCustomer && (
          <div className="fixed inset-0 z-50 flex items-center justify-end">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setSelectedCustomer(null)}
            />
            <motion.div 
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="glass-panel w-full max-w-md h-full relative z-10 rounded-none border-y-0 border-r-0 shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-white/10 flex items-center justify-between bg-black/20">
                <div>
                  <h2 className="text-xl font-bold">{selectedCustomer.full_name}</h2>
                  <p className="text-sm text-gray-400 font-mono">{formatPhone(selectedCustomer.phone)}</p>
                </div>
                <button onClick={() => setSelectedCustomer(null)} className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors">
                  <X size={20}/>
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6">
                <div className="mb-8 p-6 bg-gradient-to-br from-blue-900/30 to-purple-900/20 rounded-2xl border border-blue-500/20 relative overflow-hidden">
                  <CreditCard className="absolute -right-4 -bottom-4 w-32 h-32 text-white/5" />
                  <p className="text-blue-200 text-sm mb-1">Mavjud Bo'sh Limit</p>
                  <p className="text-3xl font-bold text-white tracking-tight">{formatCurrency(selectedCustomer.free_limit)}</p>
                  <p className="text-xs text-blue-200/50 mt-2">Umumiy limit: {formatCurrency(selectedCustomer.credit_limit)}</p>
                </div>

                <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Bell className="text-yellow-400"/> Xabarnomalar tarixi</h3>
                
                {isLoadingNotifs ? (
                  <div className="flex justify-center p-8"><Spinner size={32} /></div>
                ) : (
                  <div className="space-y-4">
                    {!notifications || notifications.length === 0 ? (
                      <p className="text-center text-gray-500 py-8">Hozircha xabarnomalar yo'q</p>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} className="p-4 bg-white/5 rounded-xl border border-white/5 relative">
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-l-xl"></div>
                          <p className="text-sm text-gray-400 mb-2">{formatDate(n.created_at)}</p>
                          <pre className="text-sm whitespace-pre-wrap font-sans text-gray-200">{n.text}</pre>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
