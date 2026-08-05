import { Link } from 'react-router-dom';
import { FiChevronRight } from 'react-icons/fi';

function Breadcrumb({ items = [] }) {
  if (items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb">
      <ol className="gd-breadcrumb">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={item.path ?? item.label} className="d-flex align-items-center gd-gap-2">
              {index > 0 && <FiChevronRight className="gd-breadcrumb__separator" aria-hidden="true" size={14} />}
              {isLast || !item.path ? (
                <span className="gd-breadcrumb__current" aria-current={isLast ? 'page' : undefined}>
                  {item.label}
                </span>
              ) : (
                <Link to={item.path}>{item.label}</Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default Breadcrumb;
