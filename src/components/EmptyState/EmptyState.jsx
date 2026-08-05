import { FiInbox } from 'react-icons/fi';

function EmptyState({
  icon: Icon = FiInbox,
  title = 'Nothing here yet',
  description,
  action,
}) {
  return (
    <div className="gd-state-panel" role="status">
      <Icon className="gd-state-panel__icon" aria-hidden="true" />
      <h2 className="gd-mb-0">{title}</h2>
      {description && <p className="gd-mb-0">{description}</p>}
      {action}
    </div>
  );
}

export default EmptyState;
