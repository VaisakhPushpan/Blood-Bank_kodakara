import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { translations, bloodGroups } from '../utils/translations';
import { db } from '../firebase/config';
import { collection, query, getDocs } from 'firebase/firestore';
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
    fetchDonors();
  }, []);

  const fetchDonors = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'donors'));
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

  const toTitleCase = (str) => {
    if (!str) return '';
    return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const getUniqueLocations = () => {
    const relevantDonors = selectedGroup 
      ? donors.filter(d => d.bloodGroup === selectedGroup)
      : donors;
    const normalizedLocations = relevantDonors.map(d => toTitleCase(d.location));
    return [...new Set(normalizedLocations)].sort();
  };

  const checkAvailability = (lastDate, hasMedicalConditions) => {
    // If they have medical conditions, they are not available
    if (hasMedicalConditions === 'yes') return { available: false, isMedical: true };
    
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
    const availability = checkAvailability(donor.lastDonationDate, donor.hasMedicalConditions);
    const matchesGroup = selectedGroup === '' || donor.bloodGroup === selectedGroup;
    const matchesLocation = selectedLocation === '' || toTitleCase(donor.location) === selectedLocation;
    const matchesAvailability = !showOnlyAvailable || availability.available;
    return matchesGroup && matchesLocation && matchesAvailability;
  });

  return (
    <div className={`${styles.findDonor} container`}>
      <h2>{t.find.title}</h2>

      <div className={styles.filterGroup}>
        <select value={selectedGroup} onChange={(e) => {
          setSelectedGroup(e.target.value);
          setSelectedLocation(''); // Reset location when group changes
        }}>
          <option value="">{lang === 'ml' ? 'എല്ലാ രക്തഗ്രൂപ്പുകളും' : 'All Blood Groups'}</option>
          {bloodGroups.map(bg => <option key={bg} value={bg}>{bg}</option>)}
        </select>

        {donors.length > 0 && (
          <>
            <select value={selectedLocation} onChange={(e) => setSelectedLocation(e.target.value)}>
              <option value="">{lang === 'ml' ? 'എല്ലാ സ്ഥലങ്ങളും' : 'All Locations'}</option>
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
            const availability = checkAvailability(donor.lastDonationDate, donor.hasMedicalConditions);
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
                        {availability.isMedical ? (lang === 'ml' ? 'ആരോഗ്യപരമായ കാരണങ്ങളാൽ ലഭ്യല്ല' : 'Not available due to medical reasons') : `${t.form.availability.onCooldown} - ${t.form.availability.daysRemaining.replace('{days}', availability.daysRemaining)}`}
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
        ) : (
          <p>{t.find.noResults}</p>
        )}
      </div>
    </div>
  );

};

export default FindDonor;
