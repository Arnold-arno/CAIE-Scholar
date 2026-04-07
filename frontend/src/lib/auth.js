/**
 * auth.js — Authentication adapter.
 *
 * Set VITE_AUTH_PROVIDER in frontend/.env:
 *   'stub'     — localStorage only, any email works (default)
 *   'supabase' — Supabase Auth (VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY)
 *   'firebase' — Firebase Auth  (VITE_FIREBASE_API_KEY + VITE_FIREBASE_AUTH_DOMAIN + VITE_FIREBASE_PROJECT_ID)
 *
 * All methods return { user?, error? } — callers handle both paths uniformly.
 * user shape: { id, email, name }
 */

const AUTH_PROVIDER = import.meta.env.VITE_AUTH_PROVIDER || 'stub';

// ─── Stub (default, no backend needed) ───────────────────────────────────────
const stub = {
  async signIn(email, _password) {
    const stored = (() => {
      try { return JSON.parse(localStorage.getItem(`caie_acct_${btoa(email)}`)); } catch { return null; }
    })();
    if (stored) return { user: stored, error: null };
    // Auto-create on first sign-in (stub behaviour)
    const user = { id: `stub_${Date.now()}`, email, name: email.split('@')[0] };
    try { localStorage.setItem(`caie_acct_${btoa(email)}`, JSON.stringify(user)); } catch {}
    return { user, error: null };
  },

  async signUp(name, email, _password) {
    const user = { id: `stub_${Date.now()}`, email, name };
    try { localStorage.setItem(`caie_acct_${btoa(email)}`, JSON.stringify(user)); } catch {}
    return { user, error: null };
  },

  async signOut() { return { error: null }; },

  async sendOTP(email) {
    const code = String(Math.floor(100000 + Math.random() * 900000));
    console.info(`[Auth stub] OTP for ${email}: ${code}`);
    return { code, error: null };
  },

  async verifyOTP(_email, _code, _expected) {
    return { verified: true, error: null };
  },

  async resetPassword(email) {
    // Stub: just return success — show the user a toast saying "email sent"
    console.info(`[Auth stub] Password reset requested for ${email}`);
    return { error: null };
  },

  async checkExists(email) {
    const stored = (() => {
      try { return localStorage.getItem(`caie_acct_${btoa(email)}`); } catch { return null; }
    })();
    return { exists: !!stored, error: null };
  },

  onAuthStateChange(callback) {
    try {
      const raw = localStorage.getItem('current_user');
      const loggedIn = localStorage.getItem('is_logged_in') === 'true';
      if (raw && loggedIn) callback(JSON.parse(raw));
    } catch {}
    return { unsubscribe: () => {} };
  },
};

// ─── Supabase ─────────────────────────────────────────────────────────────────
let _sb = null;
async function getSB() {
  if (_sb) return _sb;
  try {
    const { createClient } = await import(/* @vite-ignore */ '@supabase/supabase-js');
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (!url || !key) throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
    _sb = createClient(url, key);
    return _sb;
  } catch (e) {
    console.error('[Auth] Supabase init failed:', e.message);
    return null;
  }
}

const supabaseAdapter = {
  async signIn(email, password) {
    const sb = await getSB();
    if (!sb) return { user: null, error: 'Supabase not configured' };
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error) return { user: null, error: error.message };
    return { user: { id: data.user.id, email: data.user.email, name: data.user.user_metadata?.name || email.split('@')[0] }, error: null };
  },

  async signUp(name, email, password) {
    const sb = await getSB();
    if (!sb) return { user: null, error: 'Supabase not configured' };
    const { data, error } = await sb.auth.signUp({ email, password, options: { data: { name } } });
    if (error) return { user: null, error: error.message };
    return { user: { id: data.user?.id, email, name }, error: null };
  },

  async signOut() {
    const sb = await getSB();
    if (!sb) return { error: null };
    const { error } = await sb.auth.signOut();
    return { error: error?.message || null };
  },

  async sendOTP(email) {
    const sb = await getSB();
    if (!sb) return { error: 'Supabase not configured' };
    const { error } = await sb.auth.signInWithOtp({ email });
    return { code: null, error: error?.message || null };
  },

  async verifyOTP(email, token) {
    const sb = await getSB();
    if (!sb) return { verified: false, error: 'Supabase not configured' };
    const { data, error } = await sb.auth.verifyOtp({ email, token, type: 'email' });
    return { verified: !error, user: data?.user || null, error: error?.message || null };
  },

  async resetPassword(email) {
    const sb = await getSB();
    if (!sb) return { error: 'Supabase not configured' };
    const { error } = await sb.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error: error?.message || null };
  },

  async checkExists(email) {
    // Supabase doesn't expose a "does email exist" endpoint publicly for security.
    // We attempt sign-in with a dummy password — a specific error message tells us
    // whether the account exists (wrong password) vs doesn't exist (user not found).
    const sb = await getSB();
    if (!sb) return { exists: false, error: null };
    const { error } = await sb.auth.signInWithPassword({ email, password: '##CHECK_ONLY##' });
    const msg = error?.message?.toLowerCase() || '';
    if (msg.includes('invalid login') || msg.includes('wrong password') || msg.includes('invalid credentials')) {
      return { exists: true, error: null };
    }
    return { exists: false, error: null };
  },

  onAuthStateChange(callback) {
    let unsub = () => {};
    getSB().then(sb => {
      if (!sb) return;
      const { data } = sb.auth.onAuthStateChange((_event, session) => {
        callback(session?.user ? {
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.name || session.user.email.split('@')[0],
        } : null);
      });
      unsub = data.subscription.unsubscribe;
    });
    return { unsubscribe: () => unsub() };
  },
};

// ─── Firebase ─────────────────────────────────────────────────────────────────
let _fbAuth = null;
async function getFB() {
  if (_fbAuth) return _fbAuth;
  try {
    const { initializeApp, getApps } = await import(/* @vite-ignore */ 'firebase/app');
    const { getAuth } = await import(/* @vite-ignore */ 'firebase/auth');
    const cfg = {
      apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId:             import.meta.env.VITE_FIREBASE_APP_ID,
    };
    if (!cfg.apiKey) throw new Error('Missing VITE_FIREBASE_API_KEY');
    const app = getApps().length ? getApps()[0] : initializeApp(cfg);
    _fbAuth = getAuth(app);
    return _fbAuth;
  } catch (e) {
    console.error('[Auth] Firebase init failed:', e.message);
    return null;
  }
}

const firebaseAdapter = {
  async signIn(email, password) {
    const auth = await getFB();
    if (!auth) return { user: null, error: 'Firebase not configured' };
    const { signInWithEmailAndPassword } = await import(/* @vite-ignore */ 'firebase/auth');
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      return { user: { id: cred.user.uid, email: cred.user.email, name: cred.user.displayName || email.split('@')[0] }, error: null };
    } catch (e) { return { user: null, error: e.message }; }
  },

  async signUp(name, email, password) {
    const auth = await getFB();
    if (!auth) return { user: null, error: 'Firebase not configured' };
    const { createUserWithEmailAndPassword, updateProfile } = await import(/* @vite-ignore */ 'firebase/auth');
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name });
      return { user: { id: cred.user.uid, email, name }, error: null };
    } catch (e) { return { user: null, error: e.message }; }
  },

  async signOut() {
    const auth = await getFB();
    if (!auth) return { error: null };
    const { signOut } = await import(/* @vite-ignore */ 'firebase/auth');
    try { await signOut(auth); return { error: null }; }
    catch (e) { return { error: e.message }; }
  },

  async sendOTP(email) {
    const auth = await getFB();
    if (!auth) return { error: 'Firebase not configured' };
    const { sendSignInLinkToEmail } = await import(/* @vite-ignore */ 'firebase/auth');
    try {
      await sendSignInLinkToEmail(auth, email, {
        url: `${window.location.origin}/verify-email`,
        handleCodeInApp: true,
      });
      localStorage.setItem('emailForSignIn', email);
      return { code: null, error: null };
    } catch (e) { return { code: null, error: e.message }; }
  },

  async verifyOTP(_email, _token) { return { verified: true, error: null }; },

  async resetPassword(email) {
    const auth = await getFB();
    if (!auth) return { error: 'Firebase not configured' };
    const { sendPasswordResetEmail } = await import(/* @vite-ignore */ 'firebase/auth');
    try { await sendPasswordResetEmail(auth, email); return { error: null }; }
    catch (e) { return { error: e.message }; }
  },

  async checkExists(email) {
    const auth = await getFB();
    if (!auth) return { exists: false, error: null };
    const { fetchSignInMethodsForEmail } = await import(/* @vite-ignore */ 'firebase/auth');
    try {
      const methods = await fetchSignInMethodsForEmail(auth, email);
      return { exists: methods.length > 0, error: null };
    } catch { return { exists: false, error: null }; }
  },

  onAuthStateChange(callback) {
    let unsub = () => {};
    getFB().then(auth => {
      if (!auth) return;
      import(/* @vite-ignore */ 'firebase/auth').then(({ onAuthStateChanged }) => {
        unsub = onAuthStateChanged(auth, user => {
          callback(user ? { id: user.uid, email: user.email, name: user.displayName || user.email.split('@')[0] } : null);
        });
      });
    });
    return { unsubscribe: () => unsub() };
  },
};

// ─── Export ───────────────────────────────────────────────────────────────────
const ADAPTERS = { stub, supabase: supabaseAdapter, firebase: firebaseAdapter };
export const authProvider = ADAPTERS[AUTH_PROVIDER] || stub;

export const { signIn, signUp, signOut, sendOTP, verifyOTP, resetPassword, checkExists, onAuthStateChange } = authProvider;
export const activeProvider = AUTH_PROVIDER;
export const isRealAuth = AUTH_PROVIDER !== 'stub';
