import { formatCompactNumber } from '../../utils/formatters.js';

function StatisticsCards({ stats = [] }) {
  return (
    <div className="gd-stats-grid">
      {stats.map(({ id, label, value, icon: Icon }) => (
        <div key={id ?? label} className="gd-stat-card">
          <div className="d-flex align-items-center justify-content-between">
            <span className="gd-stat-card__label">{label}</span>
            {Icon && (
              <span className="gd-stat-card__icon">
                <Icon size={16} aria-hidden="true" />
              </span>
            )}
          </div>
          <span className="gd-stat-card__value">
            {typeof value === 'number' ? formatCompactNumber(value) : value}
          </span>
        </div>
      ))}
    </div>
  );
}

export default StatisticsCards;
