import { Link, useNavigate } from 'react-router-dom';
import AuthForm from '../components/AuthForm';
import { registerUser } from '../api';

function Register() {
  const navigate = useNavigate();

  return (
    <AuthForm
      title="Register"
      submitLabel="Register"
      onSubmit={async (email, password) => {
        await registerUser(email, password);
        navigate('/login', { state: { message: 'Account created. Please log in.' } });
      }}
      footer={
        <p className="muted">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      }
    />
  );
}

export default Register;
