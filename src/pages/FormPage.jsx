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
                    {prayer}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {selectedPrayer && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={closeModal}>×</button>
              <div className="modal-header">
                <h2 className="modal-title">اختر حالة الصلاة</h2>
                <p className="modal-subtitle">{selectedPrayer}</p>
              </div>
              <div className="status-options">
                <div 
                  className="status-option status-1"
                  onClick={() => handleStatusSelect(1)}
                >
                  <span className="status-color-dot status-1"></span>
                  <input 
                    type="checkbox" 
                    checked={getPrayerStatus(selectedPrayer) === 1}
                    readOnly
                  />
                  <label>أديت</label>
                </div>
                <div 
                  className="status-option status-2"
                  onClick={() => handleStatusSelect(2)}
                >
                  <span className="status-color-dot status-2"></span>
                  <input 
                    type="checkbox" 
                    checked={getPrayerStatus(selectedPrayer) === 2}
                    readOnly
                  />
                  <label>قضاء</label>
                </div>
                <div 
                  className="status-option status-3"
                  onClick={() => handleStatusSelect(3)}
                >
                  <span className="status-color-dot status-3"></span>
                  <input 
                    type="checkbox" 
                    checked={getPrayerStatus(selectedPrayer) === 3}
                    readOnly
                  />
                  <label>لم أصل</label>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

