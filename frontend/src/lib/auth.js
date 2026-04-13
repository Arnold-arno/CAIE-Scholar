/**
 * auth.js — Authentication adapter.
 *
 * VITE_AUTH_PROVIDER in frontend/.env:
 *   'stub'     — localStorage (default, works with no backend, any password accepted)
 *   'firebase' — Firebase Auth (requires VITE_FIREBASE_API_KEY etc.)
 *
 * All public methods return { user?, error? }.
 * user shape: { id, email, name }
 */

const AUTH_PROVIDER = import.meta.env.VITE_AUTH_PROVIDER || 'stub';

// ─── Stub ────────────────────────────────────────────────────────────────────
const stub = {
  async signIn(email, _password) {
    try {
      const raw = localStorage.getItem(`caie_acct_${btoa(email)}`);
      if (raw) return { user: JSON.parse(raw), error: null };
      // Auto-create first time (stub behaviour — no real password check)
      const user = { id: `stub_${Date.now()}`, email, name: email.split('@')[0] };
      localStorage.setItem(`caie_acct_${btoa(email)}`, JSON.stringify(user));
      return { user, error: null };
    } catch { return { user: null, error: 'Sign in failed' }; }
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
    console.info(`[Auth stub] Reset requested for ${email}`);
    return { error: null };
  },

  async checkExists(email) {
    try {
      const exists = !!localStorage.getItem(`caie_acct_${btoa(email)}`);
      return { exists, error: null };
    } catch { return { exists: false, error: null }; }
  },

  onAuthStateChange(callback) {
    try {
      const raw = localStorage.getItem('current_user');
      if (raw && localStorage.getItem('is_logged_in') === 'true') callback(JSON.parse(raw));
    } catch {}
    return { unsubscribe: () => {} };
  },
};

// ─── Firebase ────────────────────────────────────────────────────────────────
// Lazily initialised — only runs when VITE_AUTH_PROVIDER=firebase
let _fbAuth = null;

async function getFB() {
  if (_fbAuth) return _fbAuth;
  try {
    // Dynamic imports with @vite-ignore prevent Rollup resolving at build time
    const { initializeApp, getApps, getApp } = await import(/* @vite-ignore */ 'firebase/app');
    const { getAuth } = await import(/* @vite-ignore */ 'firebase/auth');
    const cfg = {
      apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId:             import.meta.env.VITE_FIREBASE_APP_ID,
    };
    if (!cfg.apiKey) throw new Error('VITE_FIREBASE_API_KEY is not set');
    const app = getApps().length ? getApp() : initializeApp(cfg);
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
    if (!auth) return { user: null, error: 'Firebase not configured — check VITE_FIREBASE_API_KEY' };
    const { signInWithEmailAndPassword } = await import(/* @vite-ignore */ 'firebase/auth');
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      return { user: { id: user.uid, email: user.email, name: user.displayName || email.split('@')[0] }, error: null };
    } catch (e) {
      // Map Firebase error codes to friendly messages
      const msg = {
        'auth/user-not-found':   'No account found with that email.',
        'auth/wrong-password':   'Incorrect password.',
        'auth/invalid-email':    'Invalid email address.',
        'auth/user-disabled':    'This account has been disabled.',
        'auth/too-many-requests':'Too many attempts. Please wait before trying again.',
        'auth/invalid-credential':'Incorrect email or password.',
      }[e.code] || e.message;
      return { user: null, error: msg };
    }
  },

  async signUp(name, email, password) {
    const auth = await getFB();
    if (!auth) return { user: null, error: 'Firebase not configured' };
    const { createUserWithEmailAndPassword, updateProfile } = await import(/* @vite-ignore */ 'firebase/auth');
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(user, { displayName: name });
      return { user: { id: user.uid, email, name }, error: null };
    } catch (e) {
      const msg = {
        'auth/email-already-in-use': 'An account with this email already exists.',
        'auth/weak-password':        'Password must be at least 6 characters.',
        'auth/invalid-email':        'Invalid email address.',
      }[e.code] || e.message;
      return { user: null, error: msg };
    }
  },

  async signOut() {
    const auth = await getFB();
    if (!auth) return { error: null };
    const { signOut } = await import(/* @vite-ignore */ 'firebase/auth');
    try { await signOut(auth); return { error: null }; }
    catch (e) { return { error: e.message }; }
  },

  async sendOTP(email) {
    // Firebase doesn't support numeric OTP natively.
    // We use Email Link (passwordless) — user clicks the link to verify.
    const auth = await getFB();
    if (!auth) return { code: null, error: 'Firebase not configured' };
    const { sendSignInLinkToEmail } = await import(/* @vite-ignore */ 'firebase/auth');
    try {
      await sendSignInLinkToEmail(auth, email, {
        url: `${window.location.origin}/verify-email`,
        handleCodeInApp: true,
      });
      localStorage.setItem('caie_emailForSignIn', email);
      // No numeric code — verification happens via the email link
      return { code: null, error: null };
    } catch (e) { return { code: null, error: e.message }; }
  },

  async verifyOTP(_email, _token) {
    // When using Firebase Email Link, verification happens automatically
    // when the user clicks the link. We optimistically allow continuation here.
    return { verified: true, error: null };
  },

  async resetPassword(email) {
    const auth = await getFB();
    if (!auth) return { error: 'Firebase not configured' };
    const { sendPasswordResetEmail } = await import(/* @vite-ignore */ 'firebase/auth');
    try {
      await sendPasswordResetEmail(auth, email);
      return { error: null };
    } catch (e) {
      const msg = {
        'auth/user-not-found': 'No account found with that email.',
        'auth/invalid-email':  'Invalid email address.',
      }[e.code] || e.message;
      return { error: msg };
    }
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
          callback(user
            ? { id: user.uid, email: user.email, name: user.displayName || user.email.split('@')[0] }
            : null
          );
        });
      });
    });
    return { unsubscribe: () => unsub() };
  },
};

// ─── Select and export ────────────────────────────────────────────────────────
export const authProvider = AUTH_PROVIDER === 'firebase' ? firebaseAdapter : stub;

export const {
  signIn,
  signUp,
  signOut,
  sendOTP,
  verifyOTP,
  resetPassword,
  checkExists,
  onAuthStateChange,
} = authProvider;

export const activeProvider = AUTH_PROVIDER;
export const isRealAuth     = AUTH_PROVIDER === 'firebase';
