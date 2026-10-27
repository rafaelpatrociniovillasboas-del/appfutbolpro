import { useState, useEffect } from 'react';
import { ALL_DRILLS } from './data';
import { Drill } from './types';
import { Loader2 } from 'lucide-react';
import { fetchDrillsFromFirestore, syncDrillsToFirestore, auth } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { Login } from './components/Login';
import { enrichDynamicDrill } from './lib/drillGenerator';
import { ToastProvider } from './components/Toast';
import { pullUserDataFromCloud, pushUserDataToCloud, isPullingFromCloud, subscribeToUserData } from './lib/cloudSync';

import { Dashboard } from './components/Dashboard';
import { DrillLibrary } from './components/DrillLibrary';
import { BonusView } from './components/BonusView';
import { PlatformLayout, ModuleId } from './components/PlatformLayout';
import { DashboardExecutivo } from './components/DashboardExecutivo';
import { IAExecutiva } from './components/IAExecutiva';
import { CRMModule } from './components/CRMModule';
import { PlannerModule } from './components/PlannerModule';
import { FinanceModule } from './components/FinanceModule';
import { BuilderModule } from './components/BuilderModule';
import { BillingModule } from './components/BillingModule';
import { LeadsModule } from './components/LeadsModule';
import { CommunicationModule } from './components/CommunicationModule';
import { MarketplaceModule } from './components/MarketplaceModule';
import { PersonalModule } from './components/PersonalModule';
import { InstallAppModule } from './components/InstallAppModule';
import { ReportsModule } from './components/ReportsModule';
import { TutorialModule } from './components/TutorialModule';

// Hook localStorage globally to trace changes and sync
if (typeof window !== 'undefined' && !(window as any)._localStorageHooked) {
  (window as any)._localStorageHooked = true;
  const originalSetItem = localStorage.setItem.bind(localStorage);
  
  let syncTimeout: any;
  const flushSync = () => {
    if (isPullingFromCloud) return;
    let uid = auth.currentUser?.uid;
    let email = auth.currentUser?.email;
    if (!uid && typeof window !== 'undefined') {
      try {
        const guestObj = localStorage.getItem('drillforge_guest_user');
        if (guestObj) {
          const parsed = JSON.parse(guestObj);
          uid = parsed?.uid;
          email = parsed?.email;
        }
      } catch (e) {}
    }
    if (uid) {
      pushUserDataToCloud(uid, email || undefined);
    }
  };

  localStorage.setItem = function(key, value) {
    originalSetItem(key, value);
    if (isPullingFromCloud || key === 'drillforge_guest_user' || key === 'drillforge_user_role') return;
    
    // Fast debounce push to cloud
    clearTimeout(syncTimeout);
    syncTimeout = setTimeout(flushSync, 600);
  };

  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flushSync();
  });
  window.addEventListener('beforeunload', () => {
    flushSync();
  });
}

function GenericModuleView({ title, description }: { title: string, description: string }) {
  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto flex flex-col items-center justify-center h-full text-center">
        <div className="w-16 h-16 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center mb-6">
            <span className="text-2xl">🚧</span>
        </div>
        <h1 className="text-3xl font-display font-bold text-white mb-3">{title}</h1>
        <p className="text-zinc-500 max-w-md">{description}</p>
        <p className="text-emerald-400 font-bold uppercase tracking-widest text-xs mt-8">Activándose en tu cuenta</p>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [view, setView] = useState<ModuleId | string>('dashboard');
  
  const [drills, setDrills] = useState<Drill[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // User Role control (admin = dono, teacher = professor)
  const [userRole, setUserRole] = useState<'admin' | 'teacher'>(() => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('drillforge_guest_user');
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          if (parsed && parsed.role === 'teacher') return 'teacher';
        } catch (e) {}
      }
      return (localStorage.getItem('drillforge_user_role') as 'admin' | 'teacher') || 'admin';
    }
    return 'admin';
  });

  const handleRoleChange = (role: 'admin' | 'teacher') => {
    setUserRole(role);
    if (typeof window !== 'undefined') {
      localStorage.setItem('drillforge_user_role', role);
    }
    // If the user was in an admin-only view, kick them back to dashboard
    if (role === 'teacher' && ['finance', 'billing', 'leads', 'marketplace', 'personal', 'teachers'].includes(view)) {
      setView('dashboard');
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Backup session to persist login permanently even under strict iframe cookie/IndexedDB blocking rules
        if (typeof window !== 'undefined') {
          const userSession = {
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL,
            isGoogle: true
          };
          localStorage.setItem('drillforge_guest_user', JSON.stringify(userSession));
        }
        
        // Pull and subscribe to real-time Cloud data before presenting dashboard
        try {
          await pullUserDataFromCloud(currentUser.uid, currentUser.email || undefined);
        } catch (e) {}
        subscribeToUserData(currentUser.uid, currentUser.email || undefined);
        
        setUser(currentUser);
        setCheckingAuth(false);
      } else {
        if (typeof window !== 'undefined') {
          const saved = localStorage.getItem('drillforge_guest_user');
          if (saved) {
            try {
              const parsed = JSON.parse(saved);
              if (parsed && parsed.role === 'teacher') {
                setUserRole('teacher');
              }
              if (parsed && parsed.uid) {
                try {
                  await pullUserDataFromCloud(parsed.uid, parsed.email || undefined);
                } catch (e) {}
                subscribeToUserData(parsed.uid, parsed.email || undefined);
              }
              setUser(parsed);
            } catch (e) {
              setUser(null);
            }
          } else {
            setUser(null);
          }
        } else {
          setUser(null);
        }
        setCheckingAuth(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Live real-time Cloud Sync listener
  useEffect(() => {
    if (user && user.uid && user.uid !== 'guest_trainer_99') {
      const unsub = subscribeToUserData(user.uid, user.email || undefined);
      
      const autoSync = () => {
        pullUserDataFromCloud(user.uid, user.email || undefined).catch(() => {});
      };

      window.addEventListener('focus', autoSync);
      window.addEventListener('online', autoSync);
      const interval = setInterval(autoSync, 30000);

      return () => {
        unsub();
        window.removeEventListener('focus', autoSync);
        window.removeEventListener('online', autoSync);
        clearInterval(interval);
      };
    }
  }, [user?.uid, user?.email]);
  
  // Data Loading
  useEffect(() => {
    // Only load if we haven't loaded yet
    if (isDataLoaded) return;

    async function loadData() {
      try {
        const remoteDrills = await fetchDrillsFromFirestore();
        if (remoteDrills.length > 0) {
          setDrills((remoteDrills as Drill[]).map(enrichDynamicDrill));
        } else {
          setDrills(ALL_DRILLS);
        }
      } catch (err) {
        console.error("Error connecting to Firebase, falling back to local data.", err);
        setDrills(ALL_DRILLS);
      } finally {
        setIsDataLoaded(true);
      }
    }
    loadData();
  }, [isDataLoaded]);

  const renderContent = () => {
    switch (view) {
      case 'dashboard':
        return <DashboardExecutivo onNavigate={setView} userRole={userRole} />;
      case 'library':
        if (!isDataLoaded) {
          return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-[#050a07] text-emerald-500 font-display text-xl font-bold">
              <Loader2 className="w-12 h-12 animate-spin mb-4" />
              <p>Cargando biblioteca inteligente...</p>
            </div>
          );
        }
        return <DrillLibrary drills={drills} isSyncing={isSyncing} onBack={() => setView('dashboard')} />;
      case 'bonus1': return <BonusView id={view} title="100 Sesiones de Entrenamiento Listas" onBack={() => setView('dashboard')} />;
      case 'bonus2': return <BonusView id={view} title="Planificación Anual para Escuelas" onBack={() => setView('dashboard')} />;
      
      // AI Copilot module
      case 'ai': return <IAExecutiva />;

      // Functional modules
      case 'planner': return <PlannerModule drills={drills} />;
      case 'builder': return <BuilderModule drills={drills} />;
      case 'crm': return <CRMModule userRole={userRole} />;
      case 'finance': return <FinanceModule />;
      case 'billing': return <BillingModule />;
      case 'leads': return <LeadsModule />;
      case 'communication': return <CommunicationModule />;
      case 'reports': return <ReportsModule />;

      // Integrated Modules
      case 'marketplace': return <MarketplaceModule />;
      case 'personal': return <PersonalModule />;
      case 'install': return <InstallAppModule onNavigate={setView} />;
      case 'tutorial': return <TutorialModule onNavigate={setView} />;
      
      default:
        return <DashboardExecutivo onNavigate={setView} userRole={userRole} />;
    }
  };

  if (checkingAuth) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#050a07] text-emerald-500 font-display text-xl font-bold">
        <Loader2 className="w-12 h-12 animate-spin mb-4" />
        <p>Iniciando FútbolPro...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <ToastProvider>
        <Login onGuestSignIn={(guestUser) => {
          setUser(guestUser);
        }} />
      </ToastProvider>
    );
  }

  return (
    <ToastProvider>
      <PlatformLayout activeModule={view} onNavigate={setView} userRole={userRole} onChangeRole={handleRoleChange}>
        {renderContent()}
      </PlatformLayout>
    </ToastProvider>
  );
}

