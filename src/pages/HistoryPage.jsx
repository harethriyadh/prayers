import { useState, useEffect } from 'react';
import { getPrevious7Days, getDateKey, getArabicDate, isToday } from '../utils/dateUtils';
import { getPrayerDataForDates } from '../services/api';
import PageNavigation from '../components/PageNavigation';
import './HistoryPage.css';

const PRAYERS = [
  'الفجر',
  'الظهر',
  'العصر',
  'المغرب',
  'العشاء'
];

export default function HistoryPage() {
  const [daysData, setDaysData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistoryData();
  }, []);

  const loadHistoryData = async () => {
    setLoading(true);
    const days = getPrevious7Days();
    const dateKeys = days.map(day => getDateKey(day));
    const data = await getPrayerDataForDates(dateKeys);
    setDaysData(data);
    setLoading(false);
  };

  const getPrayerStatus = (dateKey, prayerName) => {
    return daysData[dateKey]?.[prayerName] || null;
  };

  const getStatusClass = (status) => {
    if (!status) return '';
    return `status-${status}`;
  };

  const getStatusLabel = (status) => {
    switch(status) {
      case 1: return '✓';
      case 2: return '⚠';
      case 3: return '✗';
      default: return '';
    }
  };

  const days = getPrevious7Days().reverse();

  return (
    <div className="history-page">
      <div className="container">
        <PageNavigation />
        <div className="page-header">
          <h1 className="page-title">آخر 7 أيام</h1>
          <p className="page-subtitle">عرض سجل الصلوات للأسبوع الماضي</p>
        </div>

        {loading ? (
          <div className="loading">جاري التحميل...</div>
        ) : (
          <div className="history-container">
            <div className="days-grid">
              {days.map((day, index) => {
                const dateKey = getDateKey(day);
                const dayData = daysData[dateKey] || {};
                const today = isToday(day);
                
                return (
                  <div key={dateKey} className={`day-card ${today ? 'today' : ''}`}>
                    <div className="day-header">
                      <span className="day-date">
                        {getArabicDate(day)}
                        {today && <span className="today-badge">اليوم</span>}
                      </span>
                    </div>
                    <div className="day-prayers">
                      {PRAYERS.map((prayer) => {
                        const status = getPrayerStatus(dateKey, prayer);
                        return (
                          <div 
                            key={prayer} 
                            className={`day-prayer-item ${getStatusClass(status)}`}
                          >
                            <div className="prayer-name">{prayer}</div>
                            <div className="prayer-status">
                              {getStatusLabel(status)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

