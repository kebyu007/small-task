import { forwardRef } from 'react';

const CustomInput = forwardRef(({ icon: Icon, className = '', ...props }, ref) => {
  return (
    <div className="relative w-full">
      {Icon && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
          <Icon size={16} />
        </div>
      )}
      <input
        ref={ref}
        className={`w-full glass-input min-h-[46px] transition-all hover:bg-white/5 focus:bg-white/10 ${Icon ? 'pl-10' : 'px-4'} py-2 ${className}`}
        {...props}
      />
    </div>
  );
});

CustomInput.displayName = 'CustomInput';

export default CustomInput;
