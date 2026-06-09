import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { translations, bloodGroups } from '../utils/translations';
import { db } from '../firebase/config';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, onSnapshot, orderBy } from 'firebase/firestore';
import { AlertTriangle, Users, BarChart3, Trash2, Plus } from 'lucide-react';
import styles from '../styles/pages/Admin.module.css';

const Admin = () => {
  const { isAdmin, user } = useAuth();
  const { lang } = useLanguage();
  const t = translations[lang];

  const [stats, setStats] = useState({});
  const [alerts, setAlerts] = useState([]);
  const [newAlert, setNewAlert] = useState({
    bloodGroup: '',
    hospital: '',
    contactName: '',
    contactPhone: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAdmin) {
      fetchStats();
      const unsubscribeAlerts = onSnapshot(
        query(collection(db, 'alerts'), orderBy('createdAt', 'desc')),
        (snapshot) => {
          const alertsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setAlerts(alertsData);
        }
      );
      return () => unsubscribeAlerts();
    }
  }, [isAdmin]);

  const fetchStats = async () => {
    try {
      const donorsSnap = await getDocs(collection(db, 'donors'));
      const counts = {};
      bloodGroups.forEach(bg => counts[bg] = 0);
      donorsSnap.forEach(doc => {
        const bg = doc.data().bloodGroup;
        if (counts[bg] !== undefined) counts[bg]++;
      });
      setStats(counts);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleAlertChange = (e) => {
    setNewAlert({ ...newAlert, [e.target.name]: e.target.value });
  };

  const handleAddAlert = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'alerts'), {
        ...newAlert,
        isActive: true,
        createdAt: new Date(),
        createdBy: user.uid
      });
      setNewAlert({ bloodGroup: '', hospital: '', contactName: '', contactPhone: '' });
    } catch (error) {
      console.error("Error adding alert:", error);
    }
  };

  const handleDeleteAlert = async (id) => {
    try {
      await deleteDoc(doc(db, 'alerts', id));
    } catch (error) {
      console.error("Error deleting alert:", error);
    }
  };

  if (!isAdmin) {
    return (
      <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
        <h2>Access Denied</h2>
        <p>You do not have permission to view this page.</p>
      </div>
    );
  }

  return (
    <div className={`${styles.admin} container`}>
      <h1>{t.admin.title}</h1>

      <section className={styles.section}>
        <h3><BarChart3 size={20} /> {t.admin.donorStats}</h3>
        <div className={styles.statsGrid}>
          {bloodGroups.map(bg => (
            <div key={bg} className={styles.statCard}>
              <h4>{bg}</h4>
              <p>{stats[bg] || 0}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h3><AlertTriangle size={20} /> {t.admin.manageAlerts}</h3>
        
        <form onSubmit={handleAddAlert} className={styles.alertForm}>
          <div className={styles.field}>
            <label>{t.form.bloodGroup}</label>
            <select name="bloodGroup" value={newAlert.bloodGroup} onChange={handleAlertChange} required>
              <option value="">Select</option>
              {bloodGroups.map(bg => <option key={bg} value={bg}>{bg}</option>)}
            </select>
          </div>
          <div className={styles.field}>
            <label>{t.urgentAlerts.hospital}</label>
            <input type="text" name="hospital" value={newAlert.hospital} onChange={handleAlertChange} required />
          </div>
          <div className={styles.field}>
            <label>{t.form.name}</label>
            <input type="text" name="contactName" value={newAlert.contactName} onChange={handleAlertChange} required />
          </div>
          <div className={styles.field}>
            <label>{t.form.phone}</label>
            <input type="tel" name="contactPhone" value={newAlert.contactPhone} onChange={handleAlertChange} required />
          </div>
          <button type="submit" className={styles.submitBtn}>
            <Plus size={18} /> {t.admin.addAlert}
          </button>
        </form>

        <div className={styles.alertsList}>
          {alerts.map(alert => (
            <div key={alert.id} className={styles.alertItem}>
              <div>
                <strong>{alert.bloodGroup}</strong> - {alert.hospital} ({alert.contactName})
              </div>
              <button onClick={() => handleDeleteAlert(alert.id)} className={styles.deleteBtn}>
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Admin;
