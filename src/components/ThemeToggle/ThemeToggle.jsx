import { HiOutlineSun, HiOutlineMoon } from 'react-icons/hi';
import './ThemeToggle.css';

export default function ThemeToggle({ isDarkMode, onToggle }) {
  return (
    <button 
      className={`theme-toggle ${isDarkMode ? 'theme-toggle--dark' : 'theme-toggle--light'}`}
      onClick={onToggle}
      aria-label="Toggle Theme"
    >
      <div className="theme-toggle__icon">
        {isDarkMode ? <HiOutlineMoon /> : <HiOutlineSun />}
      </div>
      <span className="theme-toggle__label">{isDarkMode ? 'Dark' : 'Light'}</span>
    </button>
  );
}
