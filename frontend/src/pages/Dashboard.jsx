import useSWR from 'swr';
import { fetcher } from '../utils/api';
import { formatCurrency, formatDate } from '../utils/formatters';
import { AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import Skeleton from '../components/Skeleton';
import EmptyState from '../components/EmptyState';

export default function Dashboard() {
  const { data: overdue, error, isLoading } = useSWR('/reports/overdue', fetcher);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-400 mt-2">Tizimdagi umumiy holat va qarzdorlar ro'yxati</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="glass-panel p-6 flex flex-col gap-2 relative overflow-hidden group">
          <div className="absolute inset-0 bg-blue-500/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
          <h3 className="text-gray-400 font-medium">Qarzdorlar soni</h3>
          <p className="text-4xl font-bold">{isLoading ? '...' : (overdue?.length || 0)}</p>
        </div>
      </div>

      <div className="glass-panel p-6">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <AlertCircle className="text-red-500" />
          Kechikkan to'lovlar
        </h2>
        
        {isLoading ? (
          <Skeleton count={3} className="h-12" />
        ) : error ? (
          <EmptyState message="Ma'lumotni yuklashda xatolik yuz berdi" />
        ) : overdue?.length === 0 ? (
          <EmptyState message="Hozircha qarzdorlar yo'q 🎉" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="pb-3 text-gray-400 font-medium">Mijoz ID</th>
                  <th className="pb-3 text-gray-400 font-medium">Shartnoma</th>
                  <th className="pb-3 text-gray-400 font-medium">Muddat</th>
                  <th className="pb-3 text-gray-400 font-medium text-right">Summa</th>
                </tr>
              </thead>
              <tbody>
                {overdue.map((item, idx) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    key={item.id} 
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="py-4">#{item.customer_id}</td>
                    <td className="py-4">CON-{item.contract_id}</td>
                    <td className="py-4 text-red-400">{formatDate(item.due_date)}</td>
                    <td className="py-4 text-right font-bold text-red-500">{formatCurrency(item.amount)}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
