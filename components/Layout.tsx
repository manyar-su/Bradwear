
import React from 'react';
import { Home, Scan, Clock, BarChart3, User } from 'lucide-react';
import { ViewState } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeView: ViewState;
  onViewChange: (view: ViewState) => void;
  onScanClick: () => void;
  isDarkMode: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, activeView, onViewChange, onScanClick, isDarkMode }) => {
  return (
    <div className={`flex flex-col h-screen w-full relative overflow-hidden transition-colors duration-300 ${isDarkMode ? 'bg-slate-950' : 'bg-[#f4f7f9]'}`}>
      
      {/* Responsive Wrapper for Tablet/Desktop */}
      <div className="flex-1 flex flex-col w-full max-w-4xl mx-auto relative overflow-hidden">
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto no-scrollbar pb-24 px-4 md:px-8">
          {children}
        </main>

        {/* Fintech Bottom Navigation - Expanded for tablets */}
        <nav className={`absolute bottom-0 left-0 right-0 flex justify-around items-center h-20 px-4 md:px-12 pb-safe z-50 transition-colors duration-300 rounded-t-[2.5rem] md:rounded-none ${isDarkMode ? 'bg-slate-900 border-t border-slate-800' : 'bg-white border-t border-slate-100 shadow-[0_-10px_30px_rgba(0,0,0,0.03)]'}`}>
          <NavItem 
            icon={<Home size={24} />} 
            label="Home" 
            active={activeView === 'DASHBOARD'} 
            onClick={() => onViewChange('DASHBOARD')} 
            isDarkMode={isDarkMode}
          />
          <NavItem 
            icon={<Clock size={24} />} 
            label="History" 
            active={activeView === 'HISTORY'} 
            onClick={() => onViewChange('HISTORY')} 
            isDarkMode={isDarkMode}
          />
          
          {/* Floating Center Button */}
          <div className="relative -top-6 flex flex-col items-center">
            <button 
              onClick={onScanClick}
              className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-2xl transition-all active:scale-90 bg-[#10b981] text-white hover:brightness-110`}
            >
              <Scan size={28} strokeWidth={2.5} />
            </button>
          </div>

          <NavItem 
            icon={<BarChart3 size={24} />} 
            label="Stats" 
            active={activeView === 'ANALYTICS'} 
            onClick={() => onViewChange('ANALYTICS')} 
            isDarkMode={isDarkMode}
          />
          <NavItem 
            icon={<User size={24} />} 
            label="Account" 
            active={activeView === 'ACCOUNT'} 
            onClick={() => onViewChange('ACCOUNT')} 
            isDarkMode={isDarkMode}
          />
        </nav>
      </div>
    </div>
  );
};

const NavItem = ({ icon, label, active, onClick, isDarkMode }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void, isDarkMode: boolean }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center justify-center space-y-1 transition-all min-w-[60px] ${active ? 'text-[#10b981]' : isDarkMode ? 'text-slate-500' : 'text-[#94a3b8]'} hover:text-[#10b981]`}
  >
    {icon}
    <span className={`text-[11px] font-bold tracking-tight ${active ? 'font-black' : ''}`}>{label}</span>
  </button>
);

export default Layout;
