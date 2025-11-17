import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import '../styles/landing.css';

const ease = [0.22, 1, 0.36, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease } },
};

const fade = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6, ease } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const pop = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease } },
};

export default function Landing() {
  return (
    <div className="landing">
      {/* Top navigation */}
      <motion.header className="nav" initial="hidden" animate="visible" variants={fade}>
        <div className="container nav-inner">
          <Link to="/" className="nav-brand">
            <img src="/logo.png" alt="MoneyMate" className="brand-logo" />
            <span className="brand-text">MoneyMate</span>
          </Link>
          <nav className="nav-links">
            <a href="#features" className="nav-link">Features</a>
            <a href="#modules" className="nav-link">Modules</a>
            <a href="#pricing" className="nav-link">Pricing</a>
            <a href="#faq" className="nav-link">FAQ</a>
          </nav>
          <div className="nav-cta">
            <Link to="/login" className="btn btn-link">Sign in</Link>
            <Link to="/register" className="btn btn-primary">Start free trial</Link>
          </div>
        </div>
      </motion.header>

      {/* Hero section */}
      <section className="hero">
        <div className="container">
          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <motion.h1 className="hero-title" variants={fadeUp}>
              Manage money. Grow faster.
            </motion.h1>
            <motion.p className="hero-subtitle" variants={fadeUp}>
              MoneyMate is your all‑in‑one management software for finance, billing, analytics,
              and operations — built for modern teams that want clarity and control.
            </motion.p>
            <motion.div className="hero-actions" variants={fadeUp}>
              <Link to="/register" className="btn btn-primary btn-lg">Get started</Link>
              <a href="#demo" className="btn btn-secondary btn-lg">Watch demo</a>
            </motion.div>
            <motion.div className="hero-media" variants={pop}>
              <img src="/over-view.png" alt="Product preview" className="hero-image" />
              <div className="hero-media-overlays">
                <motion.img src="/qr-code.png" alt="QR" className="hero-badge" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.5, ease }} />
                <motion.img src="/upload-file.svg" alt="Upload" className="hero-badge right" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.5, ease }} />
              </div>
            </motion.div>
            <motion.div className="hero-trust" variants={fade}>
              <span>Trusted by teams worldwide</span>
              <div className="trust-logos">
                <img src="/hostaway.png" alt="Hostaway" />
                <img src="/logo.png" alt="Brand" />
                <img src="/hostaway.png" alt="Hostaway" />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Feature grid */}
      <section id="features" className="features">
        <div className="container">
          <motion.h2 className="section-title" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            Everything you need in one place
          </motion.h2>
          <motion.div className="feature-grid" variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            {[
              { title: 'Smart Billing', desc: 'Automate invoices, taxes, and reminders with flexible workflows.' },
              { title: 'Expense Tracking', desc: 'Categorize expenses, set budgets, and monitor spend in real‑time.' },
              { title: 'Cash Flow', desc: 'Forecast inflows and outflows with bank‑grade reconciliation.' },
              { title: 'Analytics', desc: 'Understand performance with customizable dashboards and reports.' },
              { title: 'Approvals', desc: 'Streamline approvals with roles, policies, and audit trails.' },
              { title: 'Integrations', desc: 'Connect accounting, CRM, and payments with plug‑and‑play APIs.' },
            ].map((f, idx) => (
              <motion.div key={f.title} className="feature-card" variants={pop} whileHover={{ y: -4 }} transition={{ type: 'spring', stiffness: 260, damping: 20 }}>
                <div className="feature-icon" aria-hidden="true">{idx + 1}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="stats">
        <div className="container stats-grid">
          {[
            { kpi: '12k+', label: 'Active businesses' },
            { kpi: '98%', label: 'Invoice success rate' },
            { kpi: '3x', label: 'Faster month‑end close' },
            { kpi: '$1.2B', label: 'Processed annually' },
          ].map((s) => (
            <motion.div key={s.label} className="stat-card" initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, ease }}>
              <div className="stat-kpi">{s.kpi}</div>
              <div className="stat-label">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Modules */}
      <section id="modules" className="modules">
        <div className="container">
          <motion.h2 className="section-title" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            Modules that scale with you
          </motion.h2>
          <motion.div className="module-grid" variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            {[
              { title: 'Receivables', desc: 'Quotes, invoices, payments, reminders.' },
              { title: 'Payables', desc: 'Bills, approvals, vendor management.' },
              { title: 'Banking', desc: 'Reconciliation, feeds, cash positioning.' },
              { title: 'Assets', desc: 'Depreciation, schedules, reporting.' },
              { title: 'Payroll', desc: 'Employees, runs, taxes, filings.' },
              { title: 'Insights', desc: 'KPIs, cohorts, trends, forecasting.' },
            ].map((m) => (
              <motion.div key={m.title} className="module-card" variants={pop} whileHover={{ scale: 1.02 }}>
                <h3>{m.title}</h3>
                <p>{m.desc}</p>
                <div className="module-cta">
                  <Link to="/register" className="btn btn-ghost">Try this module</Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="pricing">
        <div className="container">
          <motion.h2 className="section-title" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            Flexible plans that reward commitment
          </motion.h2>
          <motion.div className="pricing-grid" variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            {[
              {
                name: 'Quarterly',
                price: '$69',
                suffix: 'per quarter',
                save: 'Save 10% vs monthly',
                equiv: '$23.00/mo',
                note: 'Great for trying MoneyMate with meaningful savings.',
                cta: 'Choose Quarterly',
                featured: false,
              },
              {
                name: '6 Months',
                price: '$120',
                suffix: 'per 6 months',
                save: 'Save 20% vs monthly',
                equiv: '$20.00/mo',
                note: 'Ideal for growing teams scaling finance operations.',
                cta: 'Choose 6 Months',
                featured: true,
              },
              {
                name: '1 Year',
                price: '$220',
                suffix: 'per year',
                save: 'Save 35% vs monthly',
                equiv: '$18.33/mo',
                note: 'Best value for established teams. Includes priority support.',
                cta: 'Choose Annual',
                featured: false,
              },
            ].map((p) => (
              <motion.div key={p.name} className={`price-card ${p.featured ? 'featured' : ''}`} variants={pop}>
                <div className="price-header">
                  <div className="price-title">
                    <h3>{p.name}</h3>
                    {p.save && <span className="price-badge">{p.save}</span>}
                  </div>
                  <div className="price-amount">
                    <div className="price-value">{p.price}</div>
                    <div className="price-suffix">{p.suffix}</div>
                  </div>
                </div>
                <div className="price-meta">
                  <div className="price-equivalent">Equivalent: {p.equiv}</div>
                  <div className="price-note">{p.note}</div>
                </div>
                <ul className="price-features">
                  <li>Unlimited invoices and quotes</li>
                  <li>Expense tracking and approvals</li>
                  <li>Cash‑flow analytics & dashboards</li>
                  <li>Email & chat support</li>
                </ul>
                <Link to="/register" className={`btn ${p.featured ? 'btn-primary' : 'btn-secondary'}`}>{p.cta}</Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials">
        <div className="container">
          <motion.h2 className="section-title" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            Teams love MoneyMate
          </motion.h2>
          <motion.div className="testi-grid" variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            {[
              { name: 'Alex Morgan', role: 'CFO, Helix', quote: 'Month‑end went from stress to streamlined. We finally see our cash clearly.' },
              { name: 'Priya Patel', role: 'Ops Lead, Nova', quote: 'Approvals are fast, audit trails are tight, and invoices just work.' },
              { name: 'Diego Alvarez', role: 'Founder, Modo', quote: 'MoneyMate became the backbone of our finance stack as we scaled.' },
            ].map((t) => (
              <motion.div key={t.name} className="testi-card" variants={pop}>
                <p className="testi-quote">“{t.quote}”</p>
                <div className="testi-meta">
                  <img src="/logo.png" alt={t.name} className="testi-avatar" />
                  <div>
                    <div className="testi-name">{t.name}</div>
                    <div className="testi-role">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="faq">
        <div className="container">
          <motion.h2 className="section-title" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            Frequently asked questions
          </motion.h2>
          <motion.div className="faq-grid" variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            {[
              { q: 'Can I use MoneyMate for free?', a: 'Yes, the Starter plan is free and includes core features.' },
              { q: 'Do you support multiple currencies?', a: 'Absolutely — multi‑currency transactions and reporting are supported.' },
              { q: 'Is my data secure?', a: 'We use bank‑grade encryption, role‑based access, and regular audits.' },
            ].map((f) => (
              <motion.div key={f.q} className="faq-card" variants={pop}>
                <h3>{f.q}</h3>
                <p>{f.a}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container footer-inner">
          <div className="footer-brand">
            <img src="/logo.png" alt="MoneyMate" className="brand-logo" />
            <span>MoneyMate</span>
          </div>
          <div className="footer-links">
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            <Link to="/login">Sign in</Link>
          </div>
          <div className="footer-copy">© {new Date().getFullYear()} MoneyMate. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}