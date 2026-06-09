import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { translations, bloodGroups } from '../utils/translations';
import { db } from '../firebase/config';
import { doc, getDoc, setDoc, collection, addDoc, query, where, orderBy, getDocs } from 'firebase/firestore';
import registerStyles from '../styles/pages/Register.module.css';
import profileStyles from '../styles/pages/Profile.module.css';
import { User, MapPin, Phone, MessageCircle, Save, History, Plus } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const { lang } = useLanguage();
  const t = translations[lang];

  const [formData, setFormData] = useState({
    name: '',
    bloodGroup: '',
    location: '',
    address: '',
    phone: '',
    whatsapp: '',
    lastDonationDate: '',
    hasMedicalConditions: 'no'
  });

  const [history, setHistory] = useState([]);
  const [newDonation, setNewDonation] = useState({ date: '', hospital: '' });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(true);
  const [isNewDonor, setIsNewDonor] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchHistory();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const docRef = doc(db, 'donors', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setFormData(prev => ({ ...prev, ...docSnap.data() }));
        setIsNewDonor(false);
      } else {
        setFormData(prev => ({ ...prev, name: user.displayName || '' }));
        setIsNewDonor(true);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const fetchHistory = async () => {
    try {
      const q = query(
        collection(db, 'donations'),
        where('userId', '==', user.uid),
        orderBy('date', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const historyData = [];
      querySnapshot.forEach((doc) => {
        historyData.push({ id: doc.id, ...doc.data() });
      });
      setHistory(historyData);
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNewDonationChange = (e) => {
    setNewDonation({ ...newDonation, [e.target.name]: e.target.value });
  };

  const toTitleCase = (str) => {
    if (!str) return '';
    return str.trim().toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const handleAddHistory = async (e) => {
    e.preventDefault();
    if (!newDonation.date) return;

    try {
      await addDoc(collection(db, 'donations'), {
        ...newDonation,
        userId: user.uid,
        createdAt: new Date().toISOString()
      });

      // Update lastDonationDate if this is the newest
      if (!formData.lastDonationDate || newDonation.date > formData.lastDonationDate) {
        await setDoc(doc(db, 'donors', user.uid), {
          ...formData,
          location: toTitleCase(formData.location),
          lastDonationDate: newDonation.date,
          updatedAt: new Date().toISOString()
        }, { merge: true });
        setFormData(prev => ({ ...prev, lastDonationDate: newDonation.date, location: toTitleCase(formData.location) }));
      }

      setNewDonation({ date: '', hospital: '' });
      fetchHistory();
      setStatus({ type: 'success', message: t.history.success });
      setTimeout(() => setStatus({ type: '', message: '' }), 3000);
    } catch (error) {
      console.error("Error adding history:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: 'loading', message: t.common.loading });

    try {
      const normalizedData = {
        ...formData,
        location: toTitleCase(formData.location),
        userId: user.uid,
        email: user.email,
        updatedAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'donors', user.uid), normalizedData);
      setStatus({ type: 'success', message: t.form.success });
      setFormData(normalizedData);
      setTimeout(() => setStatus({ type: '', message: '' }), 3000);
    } catch (error) {
      console.error(error);
      setStatus({ type: 'error', message: t.form.error });
    }
  };

  if (loading) return <div className="container"><p>{t.common.loading}</p></div>;

  return (
    <div className={`${profileStyles.profile} container`}>
      <form onSubmit={handleSubmit} className={registerStyles.form}>
        <h2>{lang === 'ml' ? 'പ്രൊഫൈൽ' : 'Profile'}</h2>
        
        {isNewDonor && (
          <div style={{
            backgroundColor: '#fee2e2', 
            padding: '1rem', 
            borderRadius: '8px', 
            marginBottom: '1.5rem',
            fontSize: '0.9rem',
            color: '#dc2626',
            fontWeight: '600',
            textAlign: 'center'
          }}>
            {lang === 'ml' 
              ? 'നിങ്ങൾ ദാതാവായി രജിസ്റ്റർ ചെയ്തിട്ടില്ല. ദയവായി വിവരങ്ങൾ നൽകുക.' 
              : 'You are not registered as a donor yet. Please provide your details.'}
          </div>
        )}
        
        <div className={registerStyles.field}>
          <label><User size={16} /> {t.form.name}</label>
          <input 
            type="text" 
            name="name" 
            value={formData.name} 
            onChange={handleChange} 
            required 
          />
        </div>

        <div className={registerStyles.field}>
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

        <div className={registerStyles.field}>
          <label><MapPin size={16} /> {t.form.location}</label>
          <input 
            type="text" 
            name="location" 
            value={formData.location || ''} 
            onChange={handleChange} 
            required 
          />
        </div>

        <div className={registerStyles.field}>
          <label><MapPin size={16} /> {t.form.address}</label>
          <textarea 
            name="address" 
            value={formData.address || ''} 
            onChange={handleChange} 
            required 
          />
        </div>

        <div className={registerStyles.field}>
          <label>💊 {t.form.medicalConditions}</label>
          <select 
            name="hasMedicalConditions" 
            value={formData.hasMedicalConditions || 'no'} 
            onChange={handleChange}
            required
          >
            <option value="no">{t.form.no}</option>
            <option value="yes">{t.form.yes}</option>
          </select>
        </div>

        <div className={registerStyles.field}>
          <label><Phone size={16} /> {t.form.phone}</label>
          <input 
            type="tel" 
            name="phone" 
            value={formData.phone} 
            onChange={handleChange} 
            required 
          />
        </div>

        <div className={registerStyles.field}>
          <label><MessageCircle size={16} /> {t.form.whatsapp}</label>
          <input 
            type="tel" 
            name="whatsapp" 
            value={formData.whatsapp} 
            onChange={handleChange} 
            required 
          />
        </div>

        <div className={registerStyles.field}>
          <label>📅 {t.form.lastDonation}</label>
          <input 
            type="date" 
            name="lastDonationDate" 
            value={formData.lastDonationDate || ''} 
            onChange={handleChange} 
          />
        </div>

        <button type="submit" className={registerStyles.submitBtn}>
          <Save size={20} /> {lang === 'ml' ? 'മാറ്റങ്ങൾ സേവ് ചെയ്യുക' : 'Save Changes'}
        </button>

        {status.message && (
          <p className={registerStyles[status.type]}>{status.message}</p>
        )}
      </form>

      <div className={profileStyles.historySection}>
        <h3><History size={20} /> {t.history.title}</h3>
        
        <form onSubmit={handleAddHistory} className={profileStyles.addHistoryForm}>
          <div>
            <label>{t.history.date}</label>
            <input 
              type="date" 
              name="date" 
              value={newDonation.date} 
              onChange={handleNewDonationChange} 
              required 
            />
          </div>
          <div>
            <label>{t.history.hospital}</label>
            <input 
              type="text" 
              name="hospital" 
              value={newDonation.hospital} 
              onChange={handleNewDonationChange} 
              placeholder="Hospital name..."
            />
          </div>
          <button type="submit" className={profileStyles.addBtn}>
            <Plus size={18} /> {t.history.addBtn}
          </button>
        </form>

        <div className={profileStyles.historyList}>
          {history.length > 0 ? (
            history.map(item => (
              <div key={item.id} className={profileStyles.historyItem}>
                <div className={profileStyles.historyInfo}>
                  <h4>{new Date(item.date).toLocaleDateString()}</h4>
                  {item.hospital && <p>{item.hospital}</p>}
                </div>
              </div>
            ))
          ) : (
            <p className={profileStyles.noHistory}>{t.history.noHistory}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
