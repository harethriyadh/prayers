import { Link, useLocation } from 'react-router-dom';
import './PageNavigation.css';

export default function PageNavigation() {
  const location = useLocation();

  return (
    <div className="page-navigation">
      <Link 
        to="/" 
        className={`page-nav-button ${location.pathname === '/' ? 'active' : ''}`}
      >
        اليوم
      </Link>
      <Link 
        to="/history" 
        className={`page-nav-button ${location.pathname === '/history' ? 'active' : ''}`}
      >
        آخر 7 أيام
      </Link>
      <Link 
        to="/sort" 
        className={`page-nav-button ${location.pathname === '/sort' ? 'active' : ''}`}
      >
        التصنيف
      </Link>
    </div>
  );
}

