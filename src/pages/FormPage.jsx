import { useState, useEffect } from 'react';
import { getIraqDate, getDateKey, getArabicDate } from '../utils/dateUtils';
import { getPrayerData, savePrayerStatus } from '../services/api';
import PageNavigation from '../components/PageNavigation';
import './FormPage.css';

const PRAYERS = [
  'الفجر',
  'الظهر',
  'العصر',
  'المغرب',
  'العشاء'
];

export default function FormPage() {
  const [currentDate, setCurrentDate] = useState(getIraqDate());
  const [prayerData, setPrayerData] = useState({});
  const [selectedPrayer, setSelectedPrayer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPrayerData();
    
    // Check if new day has started (check every minute)
    const interval = setInterval(() => {
      const newDate = getIraqDate();
      const currentDateKey = getDateKey(currentDate);
      const newDateKey = getDateKey(newDate);
      
      if (currentDateKey !== newDateKey) {
        setCurrentDate(newDate);
        loadPrayerData();
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  const loadPrayerData = async () => {
    setLoading(true);
    const dateKey = getDateKey(getIraqDate());
    const data = await getPrayerData(dateKey);
    setPrayerData(data);
    setLoading(false);
  };

  const handlePrayerClick = (prayerName) => {
    setSelectedPrayer(prayerName);
  };

  const handleStatusSelect = async (status) => {
    if (!selectedPrayer) return;

    const dateKey = getDateKey(getIraqDate());
    await savePrayerStatus(dateKey, selectedPrayer, status);
    
    // Update local state
    setPrayerData(prev => ({
      ...prev,
      [selectedPrayer]: status
    }));
    
    setSelectedPrayer(null);
  };

  const closeModal = () => {
    setSelectedPrayer(null);
  };

  const getPrayerStatus = (prayerName) => {
    return prayerData[prayerName] || null;
  };

  return (
    <div className="form-page">
      <div className="container">
        <PageNavigation />
        <div className="page-header">
          <h1 className="page-title">تسجيل الصلوات</h1>
          <p className="page-subtitle">سجل صلواتك اليومية</p>
        </div>

        <div className="date-display">
          {getArabicDate(currentDate)}
        </div>

        {loading ? (
          <div className="loading">جاري التحميل...</div>
        ) : (
          <div className="prayer-form">
            <div className="prayer-grid">
              {PRAYERS.map((prayer) => {
                const status = getPrayerStatus(prayer);
                return (
                  <button
                    key={prayer}
                    className={`prayer-button ${status ? `status-${status}` : ''}`}
                    onClick={() => handlePrayerClick(prayer)}
                  >
                    <span className="prayer-label">{prayer}</span>
                    {status === 1 && <span className="status-icon">✓</span>}
                    {status === 2 && <span className="status-icon">⏳</span>}
                    {status === 3 && <span className="status-icon">✕</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {selectedPrayer && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content premium-modal" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={closeModal}>×</button>
              <div className="modal-header centered">
                <h2 className="modal-title primary">اختر حالة الصلاة</h2>
                <p className="modal-subtitle grey">{selectedPrayer}</p>
              </div>
              <div className="status-options centered-list">
                {[
                  { id: 1, label: 'أديت', class: 'status-1' },
                  { id: 2, label: 'قضاء', class: 'status-2' },
                  { id: 3, label: 'لم أصل', class: 'status-3' }
                ].map((option) => {
                  const isActive = getPrayerStatus(selectedPrayer) === option.id;
                  return (
                    <div 
                      key={option.id}
                      className={`status-pill ${isActive ? 'active' : ''}`}
                      onClick={() => handleStatusSelect(option.id)}
                    >
                      <span className="pill-label">{option.label}</span>
                      {isActive && <span className="pill-check">✓</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

