// API service for prayer data
// In production, replace with actual API endpoint

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Store data in localStorage as fallback (for demo purposes)
const STORAGE_KEY = 'prayers_data';

// Get all data from storage
function getStoredData() {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : {};
}

// Save data to storage
function saveStoredData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// Save prayer status
export async function savePrayerStatus(dateKey, prayerName, status) {
  try {
    const data = getStoredData();
    
    if (!data[dateKey]) {
      data[dateKey] = {};
    }
    
    data[dateKey][prayerName] = status;
    saveStoredData(data);
    
    // In production, also send to API
    // await fetch(`${API_BASE_URL}/prayers`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ date: dateKey, prayer: prayerName, status })
    // });
    
    return { success: true };
  } catch (error) {
    console.error('Error saving prayer status:', error);
    return { success: false, error };
  }
}

// Get prayer data for a specific date
export async function getPrayerData(dateKey) {
  try {
    const data = getStoredData();
    return data[dateKey] || {};
    
    // In production, fetch from API
    // const response = await fetch(`${API_BASE_URL}/prayers/${dateKey}`);
    // return await response.json();
  } catch (error) {
    console.error('Error fetching prayer data:', error);
    return {};
  }
}

// Get prayer data for multiple dates
export async function getPrayerDataForDates(dateKeys) {
  try {
    const data = getStoredData();
    const result = {};
    
    dateKeys.forEach(dateKey => {
      result[dateKey] = data[dateKey] || {};
    });
    
    return result;
  } catch (error) {
    console.error('Error fetching prayer data for dates:', error);
    return {};
  }
}

// Get all prayer data
export async function getAllPrayerData() {
  try {
    return getStoredData();
  } catch (error) {
    console.error('Error fetching all prayer data:', error);
    return {};
  }
}

