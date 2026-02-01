
import React from 'react';
import { Home, Scan, Clock, BarChart3, User, MessageSquare } from 'lucide-react';
import { ViewState } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeView: ViewState;
  onViewChange: (view: ViewState) => void;
  onScanClick: () => void;
  isDarkMode: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, activeView, onViewChange, onScanClick, isDarkMode }) => {
  const navItems: { view: ViewState | 'SCAN'; label: string; icon: any }[] = [
    { view: 'DASHBOARD', label: 'Home', icon: Home },
    { view: 'HISTORY', label: 'History', icon: Clock },
    { view: 'SCAN', label: 'Scan', icon: Scan },
    { view: 'ANALYTICS', label: 'Stats', icon: BarChart3 },
    { view: 'FORUM_CHAT', label: 'Forum', icon: MessageSquare },
    { view: 'ACCOUNT', label: 'Account', icon: User },
  ];

  const activeIndex = navItems.findIndex(item => item.view === activeView || (item.view === 'SCAN' && activeView === 'SCAN'));

  return (
    <div className={`flex flex-col h-screen w-full relative overflow-hidden transition-colors duration-300 ${isDarkMode ? 'bg-slate-950' : 'bg-[#f4f7f9]'}`}>

      {/* Responsive Wrapper for Tablet/Desktop */}
      <div className="flex-1 flex flex-col w-full max-w-4xl mx-auto relative overflow-hidden">

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto no-scrollbar pb-24 px-4 md:px-8">
          {children}
        </main>

        {/* Fintech Bottom Navigation */}
        <div className={`absolute bottom-0 left-0 right-0 h-24 px-4 pb-safe z-50 transition-colors duration-300 rounded-t-[2.5rem] border-t ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-[0_-10px_30px_rgba(0,0,0,0.03)]'}`}>
          <nav className="relative flex justify-around items-center h-20 w-full px-2">

            {/* Animated Active Indicator */}
            <div
              className="absolute h-14 bg-[#10b981] rounded-2xl transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] shadow-lg shadow-emerald-500/20"
              style={{
                width: `${100 / navItems.length}%`,
                left: `${(activeIndex * 100) / navItems.length}%`,
                transform: 'scale(0.85)',
              }}
            />

            {navItems.map((item, idx) => {
              const Icon = item.icon;
              const isActive = idx === activeIndex;

              return (
                <button
                  key={item.view}
                  onClick={() => item.view === 'SCAN' ? onScanClick() : onViewChange(item.view as ViewState)}
                  className={`relative z-10 flex flex-col items-center justify-center flex-1 h-full transition-all duration-300 ${isActive ? 'text-white' : isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}
                >
                  <Icon size={isActive ? 20 : 22} strokeWidth={isActive ? 2.5 : 2} />
                  <span className={`text-[9px] font-black uppercase tracking-tighter mt-1 transition-all ${isActive ? 'opacity-100 translate-y-0.5' : 'opacity-60'}`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Layout;
