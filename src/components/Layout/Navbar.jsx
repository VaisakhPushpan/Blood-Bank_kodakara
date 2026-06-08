import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { translations } from '../../utils/translations';
import { Languages, LogIn, LogOut, Heart } from 'lucide-react';
import styles from '../../styles/components/Navbar.module.css';

const Navbar = () => {
  const { lang, toggleLanguage } = useLanguage();
  const { user, loginWithGoogle, logout } = useAuth();
  const t = translations[lang];

  return (
    <nav className={styles.nav}>
      <div className={`${styles.navContent} container`}>
        <Link to="/" className={styles.logo}>
          <Heart fill="var(--primary)" color="var(--primary)" />
          <span>Blood Bank</span>
        </Link>

        <div className={styles.links}>
          <Link to="/find">{t.nav.find}</Link>
          <Link to="/register">{t.nav.register}</Link>
        </div>

        <div className={styles.actions}>
          <button onClick={toggleLanguage} className={styles.iconBtn} aria-label="Toggle Language">
            <Languages size={20} />
            <span className={styles.langLabel}>{lang === 'ml' ? 'EN' : 'ML'}</span>
          </button>

          {user ? (
            <button onClick={logout} className={styles.iconBtn} aria-label="Logout">
              <LogOut size={20} />
            </button>
          ) : (
            <button onClick={loginWithGoogle} className={styles.loginBtn}>
              <LogIn size={20} />
              <span className={styles.loginText}>{t.common.loginWithGoogle}</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
