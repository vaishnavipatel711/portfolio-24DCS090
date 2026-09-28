function ErrorMessage({ message, onRetry }) {
  return (
    <div className="error-box" role="alert">
      <p>Something went wrong: {message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}

export default ErrorMessage;
