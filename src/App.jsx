import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import FormPage from './pages/FormPage';
import HistoryPage from './pages/HistoryPage';
import SortPage from './pages/SortPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Navigation />
        <Routes>
          <Route path="/" element={<FormPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/sort" element={<SortPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
