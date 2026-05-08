import { useState, useEffect } from 'react';
import { getAllPrayerData, savePrayerStatus } from '../services/api';
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
  const [confirmModal, setConfirmModal] = useState(null); // { dateKey, prayer }

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    const data = await getAllPrayerData();
    setAllData(data);
    setLoading(false);
  };

  const handleMarkAsQadaa = async (dateKey, prayer) => {
    // Optimistic update
    setAllData(prev => ({
      ...prev,
      [dateKey]: {
        ...prev[dateKey],
        [prayer]: 2
      }
    }));

    try {
      const result = await savePrayerStatus(dateKey, prayer, 2);
      if (!result.success) {
        // If it failed and we didn't get a success response, we might want to reload
        // But the service handles fallbacks to localStorage, so it's usually fine
        console.error('Failed to save status:', result.error);
      }
    } catch (err) {
      console.error('Error marking as Qadaa:', err);
      // Reload data to sync if error occurs
      loadAllData();
    }
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

  const getCounts = () => {
    const counts = { 1: 0, 2: 0, 3: 0, total: 0 };
    Object.values(allData).forEach(dayData => {
      Object.values(dayData).forEach(status => {
        if (counts[status] !== undefined) {
          counts[status]++;
          counts.total++;
        }
      });
    });
    return counts;
  };

  const counts = getCounts();
  const filteredData = getFilteredData();
  const sortedDates = Object.keys(filteredData).sort().reverse(); // Most recent first

  return (
    <div className="sort-page">
      <div className="container">
        <PageNavigation />
        <div className="page-header centered-compact">
          <h1 className="page-title">تصنيف الصلوات</h1>
          <p className="page-subtitle light">عرض الصلوات حسب الحالة</p>
        </div>

        <div className="sort-segmented-control">
          <button
            className={`sort-pill ${selectedStatus === null ? 'active' : ''}`}
            onClick={() => setSelectedStatus(null)}
          >
            الكل <span className="count-badge">{counts.total}</span>
          </button>
          <button
            className={`sort-pill status-1 ${selectedStatus === 1 ? 'active' : ''}`}
            onClick={() => handleStatusFilter(1)}
          >
            أديت <span className="count-badge">{counts[1]}</span>
          </button>
          <button
            className={`sort-pill status-2 ${selectedStatus === 2 ? 'active' : ''}`}
            onClick={() => handleStatusFilter(2)}
          >
            قضاء <span className="count-badge">{counts[2]}</span>
          </button>
          <button
            className={`sort-pill status-3 ${selectedStatus === 3 ? 'active' : ''}`}
            onClick={() => handleStatusFilter(3)}
          >
            لم أصل <span className="count-badge">{counts[3]}</span>
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
                          className={`day-prayer-item ${getStatusClass(status)} ${status === 3 ? 'is-editable' : ''}`}
                          onClick={() => {
                            if (status === 3) {
                              setConfirmModal({ dateKey, prayer });
                            }
                          }}
                          title={status === 3 ? 'اضغط للتحويل إلى قضاء' : ''}
                        >
                          <div className="prayer-name">{prayer}</div>
                          {status === 1 && <span className="status-icon-mini">✓</span>}
                          {status === 2 && <span className="status-icon-mini">⏳</span>}
                          {status === 3 && <span className="status-icon-mini">✕</span>}
                          {status === 3 && <div className="edit-hint">اضغط للتحويل لقضاء</div>}
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

      {confirmModal && (
        <div className="modal-overlay" onClick={() => setConfirmModal(null)}>
          <div className="modal-content high-fidelity" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setConfirmModal(null)}>×</button>
            <div className="modal-header">
              <h2 className="modal-title">{confirmModal.prayer}</h2>
              <p className="modal-status">قضاء</p>
            </div>
            <div className="modal-body">
              <p>هل أنت متأكد من تحويل هذه الصلاة ليوم <br/> <strong>{getArabicDate(new Date(confirmModal.dateKey + 'T00:00:00'))}</strong>؟</p>
            </div>
            <div className="modal-footer">
              <button 
                className="btn-confirm-gradient" 
                onClick={() => {
                  handleMarkAsQadaa(confirmModal.dateKey, confirmModal.prayer);
                  setConfirmModal(null);
                }}
              >
                تأكيد
              </button>
              <button 
                className="btn-cancel-flat" 
                onClick={() => setConfirmModal(null)}
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

