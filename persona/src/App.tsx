import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import './index.css';

// ─── Autumn Leaf SVG Paths (4 distinct shapes) ───────────────────────────────────
// Shape 0: Slender elongated leaf (willow-like)
const LEAF_PATHS = [
  'M20,2 C28,5 34,14 33,24 C32,36 24,45 20,48 C16,45 8,36 7,24 C6,14 12,5 20,2 Z',
  // Shape 1: Wide rounded leaf (maple-inspired)
  'M20,4 C20,4 10,0 6,6 C3,10 7,14 5,18 C3,22 0,24 2,28 C5,32 10,29 12,32 C14,36 13,42 16,45 C18,47 20,48 20,48 C20,48 22,47 24,45 C27,42 26,36 28,32 C30,29 35,32 38,28 C40,24 37,22 35,18 C33,14 37,10 34,6 C30,0 20,4 20,4 Z',
  // Shape 2: Oak-style lobed leaf
  'M20,48 C16,42 10,38 8,32 C6,27 10,24 8,19 C6,15 3,13 4,9 C7,10 10,12 12,10 C13,6 11,3 14,2 C16,5 16,9 20,10 C24,9 24,5 26,2 C29,3 27,6 28,10 C30,12 33,10 36,9 C37,13 34,15 32,19 C30,24 34,27 32,32 C30,38 24,42 20,48 Z',
  // Shape 3: Classic simple teardrop
  'M20,3 C24,3 36,12 36,22 C36,34 28,44 20,48 C12,44 4,34 4,22 C4,12 16,3 20,3 Z',
];
const AUTUMN_COLORS = [
  '#C4873A','#D4522A','#B85C2C','#E8A840',
  '#CC6B2C','#A0522D','#CD853F','#8B6340',
  '#E07B39','#C45C1A','#D4943A','#9B4F1C',
];
const SWAY_ANIMS   = ['leafSway1','leafSway2','leafSway3'];

// ─── Typewriter Phrases ──────────────────────────────────────────────────────
const PHRASES = ['React & TypeScript', 'CSS & Animation', 'UI/UX Design', 'Node.js', 'Figma'];

// ─── Stats ───────────────────────────────────────────────────────────────────
const STATS = [
  { number: '2+',  label: 'Years Crafting' },
  { number: '3',   label: 'Live Projects'  },
  { number: '8',   label: 'Tech Mastered'  },
  { number: '∞',   label: 'Cups of Coffee' },
];

function App() {
  const observerRef = useRef<IntersectionObserver | null>(null);

  // ── Form State ─────────────────────────────────────────────────────────────
  const [formData,  setFormData]  = useState({ name: '', subject: '', email: '', message: '' });
  const [errors,    setErrors]    = useState({ name: '', subject: '', email: '', message: '' });
  const [formState, setFormState] = useState<'idle' | 'sending' | 'sent'>('idle');

  // ── UI State ───────────────────────────────────────────────────────────────
  const cursorRef     = useRef<HTMLDivElement>(null);
  const [menuOpen,    setMenuOpen]    = useState(false);
  const [scrollPct,    setScrollPct]    = useState(0);
  const [showTopBtn,   setShowTopBtn]   = useState(false);
  const [activeSection,setActiveSection]= useState('home');

  // ── Typewriter State ───────────────────────────────────────────────────────
  const [typedText,   setTypedText]   = useState('');
  const [phraseIdx,   setPhraseIdx]   = useState(0);
  const [charIdx,     setCharIdx]     = useState(0);
  const [isDeleting,  setIsDeleting]  = useState(false);

  // ── Leaf Data ──────────────────────────────────────────────────────────────
  const leaves = useMemo(() => {
    const rand = (seed: number, min: number, max: number) => {
      const x = Math.sin(seed) * 10000;
      return min + (x - Math.floor(x)) * (max - min);
    };
    return Array.from({ length: 24 }, (_, i) => ({
      id:      i,
      left:    `${rand(i * 3.7, -2, 102)}%`,
      size:    rand(i * 1.3, 18, 46),
      color:   AUTUMN_COLORS[Math.floor(rand(i * 2.1, 0, AUTUMN_COLORS.length))],
      duration:rand(i * 4.1, 9, 24),
      delay:   rand(i * 5.3, 0, 22),
      anim:    SWAY_ANIMS[Math.floor(rand(i * 6.7, 0, 3))],
      pathIdx: Math.floor(rand(i * 9.1, 0, 4)),
      opacity: rand(i * 2.9, 0.35, 0.9),
      blur:    rand(i * 7.3, 0, 1) > 0.65 ? `${rand(i * 11.1, 0.5, 2)}px` : '0px',
    }));
  }, []);

  // ── Stagger Intersection Observer ─────────────────────────────────────────
  useEffect(() => {
    observerRef.current = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { root: null, rootMargin: '0px', threshold: 0.1 });

    document.querySelectorAll('section, nav').forEach(section => {
      section.querySelectorAll('.stagger-item').forEach((item, index) => {
        (item as HTMLElement).style.transitionDelay = `${index * 0.1}s`;
        if (observerRef.current) observerRef.current.observe(item);
      });
    });

    return () => { if (observerRef.current) observerRef.current.disconnect(); };
  }, []);

  // ── Active Section Observer ────────────────────────────────────────────────
  useEffect(() => {
    const sectionObs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) setActiveSection(entry.target.id);
      });
    }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });

    document.querySelectorAll('section[id]').forEach(s => sectionObs.observe(s));
    return () => sectionObs.disconnect();
  }, []);

  // ── Custom Cursor (RAF – zero re-renders) ────────────────────────────────
  useEffect(() => {
    const el = cursorRef.current;
    if (!el) return;

    let mouseX = -200, mouseY = -200;
    let rafId: number;

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const tick = () => {
      el.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    const onOver = (e: Event) => {
      if ((e.target as Element).closest('a, button, .skill-chip, .project-card, .lift'))
        el.classList.add('hover');
    };
    const onOut = (e: Event) => {
      if ((e.target as Element).closest('a, button, .skill-chip, .project-card, .lift'))
        el.classList.remove('hover');
    };

    window.addEventListener('mousemove', onMove);
    document.addEventListener('mouseover', onOver);
    document.addEventListener('mouseout', onOut);
    return () => {
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseover', onOver);
      document.removeEventListener('mouseout', onOut);
      cancelAnimationFrame(rafId);
    };
  }, []);

  // ── Scroll Progress + Back-to-Top ─────────────────────────────────────────
  useEffect(() => {
    const onScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setScrollPct(total > 0 ? (window.scrollY / total) * 100 : 0);
      setShowTopBtn(window.scrollY > 450);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // ── Typewriter ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const phrase = PHRASES[phraseIdx];
    let t: ReturnType<typeof setTimeout>;

    if (!isDeleting) {
      if (charIdx < phrase.length) {
        t = setTimeout(() => { setTypedText(phrase.slice(0, charIdx + 1)); setCharIdx(c => c + 1); }, 80);
      } else {
        t = setTimeout(() => setIsDeleting(true), 1800);
      }
    } else {
      if (charIdx > 0) {
        t = setTimeout(() => { setTypedText(phrase.slice(0, charIdx - 1)); setCharIdx(c => c - 1); }, 45);
      } else {
        setIsDeleting(false);
        setPhraseIdx(p => (p + 1) % PHRASES.length);
      }
    }
    return () => clearTimeout(t);
  }, [charIdx, isDeleting, phraseIdx]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    if (targetId === '#') return;
    document.querySelector(targetId)?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const validateField = (name: string, value: string) => {
    let error = '';
    if (name === 'name' && value.trim() === '') error = 'Name is required';
    if (name === 'email') {
      if (value.trim() === '') error = 'Email is required';
      else if (!/^\S+@\S+\.\S+$/.test(value)) error = 'Invalid email address';
    }
    if (name === 'subject' && value.trim() === '') error = 'Subject is required';
    if (name === 'message') {
      if (value.trim() === '') error = 'Message is required';
      else if (value.length > 500) error = 'Message is too long (max 500 chars)';
    }
    setErrors(prev => ({ ...prev, [name]: error }));
    return error === '';
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'message' && value.length > 500) return;
    setFormData(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const valid = ['name','email','subject','message'].every(f => validateField(f, formData[f as keyof typeof formData]));
    if (!valid) return;
    setFormState('sending');
    const mailtoUrl = `mailto:aryanjr2010@gmail.com?subject=${encodeURIComponent(
      `Portfolio Contact [${formData.subject}] from ${formData.name}`
    )}&body=${encodeURIComponent(
      `Hi Aryan,\n\nYou received a new message from your portfolio contact form:\n\n` +
      `-----------------------------------------\n` +
      `Name: ${formData.name}\nEmail: ${formData.email}\nSubject Type: ${formData.subject}\n` +
      `-----------------------------------------\n\nMessage:\n${formData.message}\n\n-----------------------------------------`
    )}`;
    window.location.href = mailtoUrl;
    setTimeout(() => {
      setFormState('sent');
      setFormData({ name: '', subject: '', email: '', message: '' });
      setTimeout(() => setFormState('idle'), 3000);
    }, 800);
  };

  // ──────────────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Custom Cursor ── */}
      <div
        ref={cursorRef}
        className="cursor-follower"
        aria-hidden="true"
      />

      {/* ── Back to Top with Progress Ring ── */}
      <button
        className={`back-to-top ${showTopBtn ? 'visible' : ''}`}
        onClick={scrollToTop}
        aria-label="Back to top"
      >
        <svg className="progress-ring" width="56" height="56">
          <circle className="progress-ring-circle bg" stroke="rgba(26,23,20,0.1)" strokeWidth="2" fill="transparent" r="26" cx="28" cy="28" />
          <circle
            className="progress-ring-circle fg"
            stroke="var(--accent-color)"
            strokeWidth="2"
            fill="transparent"
            r="26"
            cx="28"
            cy="28"
            style={{ 
              strokeDasharray: 2 * Math.PI * 26, 
              strokeDashoffset: (2 * Math.PI * 26) - ((2 * Math.PI * 26) * (scrollPct / 100))
            }}
          />
        </svg>
        <span className="back-to-top-arrow">↑</span>
      </button>

      <div className="container">
        {/* ── Warm ambient glow orbs ── */}
        <div className="bg-warmth" aria-hidden="true">
          <div className="bg-warmth-1" />
          <div className="bg-warmth-2" />
          <div className="bg-warmth-3" />
        </div>

        {/* ── Edge vignette ── */}
        <div className="bg-vignette" aria-hidden="true" />

        <div className="leaves-container" aria-hidden="true">
          {leaves.map(leaf => (
            <div
              key={leaf.id}
              className="leaf"
              style={{
                left: leaf.left,
                animationName: leaf.anim,
                animationDuration: `${leaf.duration}s`,
                animationDelay: `${leaf.delay}s`,
                animationTimingFunction: 'ease-in-out',
                animationIterationCount: 'infinite',
                animationFillMode: 'both',
              }}
            >
              <svg
                width={leaf.size}
                height={leaf.size * 1.25}
                viewBox="0 0 40 50"
                xmlns="http://www.w3.org/2000/svg"
                style={{ opacity: leaf.opacity, display: 'block', filter: `blur(${leaf.blur})` }}
              >
                <path d={LEAF_PATHS[leaf.pathIdx]} fill={leaf.color} />
                <line x1="20" y1="4" x2="20" y2="46" stroke="rgba(0,0,0,0.18)" strokeWidth="1" strokeLinecap="round" />
                <line x1="20" y1="16" x2="10" y2="26" stroke="rgba(0,0,0,0.1)" strokeWidth="0.7" />
                <line x1="20" y1="16" x2="30" y2="26" stroke="rgba(0,0,0,0.1)" strokeWidth="0.7" />
                <line x1="20" y1="28" x2="11" y2="38" stroke="rgba(0,0,0,0.1)" strokeWidth="0.7" />
                <line x1="20" y1="28" x2="29" y2="38" stroke="rgba(0,0,0,0.1)" strokeWidth="0.7" />
                <line x1="20" y1="46" x2="20" y2="52" stroke={leaf.color} strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
          ))}
        </div>

        {/* ── Toast ── */}
        <div className={`toast ${formState === 'sent' ? 'show' : ''}`}>
          Message sent successfully!
        </div>

        {/* ── Nav ── */}
        <nav className={menuOpen ? 'menu-open' : ''}>
          <a href="#" className="logo stagger-item" onClick={() => setMenuOpen(false)}>Aryan.</a>

          {/* Hamburger button – mobile only */}
          <button
            id="hamburger-btn"
            className={`hamburger ${menuOpen ? 'open' : ''}`}
            onClick={() => setMenuOpen(o => !o)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            <span /><span /><span />
          </button>

          {/* Nav links */}
          <div className={`nav-links stagger-item ${menuOpen ? 'nav-open' : ''}`}>
            <a href="#about"    onClick={e => { handleSmoothScroll(e, '#about');    setMenuOpen(false); }} className={`nav-link ${activeSection === 'about'    ? 'active' : ''}`}>About</a>
            <a href="#projects" onClick={e => { handleSmoothScroll(e, '#projects'); setMenuOpen(false); }} className={`nav-link ${activeSection === 'projects' ? 'active' : ''}`}>Work</a>
            <a href="#contact"  onClick={e => { handleSmoothScroll(e, '#contact');  setMenuOpen(false); }} className={`nav-link ${activeSection === 'contact'  ? 'active' : ''}`}>Contact</a>
            <a href="https://calendly.com/" target="_blank" rel="noopener noreferrer" className="btn nav-cta" onClick={() => setMenuOpen(false)}>Book a Free Meeting</a>
          </div>
        </nav>

        {/* ── Hero ── */}
        <section className="hero" id="home">
          <div className="hero-badge stagger-item">
            <span className="availability-dot" style={{ marginRight: '6px' }} />
            Open to work
          </div>
          <h1 className="stagger-item">Digital craftsmanship with physical presence.</h1>
          <p className="stagger-item">
            I build tactile, minimalist web experiences that feel grounded yet dynamic. Transforming ideas into solid digital realities.
          </p>
          <p className="hero-typewriter stagger-item">
            Currently crafting with&nbsp;
            <span className="typewriter-highlight">{typedText}<span className="typewriter-cursor">|</span></span>
          </p>
          <div className="cta-group stagger-item">
            <a href="https://calendly.com/" target="_blank" rel="noopener noreferrer" className="btn">Book a Free Meeting</a>
            <a href="#projects" onClick={e => handleSmoothScroll(e, '#projects')} className="btn btn-ghost">View Work</a>
            <a href="#contact"  onClick={e => handleSmoothScroll(e, '#contact')}  className="btn btn-ghost">Contact Me</a>
          </div>
        </section>

        {/* ── About ── */}
        <section className="about" id="about">
          <h2 className="section-title stagger-item">
            <span className="section-num">01.</span> About
          </h2>
          <div className="about-content stagger-item">
            <div className="bio">
              <p>I am a developer and designer obsessed with the intersection of aesthetics and functionality. My approach relies on minimalism, typography, and physics-based interactions.</p>
              <p>Instead of relying on flashy effects, I focus on depth, shadow, and motion to create interfaces that feel tangibly real.</p>
            </div>
            <div className="skills">
              <div className="skills-container">
                {['JavaScript', 'TypeScript', 'React', 'CSS Architecture', 'UI/UX Design', 'Node.js', 'Figma', 'Animation'].map(skill => (
                  <div key={skill} className="skill-chip">{skill}</div>
                ))}
              </div>
            </div>
          </div>

          {/* Stats Strip */}
          <div className="stats-strip stagger-item">
            {STATS.map(stat => (
              <div key={stat.label} className="stat-item">
                <span className="stat-number">{stat.number}</span>
                <span className="stat-label">{stat.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Projects ── */}
        <section className="projects" id="projects">
          <h2 className="section-title stagger-item">
            <span className="section-num">02.</span> Projects
          </h2>
          <div className="projects-grid">

            <article className="project-card stagger-item">
              <h3 className="project-title">TwinStack</h3>
              <p className="project-desc">A professional services showcase built with earthy tones and seamless responsiveness. Focuses on local business conversion.</p>
              <div className="project-tags">
                <span className="project-tag">TypeScript</span>
                <span className="project-tag">Vite</span>
                <span className="project-tag">Tailwind CSS</span>
              </div>
              <div className="project-links">
                <a href="https://twinstack.pakhsa.in/" target="_blank" rel="noopener noreferrer" className="project-link">Live Site ↗</a>
                <a href="https://github.com/Aryan-jr-07/TS" target="_blank" rel="noopener noreferrer" className="project-link">GitHub ↗</a>
              </div>
            </article>

            <article className="project-card stagger-item">
              <h3 className="project-title">Marlboro</h3>
              <p className="project-desc">A cinematic 3D drill-down experience featuring scroll-driven parallax and synchronized item emergence animations.</p>
              <div className="project-tags">
                <span className="project-tag">TypeScript</span>
                <span className="project-tag">HTML/CSS</span>
                <span className="project-tag">3D Transforms</span>
                <span className="project-tag">JavaScript</span>
              </div>
              <div className="project-links">
                <a href="https://marlbooro.netlify.app/" target="_blank" rel="noopener noreferrer" className="project-link">Live Site ↗</a>
                <a href="https://github.com/Aryan-jr-07/marlboro" target="_blank" rel="noopener noreferrer" className="project-link">GitHub ↗</a>
              </div>
            </article>

            <article className="project-card stagger-item">
              <h3 className="project-title">Artisan Insight</h3>
              <p className="project-desc">A performance indexing and state analysis dashboard designed to help developers monitor application health.</p>
              <div className="project-tags">
                <span className="project-tag">JavaScript</span>
                <span className="project-tag">React</span>
                <span className="project-tag">Tailwind CSS</span>
              </div>
              <div className="project-links">
                <a href="https://artisan-welfare-analytics.vercel.app/" target="_blank" rel="noopener noreferrer" className="project-link">Live Site ↗</a>
                <a href="https://github.com/Aryan-jr-07/Artisan-WELFARE-ANALYTICS" target="_blank" rel="noopener noreferrer" className="project-link">GitHub ↗</a>
              </div>
            </article>

          </div>
        </section>

        {/* ── Contact ── */}
        <section className="contact" id="contact">
          <h2 className="section-title stagger-item">
            <span className="section-num">03.</span> Let's Connect
          </h2>
          <div className="contact-grid stagger-item">

            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="name">Name</label>
                  <input type="text" id="name" name="name" className={`form-control ${errors.name ? 'error' : ''}`} value={formData.name} onChange={handleChange} placeholder="Jane Doe" />
                  {errors.name && <span className="error-msg">{errors.name}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="subject">Subject</label>
                  <select id="subject" name="subject" className={`form-control ${errors.subject ? 'error' : ''}`} value={formData.subject} onChange={handleChange}>
                    <option value="">Select a subject...</option>
                    <option value="freelance">Freelance Project</option>
                    <option value="job">Job Opportunity</option>
                    <option value="hello">Just saying hi</option>
                  </select>
                  {errors.subject && <span className="error-msg">{errors.subject}</span>}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="email">Email</label>
                <input type="email" id="email" name="email" className={`form-control ${errors.email ? 'error' : ''}`} value={formData.email} onChange={handleChange} placeholder="jane@example.com" />
                {errors.email && <span className="error-msg">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="message">Message</label>
                <textarea id="message" name="message" rows={5} className={`form-control ${errors.message ? 'error' : ''}`} value={formData.message} onChange={handleChange} placeholder="How can we work together?"></textarea>
                <span className={`char-counter ${formData.message.length >= 500 ? 'limit' : ''}`}>{formData.message.length}/500</span>
                {errors.message && <span className="error-msg" style={{ bottom: '-36px' }}>{errors.message}</span>}
              </div>

              <button type="submit" className={`btn ${formState === 'sent' ? 'sent' : ''}`} disabled={formState === 'sending'}>
                {formState === 'sending' ? 'Sending...' : formState === 'sent' ? 'Sent!' : 'Send Message'}
              </button>
            </form>

            <div className="info-cards">
              <div className="info-card lift">
                <div className="info-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                </div>
                <div className="info-content">
                  <h4>Email</h4>
                  <p><a href="mailto:aryanjr2010@gmail.com" style={{ textDecoration: 'none', color: 'inherit' }}>aryanjr2010@gmail.com</a></p>
                </div>
              </div>

              <div className="info-card lift">
                <div className="info-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                </div>
                <div className="info-content">
                  <h4>Location</h4>
                  <p>Delhi, India</p>
                </div>
              </div>

              <div className="info-card lift">
                <div className="info-icon">
                  <span className="availability-dot"></span>
                </div>
                <div className="info-content">
                  <h4>Availability</h4>
                  <p style={{ margin: 0 }}>Open for work</p>
                  <a href="https://calendly.com/" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.85rem', color: 'var(--accent-color)', textDecoration: 'none', fontWeight: 600, marginTop: '4px', display: 'inline-block' }}>
                    Book a meeting ↗
                  </a>
                </div>
              </div>

              <div className="social-links" style={{ marginTop: '16px' }}>
                <a href="https://github.com/Aryan-jr-07" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="GitHub">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
                </a>
                <a href="https://www.linkedin.com/in/aryan-25800a301/" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="LinkedIn">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                </a>
              </div>
            </div>
          </div>
        </section>

        <footer>
          <div className="footer-inner">
            <div className="footer-brand">
              <a href="#" className="logo footer-logo">Aryan.</a>
              <p className="footer-tagline">Building digital experiences<br/>from Delhi, India 🇮🇳</p>
            </div>
            <div className="footer-links-group">
              <span className="footer-links-label">Connect</span>
              <div className="footer-links">
                <a href="https://github.com/Aryan-jr-07" target="_blank" rel="noopener noreferrer" className="footer-link">GitHub ↗</a>
                <a href="https://www.linkedin.com/in/aryan-25800a301/" target="_blank" rel="noopener noreferrer" className="footer-link">LinkedIn ↗</a>
                <a href="mailto:aryanjr2010@gmail.com" className="footer-link">Email ↗</a>
                <a href="https://calendly.com/" target="_blank" rel="noopener noreferrer" className="footer-link">Book a Call ↗</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2026 Aryan. All rights reserved.</p>
            <p className="footer-built">Crafted with React &amp; a lot of ☕</p>
          </div>
        </footer>
      </div>
    </>
  );
}

export default App;
