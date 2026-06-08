import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { translations, bloodGroups } from '../utils/translations';
import { db } from '../firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import styles from '../styles/pages/FindDonor.module.css';
import { Phone, MessageCircle } from 'lucide-react';

const FindDonor = () => {
  const { lang } = useLanguage();
  const t = translations[lang];

  const [selectedGroup, setSelectedGroup] = useState('');
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedGroup) {
      fetchDonors();
    }
  }, [selectedGroup]);

  const fetchDonors = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'donors'),
        where('bloodGroup', '==', selectedGroup)
      );
      const querySnapshot = await getDocs(q);
      const results = [];
      querySnapshot.forEach((doc) => {
        results.push(doc.data());
      });
      setDonors(results);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  return (
    <div className={`${styles.findDonor} container`}>
      <h2>{t.find.title}</h2>
      
      <div className={styles.filter}>
        <select 
          value={selectedGroup} 
          onChange={(e) => setSelectedGroup(e.target.value)}
        >
          <option value="">{t.find.placeholder}</option>
          {bloodGroups.map(bg => (
            <option key={bg} value={bg}>{bg}</option>
          ))}
        </select>
      </div>

      <div className={styles.results}>
        {loading ? (
          <p>{t.common.loading}</p>
        ) : donors.length > 0 ? (
          donors.map((donor, idx) => (
            <div key={idx} className={styles.card}>
              <div className={styles.cardHeader}>
                <h3>{donor.name}</h3>
                <span className={styles.badge}>{donor.bloodGroup}</span>
              </div>
              <p className={styles.address}>{donor.address}</p>
              
              <div className={styles.actions}>
                <a href={`tel:${donor.phone}`} className={styles.callBtn}>
                  <Phone size={18} />
                  {t.find.call}
                </a>
                <a 
                  href={`https://wa.me/${donor.whatsapp}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className={styles.whatsappBtn}
                >
                  <MessageCircle size={18} />
                  {t.find.whatsapp}
                </a>
              </div>
            </div>
          ))
        ) : selectedGroup ? (
          <p>{t.find.noResults}</p>
        ) : null}
      </div>
    </div>
  );
};

export default FindDonor;
