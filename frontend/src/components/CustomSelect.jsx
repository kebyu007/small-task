import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';

export default function CustomSelect({ options, value, onChange, placeholder = "Tanlang...", icon: Icon }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full glass-input flex items-center justify-between min-h-[46px] px-4 py-2 hover:bg-white/5 transition-all text-left"
      >
        <div className="flex items-center gap-2 overflow-hidden">
          {Icon && <Icon size={16} className="text-gray-400 shrink-0" />}
          <span className={`truncate ${!selectedOption ? 'text-gray-400' : 'text-white'}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDown 
          size={16} 
          className={`text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full mt-2 glass-panel border border-white/10 bg-[#0f172a]/90 backdrop-blur-xl max-h-60 overflow-y-auto shadow-2xl py-2 rounded-xl"
          >
            {options.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-400 text-center">Hech narsa topilmadi</div>
            ) : (
              options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 text-sm flex items-center justify-between transition-colors
                    ${value === option.value ? 'bg-blue-500/20 text-blue-400 font-medium' : 'text-gray-300 hover:bg-white/10 hover:text-white'}
                  `}
                >
                  <span className="truncate pr-4">{option.label}</span>
                  {value === option.value && <Check size={16} className="shrink-0" />}
                </button>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
