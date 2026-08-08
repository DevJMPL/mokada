import { User, Bell } from 'lucide-react';

export const Header = () => {
  return (
    <header className="h-[3.25rem] bg-white/70 backdrop-blur-md border-b border-gray-200/50 flex items-center justify-between px-6 z-10 sticky top-0">
      <div className="flex-1">
        {/* Search could go here in the future */}
      </div>
      
      <div className="flex items-center gap-4 text-gray-500">
        <button className="hover:text-[#1D1D1F] transition-colors relative">
          <Bell className="w-[18px] h-[18px]" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        </button>
        
        <div className="h-4 w-px bg-gray-300 mx-2"></div>
        
        <div className="flex items-center gap-2 cursor-pointer hover:text-[#1D1D1F] transition-colors">
          <div className="text-xs text-right hidden md:block mt-0.5">
            <p className="font-medium text-[#1D1D1F]">Admin User</p>
          </div>
          <div className="w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center text-gray-600">
            <User className="w-[14px] h-[14px]" />
          </div>
        </div>
      </div>
    </header>
  );
};
