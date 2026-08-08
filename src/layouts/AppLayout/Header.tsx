import { User, Bell } from 'lucide-react';

export const Header = () => {
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm z-10">
      <div className="flex-1">
        {/* Search could go here in the future */}
      </div>
      
      <div className="flex items-center gap-4 text-slate-500">
        <button className="hover:bg-slate-100 p-2 rounded-full transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        </button>
        
        <div className="h-8 w-px bg-slate-200 mx-2"></div>
        
        <div className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 px-2 py-1 rounded-md transition-colors">
          <div className="text-sm text-right hidden md:block">
            <p className="font-medium text-slate-700">Admin User</p>
            <p className="text-xs text-slate-500">Administrador</p>
          </div>
          <div className="w-9 h-9 bg-slate-200 rounded-full flex items-center justify-center text-slate-600">
            <User className="w-5 h-5" />
          </div>
        </div>
      </div>
    </header>
  );
};
