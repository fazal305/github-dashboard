import { FiSun, FiMoon, FiMonitor } from 'react-icons/fi';
import { useThemeContext } from '../../context/ThemeContext.jsx';
import { THEME_MODES } from '../../utils/constants.js';

const OPTIONS = [
  { mode: THEME_MODES.LIGHT, label: 'Light theme', Icon: FiSun },
  { mode: THEME_MODES.DARK, label: 'Dark theme', Icon: FiMoon },
  { mode: THEME_MODES.AUTO, label: 'Match system theme', Icon: FiMonitor },
];

function ThemeSwitcher() {
  const { theme, setTheme } = useThemeContext();

  return (
    <div className="gd-theme-switcher" role="group" aria-label="Theme preference">
      {OPTIONS.map(({ mode, label, Icon }) => (
        <button
          key={mode}
          type="button"
          className={`gd-theme-switcher__option${theme === mode ? ' gd-theme-switcher__option--active' : ''}`}
          aria-pressed={theme === mode}
          aria-label={label}
          title={label}
          onClick={() => setTheme(mode)}
        >
          <Icon size={15} aria-hidden="true" />
        </button>
      ))}
    </div>
  );
}

export default ThemeSwitcher;
