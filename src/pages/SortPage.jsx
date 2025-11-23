import { useState, useEffect } from 'react';
import { getAllPrayerData } from '../services/api';
import { getDateKey, getArabicDate } from '../utils/dateUtils';
import PageNavigation from '../components/PageNavigation';
import './SortPage.css';

const PRAYERS = [
  'الفجر',
  'الظهر',
  'العصر',
  'المغرب',
  'العشاء'
];

export default function SortPage() {
  const [allData, setAllData] = useState({});
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    const data = await getAllPrayerData();
    setAllData(data);
    setLoading(false);
  };

  const handleStatusFilter = (status) => {
    if (selectedStatus === status) {
      setSelectedStatus(null);
    } else {
      setSelectedStatus(status);
    }
  };

  const getFilteredData = () => {
    if (!selectedStatus) return allData;

    const filtered = {};
    Object.keys(allData).forEach(dateKey => {
      const dayData = allData[dateKey];
      const hasMatchingStatus = Object.values(dayData).includes(selectedStatus);
      if (hasMatchingStatus) {
        filtered[dateKey] = dayData;
      }
    });

    return filtered;
  };

  const getStatusLabel = (status) => {
    switch(status) {
      case 1: return 'أديت الصلاة';
      case 2: return 'قضاء';
      case 3: return 'لم أصل';
      default: return '';
    }
  };

  const getStatusClass = (status) => {
    if (!status) return '';
    return `status-${status}`;
  };

  const filteredData = getFilteredData();
  const sortedDates = Object.keys(filteredData).sort().reverse(); // Most recent first

  return (
    <div className="sort-page">
      <div className="container">
        <PageNavigation />
        <div className="page-header">
          <h1 className="page-title">تصنيف الصلوات</h1>
          <p className="page-subtitle">عرض الصلوات حسب الحالة</p>
        </div>

        <div className="sort-controls">
          <button
            className={`sort-button status-1 ${selectedStatus === 1 ? 'active' : ''}`}
            onClick={() => handleStatusFilter(1)}
          >
            <span className="sort-color-dot status-1"></span>
            أديت الصلاة
          </button>
          <button
            className={`sort-button status-2 ${selectedStatus === 2 ? 'active' : ''}`}
            onClick={() => handleStatusFilter(2)}
          >
            <span className="sort-color-dot status-2"></span>
            قضاء
          </button>
          <button
            className={`sort-button status-3 ${selectedStatus === 3 ? 'active' : ''}`}
            onClick={() => handleStatusFilter(3)}
          >
            <span className="sort-color-dot status-3"></span>
            لم أصل
          </button>
          <button
            className={`sort-button ${selectedStatus === null ? 'active' : ''}`}
            onClick={() => handleStatusFilter(null)}
          >
            الكل
          </button>
        </div>

        {loading ? (
          <div className="loading">جاري التحميل...</div>
        ) : sortedDates.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📅</div>
            <p>لا توجد بيانات لعرضها</p>
          </div>
        ) : (
          <div className="sorted-days">
            {sortedDates.map(dateKey => {
              const dayData = filteredData[dateKey];
              const date = new Date(dateKey + 'T00:00:00');
              
              // Filter prayers by selected status if filter is active
              const prayersToShow = selectedStatus 
                ? PRAYERS.filter(prayer => dayData[prayer] === selectedStatus)
                : PRAYERS;

              if (prayersToShow.length === 0) return null;

              return (
                <div key={dateKey} className="day-card">
                  <div className="day-header">
                    <span className="day-date">{getArabicDate(date)}</span>
                  </div>
                  <div className="day-prayers">
                    {prayersToShow.map(prayer => {
                      const status = dayData[prayer];
                      if (selectedStatus && status !== selectedStatus) return null;
                      
                      return (
                        <div 
                          key={prayer} 
                          className={`day-prayer-item ${getStatusClass(status)}`}
                        >
                          <div className="prayer-name">{prayer}</div>
                          <div className="prayer-status-label">
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
        )}
      </div>
    </div>
  );
}

