import { useState } from "react";

function Contact () {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setSent(true);
    setTimeout(() => setSent(false), 5000);
    setForm({ name: '', email: '', message: '' });
  };

  return (
    <div>
      <div className="container-lg" style={{ marginTop: '150px' }}>
        <div className="contactContent">
          <form className="contactForm" onSubmit={handleSubmit}>
            <h1>Contact Our Customer Care Team</h1>
            <p>We value your feedback. Please fill in the form below to send us your request.</p>
            {sent && <div className="alert alert-success">Message sent successfully! We'll get back to you soon.</div>}
            <fieldset>
              <label>Name *</label>
              <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
              <label>Email *</label>
              <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
              <label>Message *</label>
              <textarea value={form.message} onChange={e => setForm({...form, message: e.target.value})} required />
              <button type="submit">Send</button>
            </fieldset>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Contact;
