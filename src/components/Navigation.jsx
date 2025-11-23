import { Link } from 'react-router-dom';
import './Navigation.css';

export default function Navigation() {
  return (
    <nav className="nav">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          تطبيق الصلوات
        </Link>
      </div>
    </nav>
  );
}

