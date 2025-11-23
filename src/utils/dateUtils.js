// Get current date in Iraq timezone (Asia/Baghdad)
export function getIraqDate() {
  const now = new Date();
  const iraqDate = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Baghdad" }));
  return iraqDate;
}

// Format date as YYYY-MM-DD for API
export function formatDateForAPI(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Get Arabic date string - day name in text, rest as numbers
export function getArabicDate(date) {
  const arabicDays = [
    'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'
  ];
  
  const day = arabicDays[date.getDay()];
  const dayNum = date.getDate();
  const month = date.getMonth() + 1; // Month as number (1-12)
  const year = date.getFullYear();
  
  return `${day}، ${dayNum}/${month}/${year}`;
}

// Get date key for storage (YYYY-MM-DD)
export function getDateKey(date) {
  return formatDateForAPI(date);
}

// Get previous 7 days
export function getPrevious7Days() {
  const days = [];
  const today = getIraqDate();
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    days.push(date);
  }
  
  return days;
}

// Check if date is today in Iraq timezone
export function isToday(date) {
  const today = getIraqDate();
  return formatDateForAPI(date) === formatDateForAPI(today);
}

