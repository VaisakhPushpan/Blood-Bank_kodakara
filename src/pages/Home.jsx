import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { translations } from '../utils/translations';
import styles from '../styles/pages/Home.module.css';
import { Search, UserPlus, Heart, PhoneCall, CheckCircle, AlertCircle } from 'lucide-react';

const Home = () => {
  const { lang } = useLanguage();
  const { user, isDonor } = useAuth();
  const t = translations[lang];
  const navigate = useNavigate();

  return (
    <div className={styles.home}>
      {user && !isDonor && (
        <div className={styles.alert}>
          <div className="container">
            <div className={styles.alertContent}>
              <AlertCircle size={20} />
              <span>
                {lang === 'ml' 
                  ? 'ദാതാവായി രജിസ്റ്റർ ചെയ്യാൻ ഇവിടെ ക്ലിക്ക് ചെയ്യുക' 
                  : 'You are not registered as a donor yet. Register now!'}
              </span>
              <button onClick={() => navigate('/register')}>
                {lang === 'ml' ? 'രജിസ്റ്റർ ചെയ്യുക' : 'Register'}
              </button>
            </div>
          </div>
        </div>
      )}
      <header className={styles.hero}>
        <div className="container">
          <div className={styles.heroContent}>
            <h1>{t.hero.title}</h1>
            <p>{t.hero.subtitle}</p>
            
            <div className={styles.cta}>
              <button 
                className={styles.primaryBtn}
                onClick={() => navigate('/find')}
              >
                <Search size={20} />
                {t.hero.findBtn}
              </button>
              
              <button 
                className={styles.secondaryBtn}
                onClick={() => navigate('/register')}
              >
                <UserPlus size={20} />
                {t.hero.regBtn}
              </button>
            </div>
          </div>
        </div>
      </header>

      <section className={styles.howItWorks}>
        <div className="container">
          <h2 className={styles.sectionTitle}>{t.howItWorks.title}</h2>
          
          <div className={styles.steps}>
            <div className={styles.step}>
              <div className={`${styles.iconWrapper} ${styles.blue}`}>
                <UserPlus size={32} />
              </div>
              <h3>{t.howItWorks.step1.title}</h3>
              <p>{t.howItWorks.step1.desc}</p>
            </div>

            <div className={styles.step}>
              <div className={`${styles.iconWrapper} ${styles.red}`}>
                <Search size={32} />
              </div>
              <h3>{t.howItWorks.step2.title}</h3>
              <p>{t.howItWorks.step2.desc}</p>
            </div>

            <div className={styles.step}>
              <div className={`${styles.iconWrapper} ${styles.green}`}>
                <PhoneCall size={32} />
              </div>
              <h3>{t.howItWorks.step3.title}</h3>
              <p>{t.howItWorks.step3.desc}</p>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.stats}>
        <div className="container">
          <div className={styles.statCard}>
            <Heart size={40} className={styles.heartIcon} />
            <h3>Be a Hero</h3>
            <p>Your donation can save up to 3 lives.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
