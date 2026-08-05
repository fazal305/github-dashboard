import { FiAlertTriangle } from 'react-icons/fi';

function ErrorState({
  title = 'Something went wrong',
  description = 'Please try again in a moment.',
  onRetry,
}) {
  return (
    <div className="gd-state-panel gd-state-panel--error" role="alert">
      <FiAlertTriangle className="gd-state-panel__icon" aria-hidden="true" />
      <h2 className="gd-mb-0">{title}</h2>
      <p className="gd-mb-0">{description}</p>
      {onRetry && (
        <button type="button" className="btn btn-outline-danger btn-sm" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}

export default ErrorState;
