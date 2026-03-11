export function LoadingSpinner({ message = "Loading..." }) {
  return (
    <div className="loading-spinner-container">
      <div className="spinner">
        <div className="spinner-circle"></div>
        <div className="spinner-circle"></div>
        <div className="spinner-circle"></div>
      </div>
      <p className="loading-text">{message}</p>
    </div>
  );
}

export function SkeletonLoader({ count = 3 }) {
  return (
    <div className="skeleton-loader">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="skeleton-item">
          <div className="skeleton-line"></div>
          <div className="skeleton-line"></div>
          <div className="skeleton-line short"></div>
        </div>
      ))}
    </div>
  );
}
