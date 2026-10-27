import { useState, FormEvent } from 'react';
import { auth } from '../firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithPopup,
  signOut
} from 'firebase/auth';
import { Mail, Lock, Loader2, ArrowRight, LogIn, Dumbbell } from 'lucide-react';
import * as motion from 'motion/react-client';
import { authenticateLocalUser, registerLocalUser } from '../lib/localAuth';
import { pushUserDataToCloud, pullUserDataFromCloud } from '../lib/cloudSync';

export function Login({ onGuestSignIn }: { onGuestSignIn: (user: any) => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleGuestLogin = () => {
    const guestUser = {
      uid: 'guest_trainer_99',
      email: 'treinador.convidado@drillforge.com.br'
    };
    if (typeof window !== 'undefined') {
      localStorage.setItem('drillforge_guest_user', JSON.stringify(guestUser));
    }
    onGuestSignIn(guestUser);
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      if (result && result.user) {
        if (typeof window !== 'undefined') {
          const userSession = {
            uid: result.user.uid,
            email: result.user.email,
            displayName: result.user.displayName || result.user.email?.split('@')[0],
            photoURL: result.user.photoURL,
            isGoogle: true,
            role: 'admin'
          };
          localStorage.setItem('drillforge_guest_user', JSON.stringify(userSession));
          localStorage.setItem('drillforge_user_role', 'admin');
        }
        await pullUserDataFromCloud(result.user.uid, result.user.email || undefined);
      }
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user') {
        setError('O login foi cancelado pois a janela pop-up foi fechada. Você pode entrar como Convidado abaixo para testar instantaneamente!');
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('O provedor de login do Google não está ativo. Recomenda-se utilizar o "Acesso de Teste (Convidado)" abaixo!');
      } else {
        setError('Erro ao fazer login com o Google: ' + (err.message || err.code));
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!isLogin && password !== confirmPassword) {
      setError('As senhas não coincidem. Por favor, digite a mesma senha nos dois campos.');
      return;
    }

    setLoading(true);

    const targetEmail = email.trim().toLowerCase();

    // 8-second safety timeout so loading state NEVER hangs indefinitely
    const safetyTimeout = setTimeout(() => {
      setLoading(false);
      setError('Tempo limite excedido. Por favor, tente novamente ou use o modo convidado.');
    }, 8000);

    try {
      if (isLogin) {
        try {
          const userCredential = await signInWithEmailAndPassword(auth, targetEmail, password);
          clearTimeout(safetyTimeout);
          if (typeof window !== 'undefined') {
             const userSession = {
               uid: userCredential.user.uid,
               email: userCredential.user.email,
               displayName: userCredential.user.displayName || targetEmail.split('@')[0],
               photoURL: userCredential.user.photoURL,
               isGoogle: false,
               role: 'admin'
             };
             localStorage.setItem('drillforge_guest_user', JSON.stringify(userSession));
             localStorage.setItem('drillforge_user_role', 'admin');
          }
          const uid = userCredential.user.uid;
          // Synchronize and pull user data before presenting dashboard
          await pullUserDataFromCloud(uid, targetEmail);
          onGuestSignIn({
            uid: uid,
            email: userCredential.user.email,
            displayName: userCredential.user.displayName || targetEmail.split('@')[0]
          });
          return;
        } catch (firebaseErr: any) {
          // Check cloud/local account fallback
          const localUser = await authenticateLocalUser(targetEmail, password);
          if (localUser) {
            clearTimeout(safetyTimeout);
            if (typeof window !== 'undefined') {
              const userSession = {
                uid: localUser.uid,
                email: localUser.email,
                displayName: targetEmail.split('@')[0],
                photoURL: null,
                isGoogle: false,
                role: 'admin'
              };
              localStorage.setItem('drillforge_guest_user', JSON.stringify(userSession));
              localStorage.setItem('drillforge_user_role', 'admin');
            }
            await pullUserDataFromCloud(localUser.uid, targetEmail);
            onGuestSignIn({
              uid: localUser.uid,
              email: localUser.email,
              displayName: targetEmail.split('@')[0]
            });
            return;
          }

          if (firebaseErr.code === 'auth/wrong-password' || firebaseErr.code === 'auth/invalid-credential') {
             clearTimeout(safetyTimeout);
             setError('Contraseña incorrecta para este usuario.');
          } else {
             // Seamless account login/creation fallback
             try {
               const newUser = await registerLocalUser(targetEmail, password);
               clearTimeout(safetyTimeout);
               if (typeof window !== 'undefined') {
                 const userSession = {
                   uid: newUser.uid,
                   email: newUser.email,
                   displayName: targetEmail.split('@')[0],
                   photoURL: null,
                   isGoogle: false,
                   role: 'admin'
                 };
                 localStorage.setItem('drillforge_guest_user', JSON.stringify(userSession));
                 localStorage.setItem('drillforge_user_role', 'admin');
               }
               await pullUserDataFromCloud(newUser.uid, targetEmail);
               onGuestSignIn({
                 uid: newUser.uid,
                 email: newUser.email,
                 displayName: targetEmail.split('@')[0]
               });
               return;
             } catch (regErr: any) {
               clearTimeout(safetyTimeout);
               setError('Correo electrónico o contraseña incorrectos.');
             }
          }
        }
      } else {
        // Registration
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, targetEmail, password);
          clearTimeout(safetyTimeout);
          if (typeof window !== 'undefined') {
             const userSession = {
               uid: userCredential.user.uid,
               email: userCredential.user.email,
               displayName: userCredential.user.displayName || targetEmail.split('@')[0],
               photoURL: userCredential.user.photoURL,
               isGoogle: false,
               role: 'admin'
             };
             localStorage.setItem('drillforge_guest_user', JSON.stringify(userSession));
             localStorage.setItem('drillforge_user_role', 'admin');
          }
          await pullUserDataFromCloud(userCredential.user.uid, targetEmail);
          pushUserDataToCloud(userCredential.user.uid, targetEmail).catch(() => {});
          onGuestSignIn({
            uid: userCredential.user.uid,
            email: userCredential.user.email,
            displayName: userCredential.user.displayName || targetEmail.split('@')[0]
          });
          return;
        } catch (firebaseErr: any) {
          if (firebaseErr.code === 'auth/email-already-in-use') {
             clearTimeout(safetyTimeout);
             setError('Este correo electrónico ya está registrado.');
          } else if (firebaseErr.code === 'auth/weak-password') {
             clearTimeout(safetyTimeout);
             setError('La contraseña debe tener al menos 6 caracteres.');
          } else {
             // Seamless cloud/local account creation fallback
             try {
               const localUser = await registerLocalUser(targetEmail, password);
               clearTimeout(safetyTimeout);
               if (typeof window !== 'undefined') {
                 const userSession = {
                   uid: localUser.uid,
                   email: localUser.email,
                   displayName: targetEmail.split('@')[0],
                   photoURL: null,
                   isGoogle: false,
                   role: 'admin'
                 };
                 localStorage.setItem('drillforge_guest_user', JSON.stringify(userSession));
                 localStorage.setItem('drillforge_user_role', 'admin');
               }
               await pullUserDataFromCloud(localUser.uid, targetEmail);
               pushUserDataToCloud(localUser.uid, targetEmail).catch(() => {});
               onGuestSignIn({
                 uid: localUser.uid,
                 email: localUser.email,
                 displayName: targetEmail.split('@')[0]
               });
               return;
             } catch (regErr: any) {
               clearTimeout(safetyTimeout);
               if (regErr.message === 'EMAIL_EXISTS') {
                 setError('Este correo electrónico ya está registrado.');
               } else {
                 setError('Error al crear cuenta: ' + (regErr.message || firebaseErr.message || firebaseErr.code));
               }
             }
          }
        }
      }
    } catch (err: any) {
      clearTimeout(safetyTimeout);
      setError('Ocorreu um erro inesperado na autenticação.');
    } finally {
      clearTimeout(safetyTimeout);
      setLoading(false);
    }
  };

  // Pre-fill fields for easy demo
  const handleTestLogin = () => {
    setEmail('admin@treinos.com');
    setPassword('123456');
  };

  return (
    <div className="min-h-screen bg-[#050a07] flex items-center justify-center p-6 text-slate-200 selection:bg-emerald-500/30 font-sans">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-[#050a07]/10 to-transparent"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-zinc-950 border border-zinc-800/80 rounded-2xl shadow-2xl relative z-10 overflow-hidden"
      >
        <div className="p-8">
          <div className="mb-8 text-center text-emerald-500 flex flex-col items-center">
            <div className="w-20 h-20 rounded-2xl overflow-hidden mb-4 shadow-xl shadow-emerald-500/5 flex items-center justify-center">
               <img 
                 src="https://i.postimg.cc/HsKz3wQQ/logo-futbol-pro.png" 
                 alt="FútbolPro Logo" 
                 className="w-full h-full object-contain"
                 referrerPolicy="no-referrer"
               />
            </div>
            <h2 className="text-3xl font-display font-black text-white tracking-tight uppercase">Fútbol<span className="text-emerald-500">Pro</span></h2>
          </div>

          {/* Selector de pestañas */}
          <div className="flex bg-zinc-900/80 border border-zinc-850/60 p-1.5 rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => { setIsLogin(true); setError(''); }}
              className={`flex-1 py-3 text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all ${
                isLogin 
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/10' 
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={() => { setIsLogin(false); setError(''); }}
              className={`flex-1 py-3 text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all ${
                !isLogin 
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/10' 
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Registrarse
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg text-sm font-medium text-center space-y-2">
                <div>{error}</div>
              </div>
            )}
            
            {message && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-lg text-sm font-medium text-center">
                {message}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-sm font-medium text-zinc-400 pl-1">Correo Electrónico</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all text-white placeholder:text-zinc-600"
                  placeholder="tu@correo.com"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-zinc-400 pl-1">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all text-white placeholder:text-zinc-600"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {!isLogin && (
              <div className="space-y-1">
                <label className="text-sm font-medium text-zinc-400 pl-1">Confirmar Contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <input 
                    type="password" 
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all text-white placeholder:text-zinc-600"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 group border border-emerald-500/30"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {isLogin ? 'Entrar a la Plataforma' : 'Crear Cuenta'}
                  <ArrowRight className="w-5 h-5 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </>
              )}
            </button>
          </form>

          {/* Social Sign-in Option */}
          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-zinc-900"></div>
            <span className="px-3 text-[10px] text-zinc-500 uppercase font-mono tracking-wider">O</span>
            <div className="flex-1 border-t border-zinc-900"></div>
          </div>

          <button
            type="button"
            disabled={googleLoading}
            onClick={handleGoogleSignIn}
            className="w-full bg-zinc-900 hover:bg-zinc-850 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 group border border-zinc-800 hover:border-emerald-500/20"
          >
            {googleLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <LogIn className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
                <span>Entrar con Google</span>
              </>
            )}
          </button>
          
          <div className="mt-8 text-center space-y-4">
            <div className="flex justify-between items-center text-xs">
              <button 
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-emerald-400 hover:text-emerald-300 font-bold transition-all py-1"
              >
                {isLogin ? '¿No tienes cuenta? Toca para registrarte' : '¿Ya tienes cuenta? Iniciar Sesión'}
              </button>

              <button
                type="button"
                onClick={handleTestLogin}
                className="text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                Datos de prueba
              </button>
            </div>

          </div>
        </div>
      </motion.div>
    </div>
  );
}
