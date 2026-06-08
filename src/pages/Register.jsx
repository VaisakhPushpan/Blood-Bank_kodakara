import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { translations, bloodGroups } from '../utils/translations';
import { db } from '../firebase/config';
import { doc, setDoc } from 'firebase/firestore';
import styles from '../styles/pages/Register.module.css';

const Register = () => {
  const { user, loginWithGoogle } = useAuth();
  const { lang } = useLanguage();
  const t = translations[lang];

  const [formData, setFormData] = useState({
    name: user?.displayName || '',
    bloodGroup: '',
    address: '',
    phone: '',
    whatsapp: '',
  });

  const [status, setStatus] = useState({ type: '', message: '' });

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

  if (!user) {
    return (
      <div className={`${styles.register} container`}>
        <div className={styles.loginPrompt}>
          <h2>{t.form.title}</h2>
          <p>{t.common.loginWithGoogle}</p>
          <button onClick={loginWithGoogle} className={styles.googleBtn}>
            {t.common.loginWithGoogle}
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
          <label>{t.form.address}</label>
          <textarea 
            name="address" 
            value={formData.address} 
            onChange={handleChange} 
            required 
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
