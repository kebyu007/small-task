import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FilePlus, Users, Package, FileText, Percent, Command } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import CreateContract from './pages/CreateContract';
import CreateCustomer from './pages/CreateCustomer';
import Products from './pages/Products';
import Tariffs from './pages/Tariffs';
import Customers from './pages/Customers';
import Contracts from './pages/Contracts';

function Sidebar() {
  const location = useLocation();
  const links = [
    { to: "/", icon: <LayoutDashboard size={20} />, label: "Dashboard" },
    { to: "/contracts", icon: <FileText size={20} />, label: "Shartnomalar" },
    { to: "/customers", icon: <Users size={20} />, label: "Mijozlar Bazasi" },
    { to: "/products", icon: <Package size={20} />, label: "Mahsulotlar" },
    { to: "/tariffs", icon: <Percent size={20} />, label: "Tariflar" },
    { to: "/create-customer", icon: <Users size={20} />, label: "Yangi Mijoz", isAction: true },
    { to: "/create-contract", icon: <FilePlus size={20} />, label: "Shartnoma ochish", isAction: true },
  ];

  return (
    <div className="w-72 border-r border-white/10 glass-panel h-screen p-6 flex flex-col gap-8 rounded-none z-50">
      <div className="flex items-center gap-3 px-2">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-400 rounded-xl flex items-center justify-center text-white font-bold shadow-[0_0_15px_rgba(37,99,235,0.5)]">
          <Command size={20} />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">NASIYA.APP</h1>
          <p className="text-xs text-blue-400 font-medium">Premium FinTech</p>
        </div>
      </div>
      
      <nav className="flex flex-col gap-2 flex-1">
        {links.map((link) => {
          const isActive = location.pathname === link.to;
          if (link.isAction) return null;
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium ${
                isActive 
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-[inset_0_0_20px_rgba(37,99,235,0.1)]' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              {link.icon}
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex flex-col gap-3 pt-6 border-t border-white/10">
        {links.filter(l => l.isAction).map(link => (
          <Link
            key={link.to}
            to={link.to}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all duration-300 font-medium ${
              link.to === '/create-contract' 
                ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] hover:shadow-[0_0_25px_rgba(37,99,235,0.6)]' 
                : 'glass-panel border-white/10 text-gray-300 hover:text-white hover:bg-white/5 hover:border-white/20'
            }`}
          >
            {link.icon}
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="flex h-screen bg-[#020617] text-gray-100 overflow-hidden font-sans selection:bg-blue-500/30">
        <Sidebar />
        <main className="flex-1 p-10 overflow-y-auto h-screen relative">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/2 z-0"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none translate-y-1/2 -translate-x-1/2 z-0"></div>
          
          <div className="relative z-10 h-full">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/contracts" element={<Contracts />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/products" element={<Products />} />
              <Route path="/tariffs" element={<Tariffs />} />
              <Route path="/create-customer" element={<CreateCustomer />} />
              <Route path="/create-contract" element={<CreateContract />} />
            </Routes>
          </div>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
