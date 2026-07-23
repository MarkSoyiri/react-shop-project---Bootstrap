import zestylogo from '../images/zestylogo.png';
import { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axiosFetch from '../api/axiosFetchAPI';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

/* ───── inline SVG icons ───── */
const IconMail = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="M22 4L12 13L2 4" />
  </svg>
);

const IconLock = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0110 0v4" />
  </svg>
);

const IconUser = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const IconEye = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const IconEyeOff = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const IconGoogle = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

/* ───── decorative floating shapes for the left panel ───── */
const shapes = [
  { emoji: '\uD83C\uDF54', top: '12%', left: '10%', size: 48, delay: 0 },
  { emoji: '\uD83C\uDF5F', top: '28%', right: '14%', size: 42, delay: 0.6 },
  { emoji: '\uD83C\uDF2E', top: '55%', left: '18%', size: 40, delay: 1.2 },
  { emoji: '\uD83C\uDF55', top: '72%', right: '10%', size: 46, delay: 0.3 },
  { emoji: '\uD83E\uDD61', top: '42%', left: '5%',  size: 38, delay: 0.9 },
  { emoji: '\uD83C\uDF2D', top: '85%', left: '30%', size: 44, delay: 1.5 },
  { emoji: '\uD83C\uDF7A', top: '18%', right: '6%',  size: 36, delay: 1.8 },
  { emoji: '\u2615', top: '62%', right: '22%', size: 34, delay: 2.1 },
];

const floatingShapes = shapes.map((s, i) => (
  <motion.span
    key={i}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 0.12, y: [0, -12, 0] }}
    transition={{ opacity: { duration: 0.6, delay: s.delay }, y: { duration: 4 + i, repeat: Infinity, ease: 'easeInOut', delay: s.delay } }}
    style={{
      position: 'absolute',
      top: s.top,
      left: s.left,
      right: s.right,
      fontSize: s.size,
      pointerEvents: 'none',
      userSelect: 'none',
    }}
  >
    {s.emoji}
  </motion.span>
));

/* ───── animation variants ───── */
const tabVariants = {
  enter: (dir) => ({ x: dir > 0 ? 40 : -40, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir > 0 ? -40 : 40, opacity: 0 }),
};

const fieldStagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const fieldItem = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

/* ============================================================
   COMPONENT
   ============================================================ */

function Login() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  /* ── state ── */
  const [Email, SetEmail] = useState('');
  const [Password, SetPassword] = useState('');
  const [Username, SetUsername] = useState('');
  const [EmailError, SetEmailError] = useState('');
  const [PasswordError, SetPasswordError] = useState('');
  const [UsernameError, SetUsernameError] = useState('');
  const [ServerError, SetServerError] = useState('');
  const [showLogin, SetShowLogin] = useState(true);
  const [showPassword, SetShowPassword] = useState(false);
  const [rememberMe, SetRememberMe] = useState(false);
  const [agreeTerms, SetAgreeTerms] = useState(false);
  const [tabDirection, setTabDirection] = useState(1);

  /* ── helpers ── */
  function clearErrors() {
    SetServerError('');
    SetEmailError('');
    SetPasswordError('');
    SetUsernameError('');
  }

  function regClick() {
    clearErrors();
    SetShowLogin(false);
    setTabDirection(1);
  }

  function logClick() {
    clearErrors();
    SetShowLogin(true);
    setTabDirection(-1);
  }

  /* ── handlers ── */
  const loginHandler = async (event) => {
    event.preventDefault();
    SetServerError('');

    try {
      if (Email === '') { SetEmailError('Invalid Email'); return; }
      if (Password === '') { SetPasswordError('Invalid Password'); return; }

      const response = await axiosFetch.post('/api/auth/login', {
        email: Email,
        password: Password,
      });

      if (response.status === 200 || response.status === 201) {
        const { token, user } = response.data;
        if (token && user) {
          localStorage.setItem('token', token);
          login(user, token);
          navigate('/');
        } else {
          SetServerError('Invalid response from server');
        }
      }
    } catch (error) {
      if (error.response) {
        const msg = error.response.data?.message || error.response.statusText || 'Login failed';
        SetServerError(msg);
        console.error('Login Error:', error.response.status, error.response.data);
      } else {
        SetServerError(error.message);
        console.error('Login Error:', error.message);
      }
    }
  };

  const registerHandler = async (event) => {
    event.preventDefault();
    SetServerError('');

    try {
      if (Email === '') { SetEmailError('Invalid Email'); return; }
      if (Password === '') { SetPasswordError('Invalid Password'); return; }
      if (Username === '') { SetUsernameError('Username cannot be empty'); return; }

      const response = await axiosFetch.post('/api/auth/register', {
        username: Username,
        email: Email,
        password: Password,
      });

      if (response.status === 200 || response.status === 201) {
        alert('Registration Successful! Please Login.');
        SetUsername('');
        SetEmail('');
        SetPassword('');
        SetUsernameError('');
        SetEmailError('');
        SetPasswordError('');
        SetShowLogin(true);
        setTabDirection(-1);
      }
    } catch (error) {
      if (error.response) {
        const msg = error.response.data?.message || error.response.statusText || 'Registration failed';
        SetServerError(msg);
        console.error('Register Error:', error.response.status, error.response.data);
      } else {
        SetServerError(error.message);
        console.error('Register Error:', error.message);
      }
    }
  };

  /* ───────────────────────────── render ───────────────────────────── */
  return (
    <div className="auth-page">
      {/* ====== LEFT PANEL (desktop only) ====== */}
      <div className="auth-left-panel">
        <div className="auth-left-content">
          {floatingShapes}
          <motion.img
            src={zestylogo}
            alt="Zesty Cave"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{ height: 80, marginBottom: 24 }}
          />
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
          >
            Welcome to Zesty Cave
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Order delicious food with a few clicks
          </motion.p>
        </div>
      </div>

      {/* ====== RIGHT PANEL ====== */}
      <div className="auth-right-panel">
        <div className="auth-right-inner">

          {/* mobile logo */}
          <img
            src={zestylogo}
            alt="Zesty Cave"
            className="auth-mobile-logo"
          />

          {/* ── tab switcher ── */}
          <div className="auth-tabs">
            <button
              type="button"
              className={`auth-tab ${showLogin ? 'active' : ''}`}
              onClick={logClick}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`auth-tab ${!showLogin ? 'active' : ''}`}
              onClick={regClick}
            >
              Sign Up
            </button>
            <span
              className="auth-tab-indicator"
              style={{ transform: showLogin ? 'translateX(0)' : 'translateX(100%)' }}
            />
          </div>

          {/* ── server error ── */}
          {ServerError && (
            <motion.div
              className="auth-server-error"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {ServerError}
            </motion.div>
          )}

          {/* ── animated forms ── */}
          <AnimatePresence mode="wait" custom={tabDirection}>
            {showLogin ? (
              /* ========== LOGIN FORM ========== */
              <motion.form
                key="login"
                custom={tabDirection}
                variants={tabVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.28, ease: 'easeInOut' }}
                onSubmit={loginHandler}
                className="auth-form"
              >
                <motion.div variants={fieldStagger} initial="hidden" animate="visible">
                  <h1 className="auth-title">Welcome Back</h1>
                  <p className="auth-subtitle">Sign in to your account</p>

                  {/* email */}
                  <motion.div className="auth-field" variants={fieldItem}>
                    <label htmlFor="login-email">Email address</label>
                    <div className="auth-input-wrap">
                      <span className="auth-input-icon">{IconMail}</span>
                      <input
                        id="login-email"
                        type="email"
                        placeholder="you@example.com"
                        value={Email}
                        onChange={(e) => { SetEmail(e.target.value); SetEmailError(''); }}
                        className={EmailError ? 'error' : ''}
                      />
                    </div>
                    {EmailError && <span className="auth-field-error">{EmailError}</span>}
                  </motion.div>

                  {/* password */}
                  <motion.div className="auth-field" variants={fieldItem}>
                    <label htmlFor="login-password">Password</label>
                    <div className="auth-input-wrap">
                      <span className="auth-input-icon">{IconLock}</span>
                      <input
                        id="login-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        value={Password}
                        onChange={(e) => { SetPassword(e.target.value); SetPasswordError(''); }}
                        className={PasswordError ? 'error' : ''}
                      />
                      <button
                        type="button"
                        className="auth-eye-btn"
                        onClick={() => SetShowPassword(!showPassword)}
                        aria-label="Toggle password visibility"
                      >
                        {showPassword ? IconEyeOff : IconEye}
                      </button>
                    </div>
                    {PasswordError && <span className="auth-field-error">{PasswordError}</span>}
                  </motion.div>

                  {/* remember / forgot */}
                  <motion.div className="auth-row-between" variants={fieldItem}>
                    <label className="auth-checkbox">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => SetRememberMe(e.target.checked)}
                      />
                      <span>Remember me</span>
                    </label>
                    <a href="/forgot-password" className="auth-forgot-link">Forgot password?</a>
                  </motion.div>

                  {/* submit */}
                  <motion.div variants={fieldItem}>
                    <button type="submit" className="zc-btn zc-btn--primary zc-btn--full zc-btn--lg zc-btn--rounded">
                      Sign In
                    </button>
                  </motion.div>

                  {/* divider */}
                  <motion.div className="auth-divider" variants={fieldItem}>
                    <span>or continue with</span>
                  </motion.div>

                  {/* social */}
                  <motion.div className="auth-social-row" variants={fieldItem}>
                    <button type="button" className="auth-social-btn">
                      {IconGoogle}
                      Google
                    </button>
                  </motion.div>

                  {/* switch */}
                  <motion.p className="auth-switch-text" variants={fieldItem}>
                    Don't have an account?{' '}
                    <button type="button" className="auth-switch-link" onClick={regClick}>Sign up</button>
                  </motion.p>
                </motion.div>
              </motion.form>
            ) : (
              /* ========== REGISTER FORM ========== */
              <motion.form
                key="register"
                custom={tabDirection}
                variants={tabVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.28, ease: 'easeInOut' }}
                onSubmit={registerHandler}
                className="auth-form"
              >
                <motion.div variants={fieldStagger} initial="hidden" animate="visible">
                  <h1 className="auth-title">Create Account</h1>
                  <p className="auth-subtitle">Join us and start ordering</p>

                  {/* username */}
                  <motion.div className="auth-field" variants={fieldItem}>
                    <label htmlFor="reg-username">Username</label>
                    <div className="auth-input-wrap">
                      <span className="auth-input-icon">{IconUser}</span>
                      <input
                        id="reg-username"
                        type="text"
                        placeholder="Choose a username"
                        value={Username}
                        onChange={(e) => { SetUsername(e.target.value); SetUsernameError(''); }}
                        className={UsernameError ? 'error' : ''}
                      />
                    </div>
                    {UsernameError && <span className="auth-field-error">{UsernameError}</span>}
                  </motion.div>

                  {/* email */}
                  <motion.div className="auth-field" variants={fieldItem}>
                    <label htmlFor="reg-email">Email address</label>
                    <div className="auth-input-wrap">
                      <span className="auth-input-icon">{IconMail}</span>
                      <input
                        id="reg-email"
                        type="email"
                        placeholder="you@example.com"
                        value={Email}
                        onChange={(e) => { SetEmail(e.target.value); SetEmailError(''); }}
                        className={EmailError ? 'error' : ''}
                      />
                    </div>
                    {EmailError && <span className="auth-field-error">{EmailError}</span>}
                  </motion.div>

                  {/* password */}
                  <motion.div className="auth-field" variants={fieldItem}>
                    <label htmlFor="reg-password">Password</label>
                    <div className="auth-input-wrap">
                      <span className="auth-input-icon">{IconLock}</span>
                      <input
                        id="reg-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Create a password"
                        value={Password}
                        onChange={(e) => { SetPassword(e.target.value); SetPasswordError(''); }}
                        className={PasswordError ? 'error' : ''}
                      />
                      <button
                        type="button"
                        className="auth-eye-btn"
                        onClick={() => SetShowPassword(!showPassword)}
                        aria-label="Toggle password visibility"
                      >
                        {showPassword ? IconEyeOff : IconEye}
                      </button>
                    </div>
                    {PasswordError && <span className="auth-field-error">{PasswordError}</span>}
                  </motion.div>

                  {/* terms */}
                  <motion.div className="auth-field" variants={fieldItem}>
                    <label className="auth-checkbox">
                      <input
                        type="checkbox"
                        checked={agreeTerms}
                        onChange={(e) => SetAgreeTerms(e.target.checked)}
                      />
                      <span>
                        I agree to <a href="/privacy">Privacy Policy</a> and <a href="/terms">Terms</a>
                      </span>
                    </label>
                  </motion.div>

                  {/* submit */}
                  <motion.div variants={fieldItem}>
                    <button type="submit" className="zc-btn zc-btn--primary zc-btn--full zc-btn--lg zc-btn--rounded">
                      Create Account
                    </button>
                  </motion.div>

                  {/* switch */}
                  <motion.p className="auth-switch-text" variants={fieldItem}>
                    Already have an account?{' '}
                    <button type="button" className="auth-switch-link" onClick={logClick}>Sign in</button>
                  </motion.p>
                </motion.div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default Login;
