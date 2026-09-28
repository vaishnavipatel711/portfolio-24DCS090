import { useState } from 'react';

const MAX_LENGTH = 200;

function Contact() {
  // useState #2: controlled form input (Practical 2)
  const [message, setMessage] = useState('');
  // useState #3: toggles visibility of the help tooltip
  const [showHelp, setShowHelp] = useState(false);

  return (
    <section className="section">
      <h2>Contact</h2>

      <label htmlFor="message">Your message</label>
      <textarea
        id="message"
        rows="4"
        maxLength={MAX_LENGTH}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type something..."
      />
      <p className="muted">{message.length} / {MAX_LENGTH} characters</p>

      <button type="button" onClick={() => setShowHelp((s) => !s)}>
        {showHelp ? 'Hide help' : 'Show help'}
      </button>
      {showHelp && (
        <p className="tooltip">
          This is a controlled input: React state holds the value, and every keystroke updates it.
        </p>
      )}

      <h3>Live preview</h3>
      <p className="preview">{message || 'Nothing typed yet.'}</p>
    </section>
  );
}

export default Contact;
