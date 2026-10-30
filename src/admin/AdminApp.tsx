import React, { useState, useEffect } from 'react';
import {
  Building,
  Inbox,
  Users,
  Settings,
  LogOut,
  ExternalLink,
  Shield,
  Menu,
  X,
} from 'lucide-react';
import { AdminLogin } from './AdminLogin';
import { PropertiesModule } from './PropertiesModule';
import { InquiriesModule } from './InquiriesModule';
import { LeadsModule } from './LeadsModule';
import { SettingsModule } from './SettingsModule';
import { verifyAdminSession, signOutAdmin } from '../lib/supabase';

type AdminTab = 'properties' | 'inquiries' | 'leads' | 'settings';

export default function AdminApp() {
  const [sessionChecked, setSessionChecked] = useState(false);
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [adminRecord, setAdminRecord] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<AdminTab>('properties');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      const auth = await verifyAdminSession();
      if (auth.user && auth.adminUser) {
        setCurrentUser(auth.user);
        setAdminRecord(auth.adminUser);
      } else {
        setCurrentUser(null);
        setAdminRecord(null);
      }
      setSessionChecked(true);
    }
    checkAuth();
  }, []);

  const handleLoginSuccess = (user: any, adminUser: any) => {
    setCurrentUser(user);
    setAdminRecord(adminUser);
  };

  const handleSignOut = async () => {
    await signOutAdmin();
    setCurrentUser(null);
    setAdminRecord(null);
  };

  const handleGoToPublicSite = () => {
    window.location.hash = '#/';
    if (window.location.pathname === '/admin') {
      window.history.pushState(null, '', '/');
    }
    window.location.reload();
  };

  if (!sessionChecked) {
    return (
      <div className="min-h-screen bg-[#0C0D10] text-[#F5F3EF] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-[#C8A35F] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-[#B4B1A8] font-mono">Verifying admin_users authorization...</p>
        </div>
      </div>
    );
  }

  // If not logged in or not authorized, show strictly login screen (no public sign-up)
  if (!currentUser || !adminRecord) {
    return (
      <AdminLogin
        onSuccess={handleLoginSuccess}
        onBackToSite={handleGoToPublicSite}
      />
    );
  }

  const navItems: { id: AdminTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'properties', label: 'Properties Inventory', icon: Building },
    { id: 'inquiries', label: 'Inquiries & Viewings', icon: Inbox },
    { id: 'leads', label: 'Prospective Leads', icon: Users },
    { id: 'settings', label: 'Company Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#0C0D10] text-[#F5F3EF] flex flex-col md:flex-row selection:bg-[#C8A35F]/30 selection:text-[#F5F3EF]">
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[#141519] border-b border-white/10 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#C8A35F]" />
          <span className="font-bold text-sm text-[#F5F3EF]">Addis Luxury Admin</span>
        </div>
        <button
          type="button"
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
          className="p-2 text-[#B4B1A8] hover:text-[#F5F3EF] rounded-lg"
        >
          {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`${
          mobileNavOpen ? 'block' : 'hidden'
        } md:flex flex-col w-full md:w-64 bg-[#141519] border-r border-white/10 shrink-0 md:min-h-screen sticky top-0 z-30`}
      >
        {/* Brand section */}
        <div className="p-6 border-b border-white/10 hidden md:block">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#C8A35F]/10 border border-[#C8A35F]/20 flex items-center justify-center text-[#C8A35F]">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h1 className="font-bold text-sm text-[#F5F3EF] tracking-tight">
                Addis Luxury Admin
              </h1>
              <span className="text-[10px] text-[#B4B1A8] font-mono block">
                Authorized: {adminRecord.role || 'Admin'}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex-1 p-4 space-y-1.5" aria-label="Admin Navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileNavOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all min-h-[44px] ${
                  isActive
                    ? 'bg-[#C8A35F] text-[#0C0D10] shadow-md shadow-[#C8A35F]/20'
                    : 'text-[#B4B1A8] hover:text-[#F5F3EF] hover:bg-white/5'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#0C0D10]' : 'text-[#C8A35F]'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Info & Actions Bottom Section */}
        <div className="p-4 border-t border-white/10 space-y-2 bg-[#0C0D10]/40">
          <div className="px-2 py-1">
            <span className="text-[10px] text-[#B4B1A8]/60 font-mono block uppercase">
              Signed in as
            </span>
            <p className="text-xs text-[#F5F3EF] font-medium truncate">
              {currentUser.email}
            </p>
          </div>

          <button
            type="button"
            onClick={handleGoToPublicSite}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#B4B1A8] hover:text-[#F5F3EF] hover:bg-white/5 rounded-lg transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#C8A35F]" />
            <span>View Public Website</span>
          </button>

          <button
            type="button"
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-950/30 rounded-lg transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {activeTab === 'properties' && <PropertiesModule />}
          {activeTab === 'inquiries' && <InquiriesModule />}
          {activeTab === 'leads' && <LeadsModule />}
          {activeTab === 'settings' && <SettingsModule />}
        </div>
      </main>
    </div>
  );
}
