import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { translations, bloodGroups } from '../utils/translations';
import { db } from '../firebase/config';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, onSnapshot, orderBy } from 'firebase/firestore';
import { AlertTriangle, Users, BarChart3, Trash2, Plus, Search, X, Phone, MessageCircle, Heart, User, LogOut } from 'lucide-react';
import styles from '../styles/pages/Admin.module.css';

const Admin = () => {
  const { isAdmin, user, loginWithEmail, logout } = useAuth();
  const { lang } = useLanguage();
  const t = translations[lang];

  const [donors, setDonors] = useState([]);
  const [stats, setStats] = useState({ total: 0, available: 0, unavailable: 0, byGroup: {} });
  const [alerts, setAlerts] = useState([]);
  const [newAlert, setNewAlert] = useState({ bloodGroup: '', hospital: '', contactName: '', contactPhone: '' });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDonor, setSelectedDonor] = useState(null);
  
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAdmin) {
      fetchData();
      const unsubscribeAlerts = onSnapshot(
        query(collection(db, 'alerts'), orderBy('createdAt', 'desc')),
        (snapshot) => {
          const alertsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setAlerts(alertsData);
        }
      );
      return () => unsubscribeAlerts();
    } else {
      setLoading(false);
    }
  }, [isAdmin]);

  const checkAvailability = (lastDate, hasMedicalConditions) => {
    if (hasMedicalConditions === 'yes') return { available: false, reason: 'medical' };
    if (!lastDate) return { available: true };
    const last = new Date(lastDate);
    const now = new Date();
    const diffDays = Math.ceil(Math.abs(now - last) / (1000 * 60 * 60 * 24));
    const COOLDOWN_DAYS = 90;
    return diffDays >= COOLDOWN_DAYS ? { available: true } : { available: false, reason: 'cooldown' };
  };

  const fetchData = async () => {
    try {
      const donorsSnap = await getDocs(collection(db, 'donors'));
      const donorsData = [];
      const groupCounts = {};
      bloodGroups.forEach(bg => groupCounts[bg] = 0);
      
      let avail = 0;
      let unavail = 0;

      donorsSnap.forEach(doc => {
        const data = { id: doc.id, ...doc.data() };
        const availability = checkAvailability(data.lastDonationDate, data.hasMedicalConditions);
        data.status = availability;
        
        donorsData.push(data);
        if (groupCounts[data.bloodGroup] !== undefined) groupCounts[data.bloodGroup]++;
        if (availability.available) avail++; else unavail++;
      });

      setDonors(donorsData);
      setStats({
        total: donorsData.length,
        available: avail,
        unavailable: unavail,
        byGroup: groupCounts
      });
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);
    try {
      const result = await loginWithEmail(loginData.email, loginData.password);
      if (!result.success) setLoginError(result.error);
    } catch (err) {
      setLoginError(err.message);
    } finally {
      setIsLoggingIn(false);
    }
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

  const handleLogout = () => {
    if (window.confirm(lang === 'ml' ? 'നിങ്ങൾക്ക് ലോഗൗട്ട് ചെയ്യണോ?' : 'Are you sure you want to logout?')) {
      logout();
    }
  };

  const filteredDonors = donors.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="container"><p>{t.common.loading}</p></div>;

  if (!isAdmin) {
    return (
      <div className={`${styles.loginContainer} container`}>
        <div className={styles.loginBox}>
          <h2>{lang === 'ml' ? 'അഡ്മിൻ ലോഗിൻ' : 'Admin Login'}</h2>
          <form onSubmit={handleAdminLogin}>
            <div className={styles.field}><label>Email</label><input type="email" name="email" value={loginData.email} onChange={(e) => setLoginData({...loginData, email: e.target.value})} required /></div>
            <div className={styles.field}><label>Password</label><input type="password" name="password" value={loginData.password} onChange={(e) => setLoginData({...loginData, password: e.target.value})} required /></div>
            {loginError && <p className={styles.error}>{loginError}</p>}
            <button type="submit" className={styles.submitBtn} disabled={isLoggingIn}>{isLoggingIn ? '...' : 'Login'}</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.admin} container`}>
      <div className={styles.headerRow}>
        <h1>{t.admin.title}</h1>
        <button onClick={handleLogout} className={styles.logoutBtn}>
          <LogOut size={18} />
          {lang === 'ml' ? 'ലോഗൗട്ട്' : 'Logout'}
        </button>
      </div>

      <div className={styles.summaryGrid}>
        <div className={`${styles.summaryCard} ${styles.blue}`}>
          <div className={styles.iconWrapper}><Users size={24} /></div>
          <div><h4>{t.admin.totalDonors}</h4><p>{stats.total}</p></div>
        </div>
        <div className={`${styles.summaryCard} ${styles.green}`}>
          <div className={styles.iconWrapper}><Users size={24} /></div>
          <div><h4>{t.admin.availableDonors}</h4><p>{stats.available}</p></div>
        </div>
        <div className={`${styles.summaryCard} ${styles.red}`}>
          <div className={styles.iconWrapper}><Users size={24} /></div>
          <div><h4>{t.admin.unavailableDonors}</h4><p>{stats.unavailable}</p></div>
        </div>
      </div>

      <section className={styles.section}>
        <h3><BarChart3 size={20} /> {t.admin.donorStats}</h3>
        <div className={styles.statsGrid}>
          {bloodGroups.map(bg => (
            <div key={bg} className={styles.statCard}><h4>{bg}</h4><p>{stats.byGroup[bg] || 0}</p></div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h3><Users size={20} /> {t.admin.donorList}</h3>
        <div className={styles.searchBar}>
          <Search className={styles.searchIcon} size={20} />
          <input type="text" placeholder={t.admin.searchPlaceholder} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div className={styles.tableContainer}>
          <table className={styles.donorTable}>
            <thead>
              <tr>
                <th>{t.form.name}</th>
                <th>{t.form.bloodGroup}</th>
                <th>{t.form.location}</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredDonors.map(donor => (
                <tr key={donor.id}>
                  <td>{donor.name}</td>
                  <td><strong>{donor.bloodGroup}</strong></td>
                  <td>{donor.location}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${donor.status.available ? styles.available : (donor.status.reason === 'medical' ? styles.medical : styles.cooldown)}`}>
                      {donor.status.available ? t.form.availability.available : (donor.status.reason === 'medical' ? t.admin.medicalReason : t.admin.cooldownReason)}
                    </span>
                  </td>
                  <td><button className={styles.viewBtn} onClick={() => setSelectedDonor(donor)}>{t.admin.viewDetails}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className={styles.section}>
        <h3><AlertTriangle size={20} /> {t.admin.manageAlerts}</h3>
        <form onSubmit={handleAddAlert} className={styles.alertForm}>
          <div className={styles.field}><label>{t.form.bloodGroup}</label><select name="bloodGroup" value={newAlert.bloodGroup} onChange={(e) => setNewAlert({...newAlert, bloodGroup: e.target.value})} required><option value="">Select</option>{bloodGroups.map(bg => <option key={bg} value={bg}>{bg}</option>)}</select></div>
          <div className={styles.field}><label>{t.urgentAlerts.hospital}</label><input type="text" value={newAlert.hospital} onChange={(e) => setNewAlert({...newAlert, hospital: e.target.value})} required /></div>
          <div className={styles.field}><label>{t.form.name}</label><input type="text" value={newAlert.contactName} onChange={(e) => setNewAlert({...newAlert, contactName: e.target.value})} required /></div>
          <div className={styles.field}><label>{t.form.phone}</label><input type="tel" value={newAlert.contactPhone} onChange={(e) => setNewAlert({...newAlert, contactPhone: e.target.value})} required /></div>
          <button type="submit" className={styles.submitBtn}>{t.admin.addAlert}</button>
        </form>
        <div className={styles.alertsList}>
          {alerts.map(alert => (
            <div key={alert.id} className={styles.alertItem}>
              <div><strong>{alert.bloodGroup}</strong> - {alert.hospital} ({alert.contactName})</div>
              <button onClick={() => handleDeleteAlert(alert.id)} className={styles.deleteBtn}><Trash2 size={18} /></button>
            </div>
          ))}
        </div>
      </section>

      {selectedDonor && (
        <div className={styles.modalOverlay} onClick={() => setSelectedDonor(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{selectedDonor.name}</h2>
              <button className={styles.closeBtn} onClick={() => setSelectedDonor(null)}><X size={24} /></button>
            </div>
            <div className={styles.modalContent}>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}><label>{t.form.bloodGroup}</label><p>{selectedDonor.bloodGroup}</p></div>
                <div className={styles.infoItem}><label>{t.form.location}</label><p>{selectedDonor.location}</p></div>
                <div className={styles.infoItem}><label>{t.form.phone}</label><p>{selectedDonor.phone}</p></div>
                <div className={styles.infoItem}><label>{t.form.whatsapp}</label><p>{selectedDonor.whatsapp}</p></div>
                <div className={styles.infoItem}><label>{t.form.lastDonation}</label><p>{selectedDonor.lastDonationDate || 'N/A'}</p></div>
                <div className={styles.infoItem}><label>{t.form.medicalConditions}</label><p>{selectedDonor.hasMedicalConditions === 'yes' ? t.form.yes : t.form.no}</p></div>
                <div className={styles.infoItem} style={{gridColumn: '1/-1'}}><label>{t.form.address}</label><p>{selectedDonor.address}</p></div>
              </div>
              <div className={styles.contactLinks}>
                <a href={`tel:${selectedDonor.phone}`} className={`${styles.modalActionBtn} ${styles.call}`}><Phone size={18} /> {t.find.call}</a>
                <a href={`https://wa.me/${selectedDonor.whatsapp}`} target="_blank" rel="noopener noreferrer" className={`${styles.modalActionBtn} ${styles.whatsapp}`}><MessageCircle size={18} /> {t.find.whatsapp}</a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
