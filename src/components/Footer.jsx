function Footer({ name, email }) {
  return (
    <footer className="footer">
      <p>Contact: {email}</p>
      <p>&copy; {new Date().getFullYear()} {name}. All rights reserved.</p>
    </footer>
  );
}

export default Footer;
