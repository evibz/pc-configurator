import React, { useState, useEffect, useRef } from 'react';
import emailjs from 'emailjs-com';
import jsPDF from 'jspdf';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const parts = {
  cpu: [
    { name: 'Intel i5', price: 150, img: 'https://www.primeabgb.com/wp-content/uploads/2024/07/AMD-Ryzen-9-5900XT-Processor-100-100001581WOF.jpg' },
    { name: 'Intel i7', price: 250, img: 'https://i.imgur.com/BROVt1m.png' },
    { name: 'Ryzen 5', price: 180, img: 'https://i.imgur.com/fW5Xt8x.png' },
  ],
  gpu: [
    { name: 'NVIDIA RTX 50900', price: 220, img: 'https://mdcomputers.in/cdn-cgi/image/width=500,height=500,quality=75/image/catalog/graphics%20card/asus/rog-astral-rtx5090-o32g-gaming/rog-astral-rtx5090-o32g-gaming-image-main0.webp' },
    { name: 'RTX 3060', price: 350, img: 'https://i.imgur.com/sVAJHlH.png' },
    { name: 'Integrated', price: 0, img: 'https://i.imgur.com/TIfnMRM.png' },
  ],
  ram: [
    { name: '8GB DDR4', price: 40, img: 'https://www.primeabgb.com/wp-content/uploads/2025/01/ADATA-XPG-Lancer-Blade-32GB-2x16GB-DDR5-5600MHz-Desktop-Memory-AX5U5600C4616G-DTLABBK.jpg' },
    { name: '16GB DDR4', price: 70, img: 'https://i.imgur.com/EztIfdn.png' },
    { name: '32GB DDR4', price: 120, img: 'https://i.imgur.com/EztIfdn.png' },
  ],
  storage: [
    { name: '256GB SSD', price: 40, img: 'https://www.primeabgb.com/wp-content/uploads/2023/10/EVM-1TB-NVMe-SSD-EVMNV-1TB.jpg' },
    { name: '512GB SSD', price: 70, img: 'https://i.imgur.com/3fO6RTs.png' },
    { name: '1TB HDD', price: 50, img: 'https://i.imgur.com/62nbSHG.png' },
  ],
};

function App() {
  const [theme, setTheme] = useState('light');
  const [selection, setSelection] = useState({
    cpu: parts.cpu[0],
    gpu: parts.gpu[0],
    ram: parts.ram[0],
    storage: parts.storage[0],
  });
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const configRef = useRef();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedBuild = params.get("build");

    if (sharedBuild) {
      try {
        const decoded = JSON.parse(decodeURIComponent(sharedBuild));
        setSelection({
          cpu: parts.cpu.find(p => p.name === decoded.cpu.name) || parts.cpu[0],
          gpu: parts.gpu.find(p => p.name === decoded.gpu.name) || parts.gpu[0],
          ram: parts.ram.find(p => p.name === decoded.ram.name) || parts.ram[0],
          storage: parts.storage.find(p => p.name === decoded.storage.name) || parts.storage[0],
        });
      } catch (e) {
        console.error("Invalid shared build");
      }
    } else {
      const saved = localStorage.getItem('myPCBuild');
      if (saved) {
        const parsed = JSON.parse(saved);
        setSelection({
          cpu: parts.cpu.find(p => p.name === parsed.cpu.name) || parts.cpu[0],
          gpu: parts.gpu.find(p => p.name === parsed.gpu.name) || parts.gpu[0],
          ram: parts.ram.find(p => p.name === parsed.ram.name) || parts.ram[0],
          storage: parts.storage.find(p => p.name === parsed.storage.name) || parts.storage[0],
        });
      }
    }
  }, []);

  const handleChange = (category, index) => {
    setSelection({ ...selection, [category]: parts[category][index] });
  };

  const handleSave = () => {
    localStorage.setItem('myPCBuild', JSON.stringify(selection));
    toast.success('✅ Build saved!');
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const totalPrice = Object.values(selection).reduce((sum, part) => sum + part.price, 0);

  const sendQuote = (e) => {
    e.preventDefault();
    const templateParams = {
      ...formData,
      build: JSON.stringify(selection, null, 2),
      price: totalPrice * 85,
    };
    emailjs.send('service_8a9z912', 'template_xda1b1k', templateParams, 'ZiiscXYs7IbbBzzIP')
      .then(() => toast.success('📧 Quote request sent!'))
      .catch((err) => toast.error('❌ Failed to send email: ' + err));
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("DIG Gamebox Helioz Configuration", 20, 20);

    let y = 40;
    Object.entries(selection).forEach(([category, part]) => {
      doc.text(`${category.toUpperCase()}: ${part.name} - ₹${part.price * 85}`, 20, y);
      y += 10;
    });

    doc.text(`\nTotal: ₹${totalPrice * 85}`, 20, y + 10);
    doc.save("pc-build.pdf");
    toast.success("📄 PDF downloaded");
  };

  const isMobileShareSupported = () =>
    typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  const handleShare = () => {
    const encoded = encodeURIComponent(JSON.stringify(selection));
    const url = `${window.location.origin}?build=${encoded}`;

    if (navigator.share) {
      navigator.share({
        title: 'DIG Gamebox Helioz Build',
        text: 'Check out my custom PC configuration!',
        url: url,
      })
        .then(() => toast.success('✅ Link shared!'))
        .catch((error) => toast.error('❌ Share failed: ' + error));
    } else {
      navigator.clipboard.writeText(url);
      toast.info("📋 Link copied to clipboard");
    }
  };

  return (
    <div style={{
      padding: 20,
      fontFamily: 'Arial',
      backgroundColor: theme === 'dark' ? '#121212' : '#f7f7f7',
      color: theme === 'dark' ? '#ffffff' : '#000000',
      minHeight: '100vh',
    }}>
      <img
        src="https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1080,h=869,fit=crop,trim=474.37100213219617;303.96588486140723;474.37100213219617;345.41577825159914/YX4za1K48Nf1lblw/picsart_24-02-20_14-58-20-811-mnl5q6WZMeI1L7zp.jpg"
        alt="Logo"
        style={{ width: 120, borderRadius: 8, marginBottom: 10 }}
      />

      <button onClick={toggleTheme}>
        Switch to {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
      </button>

      <h2 style={{ marginTop: 20 }}>🛠️ DIG Gamebox Helioz Configuration</h2>

      <div ref={configRef}>
        {Object.keys(parts).map((category) => (
          <div key={category} style={{ margin: '15px 0' }}>
            <label>{category.toUpperCase()}: </label>
            <select
              value={selection[category].name}
              onChange={(e) =>
                handleChange(
                  category,
                  parts[category].findIndex((item) => item.name === e.target.value)
                )
              }
            >
              {parts[category].map((item) => (
                <option key={item.name} value={item.name}>
                  {item.name} (${item.price})
                </option>
              ))}
            </select>
            <div style={{ marginTop: 5 }}>
              <img
                src={selection[category].img}
                alt={selection[category].name}
                style={{ width: '100px', borderRadius: 8 }}
              />
            </div>
          </div>
        ))}

        <h3>🧾 Selected Items:</h3>
        <ul style={{ paddingLeft: 20 }}>
          {Object.entries(selection).map(([category, part]) => (
            <li key={category}>
              <strong>{category.toUpperCase()}:</strong> {part.name} - ₹{part.price * 85}
            </li>
          ))}
        </ul>

        <h3>Total Price: ₹{totalPrice * 85}</h3>
      </div>

      <div style={{ marginTop: 20 }}>
        <button onClick={handleSave} style={{ padding: '10px 20px' }}>💾 Save Build</button>
        <button onClick={exportToPDF} style={{ padding: '10px 20px', marginLeft: 10 }}>📄 Export PDF</button>
        <button onClick={handleShare} style={{ padding: '10px 20px', marginLeft: 10 }}>
          {isMobileShareSupported() ? '📲 Share Link' : '🔗 Copy Link'}
        </button>
      </div>

      <hr style={{ margin: '30px 0' }} />
      <h3>📨 Request a Quote</h3>
      <form onSubmit={sendQuote} style={{ maxWidth: 400 }}>
        <input
          type="text"
          placeholder="Name"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          style={{ width: '100%', padding: 8, marginBottom: 10 }}
        />
        <input
          type="email"
          placeholder="Email"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          style={{ width: '100%', padding: 8, marginBottom: 10 }}
        />
        <input
          type="text"
          placeholder="Phone"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          style={{ width: '100%', padding: 8, marginBottom: 10 }}
        />
        <textarea
          placeholder="Message"
          rows="3"
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          style={{ width: '100%', padding: 8, marginBottom: 10 }}
        />
        <button type="submit" style={{ padding: '10px 20px' }}>📨 Send Request</button>
      </form>

      <ToastContainer position="bottom-right" autoClose={3000} theme={theme} />
    </div>
  );
}

export default App;
