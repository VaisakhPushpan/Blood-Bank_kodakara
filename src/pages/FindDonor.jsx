import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { translations, bloodGroups } from '../utils/translations';
import { db } from '../firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import styles from '../styles/pages/FindDonor.module.css';
import { Phone, MessageCircle, Clock, CheckCircle2 } from 'lucide-react';

const FindDonor = () => {
  const { lang } = useLanguage();
  const t = translations[lang];

  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedGroup) {
      fetchDonors();
    }
  }, [selectedGroup]);

  const fetchDonors = async () => {
    setLoading(true);
    setDonors([]);
    try {
      const q = query(
        collection(db, 'donors'),
        where('bloodGroup', '==', selectedGroup)
      );
      const querySnapshot = await getDocs(q);
      const results = [];
      querySnapshot.forEach((doc) => {
        results.push({ id: doc.id, ...doc.data() });
      });
      setDonors(results);
    } catch (error) {
      console.error("Error fetching donors:", error);
    }
    setLoading(false);
  };

  const getUniqueLocations = () => {
    return [...new Set(donors.map(d => d.location))];
  };

  const checkAvailability = (lastDate) => {
    if (!lastDate) return { available: true };
    const last = new Date(lastDate);
    const now = new Date();
    const diffTime = Math.abs(now - last);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const COOLDOWN_DAYS = 90;

    if (diffDays >= COOLDOWN_DAYS) {
      return { available: true };
    } else {
      return { available: false, daysRemaining: COOLDOWN_DAYS - diffDays };
    }
  };

  const filteredDonors = donors.filter(donor => {
    const availability = checkAvailability(donor.lastDonationDate);
    const matchesLocation = selectedLocation === '' || donor.location === selectedLocation;
    const matchesAvailability = !showOnlyAvailable || availability.available;
    return matchesLocation && matchesAvailability;
  });

  return (
    <div className={`${styles.findDonor} container`}>
      <h2>{t.find.title}</h2>

      <div className={styles.filterGroup}>
        <select value={selectedGroup} onChange={(e) => setSelectedGroup(e.target.value)}>
          <option value="">{lang === 'ml' ? 'രക്തഗ്രൂപ്പ് തിരഞ്ഞെടുക്കുക' : 'Select Blood Group'}</option>
          {bloodGroups.map(bg => <option key={bg} value={bg}>{bg}</option>)}
        </select>

        {donors.length > 0 && (
          <>
            <select value={selectedLocation} onChange={(e) => setSelectedLocation(e.target.value)}>
              <option value="">{lang === 'ml' ? 'സ്ഥലം തിരഞ്ഞെടുക്കുക' : 'Select Location'}</option>
              {getUniqueLocations().map(loc => <option key={loc} value={loc}>{loc}</option>)}
            </select>

            <label className={styles.checkbox}>
              <input 
                type="checkbox" 
                checked={showOnlyAvailable} 
                onChange={(e) => setShowOnlyAvailable(e.target.checked)} 
              />
              {lang === 'ml' ? 'ലഭ്യമായവരെ മാത്രം കാണിക്കുക' : 'Show Available Only'}
            </label>
          </>
        )}
      </div>

      <div className={styles.results}>
        {loading ? (
          <p>{t.common.loading}</p>
        ) : filteredDonors.length > 0 ? (
          filteredDonors.map((donor, idx) => {
            const availability = checkAvailability(donor.lastDonationDate);
            return (
              <div key={idx} className={styles.card}>
                <div className={styles.cardHeader}>
                  <h3>{donor.name}</h3>
                  <span className={styles.badge}>{donor.bloodGroup}</span>
                </div>
                <p className={styles.address}>{donor.location}</p>

                <div className={`${styles.availability} ${availability.available ? styles.available : styles.cooldown}`}>
                  {availability.available ? (
                    <>
                      <CheckCircle2 size={16} />
                      <span>{t.form.availability.available}</span>
                    </>
                  ) : (
                    <>
                      <Clock size={16} />
                      <span>
                        {t.form.availability.onCooldown} - {t.form.availability.daysRemaining.replace('{days}', availability.daysRemaining)}
                      </span>
                    </>
                  )}
                </div>

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
            );
          })
        ) : selectedGroup ? (
          <p>{t.find.noResults}</p>
        ) : null}
      </div>
    </div>
  );

};

export default FindDonor;
