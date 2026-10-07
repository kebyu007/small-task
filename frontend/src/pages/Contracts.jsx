import { useState } from 'react';
import useSWR from 'swr';
import api, { fetcher } from '../utils/api';
import { formatCurrency, formatDate } from '../utils/formatters';
import toast from 'react-hot-toast';
import { FileText, DollarSign, X, CreditCard, CalendarDays, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CustomInput from '../components/CustomInput';
import Skeleton from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import Spinner from '../components/Spinner';

export default function Contracts() {
  const { data: contracts, error, isLoading, mutate } = useSWR('/contracts', fetcher);
  const [payModal, setPayModal] = useState(null);
  const [payAmount, setPayAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [detailsModal, setDetailsModal] = useState(null);

  const { data: contractDetails, isLoading: detailsLoading } = useSWR(
    detailsModal ? `/contracts/${detailsModal.id}` : null,
    fetcher
  );

  const handlePay = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    const idempotencyKey = crypto.randomUUID();
    
    try {
      await api.post(`/contracts/${payModal.id}/payments`, {
        amount: Number(payAmount),
        idempotency_key: idempotencyKey
      });
      toast.success("To'lov muvaffaqiyatli qabul qilindi!");
      setPayModal(null);
      setPayAmount('');
      mutate();
      if (detailsModal) mutate(`/contracts/${detailsModal.id}`);
    } catch (err) {
      // Handled by interceptor
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Shartnomalar</h1>
        <p className="text-gray-400 mt-2">Barcha rasmiylashtirilgan shartnomalar, qoldiqlar va to'lovlar</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton count={3} className="h-28" />
        </div>
      ) : error ? (
        <EmptyState message="Shartnomalarni yuklashda xatolik" />
      ) : contracts?.length === 0 ? (
        <EmptyState message="Hozircha hech qanday shartnoma yo'q" />
      ) : (
        <div className="space-y-4">
          {contracts.map((c, idx) => (
            <motion.div 
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}
              key={c.id} className="glass-panel p-6 hover:bg-white/5 transition-all group cursor-pointer relative overflow-hidden"
              onClick={() => setDetailsModal(c)}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-500/10 transition-colors"></div>
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                <div className="flex items-center gap-6">
                  <div className={`p-4 rounded-xl ${c.status === 'active' ? 'bg-blue-500/10 text-blue-400' : 'bg-green-500/10 text-green-400'}`}>
                    <FileText size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">{c.customer_name}</h3>
                    <p className="text-sm text-gray-400 flex items-center gap-4">
                      <span>{c.months} oylik muddatga</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.status === 'active' ? 'bg-blue-500/20 text-blue-300' : 'bg-green-500/20 text-green-300'}`}>
                        {c.status.toUpperCase()}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 flex-1 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t border-white/5 md:border-0">
                  <div className="text-left md:text-right">
                    <p className="text-xs text-gray-400 mb-1">Jami Summa</p>
                    <p className="font-bold text-gray-300">{formatCurrency(c.financed_amount)}</p>
                  </div>
                  <div className="text-left md:text-right">
                    <p className="text-xs text-gray-400 mb-1">To'langan</p>
                    <p className="font-bold text-green-400">{formatCurrency(c.total_paid)}</p>
                  </div>
                  <div className="text-left md:text-right">
                    <p className="text-xs text-gray-400 mb-1">Qolgan Qarz</p>
                    <p className="font-bold text-red-400">{formatCurrency(c.remaining_debt)}</p>
                  </div>
                  <div className="text-left md:text-right">
                    <p className="text-xs text-gray-400 mb-1">Keyingi To'lov</p>
                    <p className="font-bold text-yellow-400">{c.status === 'active' && c.next_payment_date ? formatDate(c.next_payment_date) : '-'}</p>
                    {c.status === 'active' && c.next_payment_amount > 0 && <p className="text-xs text-gray-400">{formatCurrency(c.next_payment_amount)}</p>}
                  </div>
                </div>
                
                {c.status === 'active' && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); setPayModal(c); }}
                    className="md:ml-4 bg-white/10 hover:bg-green-500/20 text-white hover:text-green-400 px-6 py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 border border-white/5 hover:border-green-500/30"
                  >
                    <DollarSign size={16}/> To'lov
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Details Modal */}
      <AnimatePresence>
        {detailsModal && (
          <div className="fixed inset-0 z-40 flex items-center justify-end">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setDetailsModal(null)}
            />
            <motion.div 
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="glass-panel w-full max-w-lg h-full relative z-10 rounded-none border-y-0 border-r-0 shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-white/10 flex items-center justify-between bg-black/20">
                <div>
                  <h2 className="text-xl font-bold">Shartnoma Batafsil</h2>
                  <p className="text-sm text-gray-400 font-mono">CON-{detailsModal.id}</p>
                </div>
                <button onClick={() => setDetailsModal(null)} className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors">
                  <X size={20}/>
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* Summary Card */}
                <div className="p-6 bg-gradient-to-br from-blue-900/30 to-purple-900/20 rounded-2xl border border-blue-500/20 relative overflow-hidden">
                  <FileText className="absolute -right-4 -bottom-4 w-32 h-32 text-white/5" />
                  <p className="text-blue-200 text-sm mb-1">Qolgan Qarz</p>
                  <p className="text-3xl font-bold text-red-400 tracking-tight">{formatCurrency(detailsModal.remaining_debt)}</p>
                  <div className="flex justify-between mt-4 text-sm text-blue-200/60 border-t border-white/5 pt-4">
                    <span>Jami qarz: {formatCurrency(detailsModal.financed_amount)}</span>
                    <span>To'langan: {formatCurrency(detailsModal.total_paid)}</span>
                  </div>
                </div>

                {/* Schedule */}
                <div>
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><CalendarDays className="text-blue-400"/> To'lovlar grafigi</h3>
                  {detailsLoading ? (
                    <div className="flex justify-center p-8"><Spinner size={32} /></div>
                  ) : contractDetails ? (
                    <div className="space-y-3">
                      {contractDetails.schedule.map((item, idx) => {
                        const isPaid = item.status === 'paid';
                        const isPartial = item.status === 'partial';
                        const isPending = item.status === 'pending';
                        
                        return (
                          <div key={idx} className={`p-4 rounded-xl border relative flex justify-between items-center transition-colors
                            ${isPaid ? 'bg-green-500/10 border-green-500/20' : isPartial ? 'bg-yellow-500/10 border-yellow-500/20' : 'bg-white/5 border-white/5'}`}
                          >
                            <div className="flex gap-4 items-center">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm
                                ${isPaid ? 'bg-green-500/20 text-green-400' : isPartial ? 'bg-yellow-500/20 text-yellow-400' : 'bg-white/10 text-gray-400'}`}
                              >
                                {item.seq_no}
                              </div>
                              <div>
                                <p className="font-medium">{formatDate(item.due_date)}</p>
                                <p className="text-xs text-gray-400 mt-1">Status: {item.status.toUpperCase()}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className={`font-bold ${isPaid ? 'text-green-400' : isPartial ? 'text-yellow-400' : 'text-white'}`}>
                                {formatCurrency(item.amount)}
                              </p>
                              {isPartial && <p className="text-xs text-red-400 mt-1">Qarz: {formatCurrency(item.amount - item.paid_amount)}</p>}
                              {isPaid && <p className="text-xs text-green-400 mt-1 flex items-center justify-end gap-1"><CheckCircle2 size={12}/> To'langan</p>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Pay Modal */}
      <AnimatePresence>
        {payModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setPayModal(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass-panel w-full max-w-md p-8 relative z-10 shadow-2xl border-white/10"
            >
              <button onClick={() => setPayModal(null)} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
                <X size={20}/>
              </button>
              
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-green-500/20 text-green-400 rounded-lg"><CreditCard size={24}/></div>
                <div>
                  <h2 className="text-xl font-bold">To'lov qabul qilish</h2>
                  <p className="text-sm text-gray-400">{payModal.customer_name}</p>
                </div>
              </div>
              
              <form onSubmit={handlePay} className="space-y-6 text-left">
                <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Jami qarz:</span>
                    <span className="font-bold">{formatCurrency(payModal.remaining_debt)}</span>
                  </div>
                  {payModal.next_payment_amount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Navbatdagi to'lov:</span>
                      <span className="font-bold text-yellow-400">{formatCurrency(payModal.next_payment_amount)}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400 flex justify-between">
                    To'lanayotgan summa (UZS)
                  </label>
                  <CustomInput 
                    required 
                    type="number" 
                    icon={DollarSign} 
                    placeholder="Masalan: 500000" 
                    value={payAmount} 
                    onChange={e => setPayAmount(e.target.value)} 
                    className="text-lg font-bold text-green-400"
                  />
                </div>
                
                <button type="submit" disabled={submitting} className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white py-4 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_30px_rgba(34,197,94,0.5)]">
                  {submitting ? <><Spinner size={20}/> Kutib turing...</> : 'Tassdiqlash va To\'lash'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
