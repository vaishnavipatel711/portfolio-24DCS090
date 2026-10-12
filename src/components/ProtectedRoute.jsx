import { Navigate } from 'react-router-dom';

// Wraps a page that needs a login. No token -> redirect to /login
// (the message is shown there as the "login prompt").
function ProtectedRoute({ token, children }) {
  if (!token) {
    return <Navigate to="/login" replace state={{ message: 'Please log in to view your tasks.' }} />;
  }
  return children;
}

export default ProtectedRoute;
