import { useEffect, useState } from 'react';

const DEFAULT_DELAY_MS = 200;

function Loader({ fullScreen = true, delay = DEFAULT_DELAY_MS, label = 'Loading…' }) {
  const [visible, setVisible] = useState(delay === 0);

  useEffect(() => {
    if (delay === 0) return undefined;
    const timerId = window.setTimeout(() => setVisible(true), delay);
    return () => window.clearTimeout(timerId);
  }, [delay]);

  if (!visible) return null;

  if (fullScreen) {
    return (
      <div className="gd-loader-overlay" role="status" aria-live="polite" aria-label={label}>
        <div className="gd-spinner" aria-hidden="true" />
        <span className="visually-hidden">{label}</span>
      </div>
    );
  }

  return (
    <span className="d-inline-flex align-items-center gd-gap-2" role="status" aria-live="polite">
      <span className="gd-spinner gd-spinner--inline" aria-hidden="true" />
      <span className="visually-hidden">{label}</span>
    </span>
  );
}

export default Loader;
