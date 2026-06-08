import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { translations, bloodGroups } from '../utils/translations';
import { db } from '../firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import styles from '../styles/pages/Register.module.css'; // Reusing Register styles
import { User, MapPin, Phone, MessageCircle, Save } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const { lang } = useLanguage();
  const t = translations[lang];

  const [formData, setFormData] = useState({
    name: '',
    bloodGroup: '',
    address: '',
    phone: '',
    whatsapp: '',
    lastDonationDate: '',
  });

  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(true);
  const [isNewDonor, setIsNewDonor] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const docRef = doc(db, 'donors', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setFormData(docSnap.data());
        setIsNewDonor(false);
      } else {
        setFormData(prev => ({ ...prev, name: user.displayName || '' }));
        setIsNewDonor(true);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: 'loading', message: t.common.loading });

    try {
      await setDoc(doc(db, 'donors', user.uid), {
        ...formData,
        userId: user.uid,
        email: user.email,
        updatedAt: new Date().toISOString(),
      });
      setStatus({ type: 'success', message: t.form.success });
      setTimeout(() => setStatus({ type: '', message: '' }), 3000);
    } catch (error) {
      console.error(error);
      setStatus({ type: 'error', message: t.form.error });
    }
  };

  if (loading) return <div className="container"><p>{t.common.loading}</p></div>;

  return (
    <div className={`${styles.register} container`}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <h2>{lang === 'ml' ? 'പ്രൊഫൈൽ' : 'Profile'}</h2>
        
        {isNewDonor && (
          <div style={{
            backgroundColor: 'var(--primary-light)', 
            padding: '1rem', 
            borderRadius: '8px', 
            marginBottom: '1.5rem',
            fontSize: '0.9rem',
            color: 'var(--primary)',
            fontWeight: '600',
            textAlign: 'center'
          }}>
            {lang === 'ml' 
              ? 'നിങ്ങൾ ദാതാവായി രജിസ്റ്റർ ചെയ്തിട്ടില്ല. ദയവായി വിവരങ്ങൾ നൽകുക.' 
              : 'You are not registered as a donor yet. Please provide your details.'}
          </div>
        )}
        
        <div className={styles.field}>
          <label><User size={16} /> {t.form.name}</label>
          <input 
            type="text" 
            name="name" 
            value={formData.name} 
            onChange={handleChange} 
            required 
          />
        </div>

        <div className={styles.field}>
          <label>🩸 {t.form.bloodGroup}</label>
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
          <label><MapPin size={16} /> {t.form.location}</label>
          <input 
            type="text" 
            name="location" 
            value={formData.location || ''} 
            onChange={handleChange} 
            required 
          />
        </div>

        <div className={styles.field}>
          <label><MapPin size={16} /> {t.form.address}</label>
          <textarea 
            name="address" 
            value={formData.address || ''} 
            onChange={handleChange} 
            required 
          />
        </div>

        <div className={styles.field}>
          <label><Phone size={16} /> {t.form.phone}</label>
          <input 
            type="tel" 
            name="phone" 
            value={formData.phone} 
            onChange={handleChange} 
            required 
          />
        </div>

        <div className={styles.field}>
          <label><MessageCircle size={16} /> {t.form.whatsapp}</label>
          <input 
            type="tel" 
            name="whatsapp" 
            value={formData.whatsapp} 
            onChange={handleChange} 
            required 
          />
        </div>

        <div className={styles.field}>
          <label>📅 {t.form.lastDonation}</label>
          <input 
            type="date" 
            name="lastDonationDate" 
            value={formData.lastDonationDate || ''} 
            onChange={handleChange} 
          />
        </div>

        <button type="submit" className={styles.submitBtn}>
          <Save size={20} /> {lang === 'ml' ? 'മാറ്റങ്ങൾ സേവ് ചെയ്യുക' : 'Save Changes'}
        </button>

        {status.message && (
          <p className={styles[status.type]}>{status.message}</p>
        )}
      </form>
    </div>
  );
};

export default Profile;
