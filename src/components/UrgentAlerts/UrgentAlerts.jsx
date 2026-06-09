import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useLanguage } from '../../context/LanguageContext';
import { translations } from '../../utils/translations';
import { AlertCircle, Phone, MapPin, Clock } from 'lucide-react';
import styles from '../../styles/components/UrgentAlerts.module.css';

const UrgentAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { lang } = useLanguage();
  const t = translations[lang];

  useEffect(() => {
    const q = query(
      collection(db, 'alerts'),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const alertsData = [];
      querySnapshot.forEach((doc) => {
        alertsData.push({ id: doc.id, ...doc.data() });
      });
      setAlerts(alertsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching alerts: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return null;
  if (alerts.length === 0) return null;

  return (
    <section className={styles.urgentSection}>
      <div className="container">
        <div className={styles.header}>
          <AlertCircle className={styles.icon} size={24} />
          <h2>{t.urgentAlerts.title}</h2>
        </div>
        
        <div className={styles.alertsGrid}>
          {alerts.map((alert) => (
            <div key={alert.id} className={styles.alertCard}>
              <div className={styles.bloodBadge}>{alert.bloodGroup}</div>
              <div className={styles.alertInfo}>
                <h3>{alert.bloodGroup} Required</h3>
                <p className={styles.hospital}>
                  <MapPin size={16} /> {alert.hospital}
                </p>
                <div className={styles.contactInfo}>
                  <p><strong>{t.urgentAlerts.contact}:</strong> {alert.contactName}</p>
                  <a href={`tel:${alert.contactPhone}`} className={styles.phoneBtn}>
                    <Phone size={16} /> {alert.contactPhone}
                  </a>
                </div>
                <p className={styles.timestamp}>
                  <Clock size={14} /> {t.urgentAlerts.posted}: {new Date(alert.createdAt?.seconds * 1000).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UrgentAlerts;
