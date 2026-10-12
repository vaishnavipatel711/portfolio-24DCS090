import { Link, useLocation } from 'react-router-dom';
import AuthForm from '../components/AuthForm';
import { loginUser } from '../api';

function Login({ onLoggedIn }) {
  // Messages such as "session expired" or "account created" arrive via router state
  const location = useLocation();

  return (
    <AuthForm
      title="Login"
      submitLabel="Login"
      notice={location.state?.message}
      onSubmit={async (email, password) => {
        const data = await loginUser(email, password); // throws on wrong password
        onLoggedIn(data);
      }}
      footer={
        <p className="muted">
          No account yet? <Link to="/register">Register</Link>
        </p>
      }
    />
  );
}

export default Login;
