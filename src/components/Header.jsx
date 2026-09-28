function Header({ name, themeColor }) {
  return (
    <header style={{ backgroundColor: themeColor }} className="header">
      <h1>{name}'s Portfolio</h1>
      <p>Computer Science Engineering Student</p>
    </header>
  );
}

export default Header;
