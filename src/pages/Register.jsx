import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { translations, bloodGroups } from '../utils/translations';
import { db } from '../firebase/config';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';
import styles from '../styles/pages/Register.module.css';
import { CheckCircle, ArrowRight } from 'lucide-react';

const Register = () => {
  const { user, loginWithGoogle } = useAuth();
  const { lang } = useLanguage();
  const t = translations[lang];
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: user?.displayName || '',
    bloodGroup: '',
    address: '',
    phone: '',
    whatsapp: '',
  });

  const [status, setStatus] = useState({ type: '', message: '' });
  const [isAlreadyDonor, setIsAlreadyDonor] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (user) {
      checkDonorStatus();
    } else {
      setChecking(false);
    }
  }, [user]);

  const checkDonorStatus = async () => {
    try {
      const docRef = doc(db, 'donors', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setIsAlreadyDonor(true);
      }
    } catch (error) {
      console.error(error);
    }
    setChecking(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    setStatus({ type: 'loading', message: t.common.loading });

    try {
      await setDoc(doc(db, 'donors', user.uid), {
        ...formData,
        userId: user.uid,
        email: user.email,
        updatedAt: new Date().toISOString(),
      });
      setStatus({ type: 'success', message: t.form.success });
    } catch (error) {
      console.error(error);
      setStatus({ type: 'error', message: t.form.error });
    }
  };

  if (checking) return <div className="container"><p>{t.common.loading}</p></div>;

  if (isAlreadyDonor) {
    return (
      <div className={`${styles.register} container`}>
        <div className={styles.loginPrompt}>
          <CheckCircle size={60} color="var(--success)" />
          <h2 style={{marginTop: '1rem'}}>
            {lang === 'ml' ? 'നിങ്ങൾ ഇതിനകം രജിസ്റ്റർ ചെയ്തിട്ടുണ്ട്' : 'You are already registered'}
          </h2>
          <p style={{margin: '1rem 0'}}>
            {lang === 'ml' ? 'നിങ്ങളുടെ വിവരങ്ങൾ മാറ്റാൻ പ്രൊഫൈലിൽ പോകുക.' : 'Go to your profile to edit your details.'}
          </p>
          <Link to="/profile" className={styles.submitBtn} style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'}}>
            {lang === 'ml' ? 'പ്രൊഫൈലിലേക്ക് പോകുക' : 'Go to Profile'}
            <ArrowRight size={20} />
          </Link>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={`${styles.register} container`}>
        <div className={styles.loginPrompt}>
          <h2>{t.form.title}</h2>
          <p>{lang === 'ml' ? 'തുടരുന്നതിന് ലോഗിൻ ചെയ്യുക' : 'Please login to continue'}</p>
          <button onClick={loginWithGoogle} className={styles.googleBtn}>
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" width="18" />
            <span>{t.common.loginWithGoogle}</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.register} container`}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <h2>{t.form.title}</h2>
        
        <div className={styles.field}>
          <label>{t.form.name}</label>
          <input 
            type="text" 
            name="name" 
            value={formData.name} 
            onChange={handleChange} 
            required 
          />
        </div>

        <div className={styles.field}>
          <label>{t.form.bloodGroup}</label>
          <select 
            name="bloodGroup" 
            value={formData.bloodGroup} 
            onChange={handleChange} 
            required
          >
            <option value="">{t.find.placeholder}</option>
            {bloodGroups.map(bg => (
              <option key={bg} value={bg}>{bg}</option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label>{t.form.location}</label>
          <input 
            type="text" 
            name="location" 
            value={formData.location} 
            onChange={handleChange} 
            required 
          />
        </div>

        <div className={styles.field}>
          <label>{t.form.address}</label>
          <textarea 
            name="address" 
            value={formData.address} 
            onChange={handleChange} 
            required 
          />
        </div>

        <div className={styles.field}>
          <label>{t.form.medicalConditions}</label>
          <textarea 
            name="medicalConditions" 
            value={formData.medicalConditions || ''} 
            onChange={handleChange} 
          />
        </div>

        <div className={styles.field}>
          <label>{t.form.phone}</label>
          <input 
            type="tel" 
            name="phone" 
            value={formData.phone} 
            onChange={handleChange} 
            required 
          />
        </div>

        <div className={styles.field}>
          <label>{t.form.whatsapp}</label>
          <input 
            type="tel" 
            name="whatsapp" 
            value={formData.whatsapp} 
            onChange={handleChange} 
            required 
          />
        </div>

        <button type="submit" className={styles.submitBtn}>
          {t.form.submit}
        </button>

        {status.message && (
          <p className={styles[status.type]}>{status.message}</p>
        )}
      </form>
    </div>
  );
};

export default Register;
