import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Compass,
  Menu,
  Moon,
  Plus,
  Receipt,
  Sun,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import { useTrip } from '../context/TripContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { TripSphere } from '../components/dashboard/TripSphere';
import { formatINR } from '../lib/formatters';
import { BrandLogo } from '../components/BrandLogo';

interface MarketingLandingProps {
  isDarkTheme: boolean;
  onThemeToggle: () => void;
}

const useCases = [
  {
    title: 'Friend groups & big weekends',
    text: 'Split the villa, track the activities some people skip, and stop keeping score in the group chat.',
    tag: 'FRIENDS',
    gradient: 'from-violet-500/35 to-fuchsia-400/20',
  },
  {
    title: 'Family trips that stay fair',
    text: 'Keep shared rooms, individual costs, and “I’ll cover this one” payments clear for every generation.',
    tag: 'FAMILIES',
    gradient: 'from-amber-400/35 to-orange-300/20',
  },
  {
    title: 'Student groups & offsites',
    text: 'Book upfront as an organizer, settle cleanly afterward, and export a summary for every reimbursement.',
    tag: 'TEAMS',
    gradient: 'from-cyan-400/35 to-blue-400/20',
  },
];

const scrollToSection = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

type SetupExpense = { title: string; amount: string; paidBy: number };

export const MarketingLanding: React.FC<MarketingLandingProps> = ({ isDarkTheme, onThemeToggle }) => {
  const { participants, participantBalances, bookings, totalTripCost } = useTrip();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [useCase, setUseCase] = useState(0);
  const [demoJoined, setDemoJoined] = useState(false);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [setupOpen, setSetupOpen] = useState(false);
  const [tripName, setTripName] = useState('My group trip');
  const [travelerInput, setTravelerInput] = useState('You, Alex, Sam, Priya');
  const [splitModel, setSplitModel] = useState<'equal' | 'activity'>('equal');
  const [setupExpenses, setSetupExpenses] = useState<SetupExpense[]>([
    { title: 'Accommodation', amount: '24000', paidBy: 0 },
  ]);

  const setupTravelers = travelerInput.split(',').map((name) => name.trim()).filter(Boolean);
  const setupTotal = setupExpenses.reduce((sum, expense) => sum + (Number(expense.amount) || 0), 0);
  const setupShare = setupTravelers.length > 0 ? Math.round(setupTotal / setupTravelers.length) : 0;
  const setupPaid = setupTravelers.map((_, index) => setupExpenses
    .filter((expense) => expense.paidBy === index)
    .reduce((sum, expense) => sum + (Number(expense.amount) || 0), 0));
  const setupBalances = setupTravelers.map((name, index) => ({ name, amount: setupPaid[index] - setupShare }));
  const openTripSetup = () => {
    if (!user) {
      navigate('/login?next=/dashboard');
      return;
    }
    setSetupOpen(true);
  };

  const visibleBalances = useMemo(
    () => participantBalances.slice(0, 3).map((balance) => ({
      ...balance,
      person: participants.find((person) => person.id === balance.participantId),
    })),
    [participantBalances, participants]
  );

  const demoTotal = demoJoined ? totalTripCost + 1500 : totalTripCost;
  const demoShare = Math.round(demoTotal / (participants.length + (demoJoined ? 1 : 0)));
  return (
    <div className={`marketing-site ${isDarkTheme ? 'theme-dark' : ''}`}>
      <header className="marketing-header">
        <button className="marketing-brand logo-brand" onClick={() => scrollToSection('home')} aria-label="Go to top">
          <BrandLogo isDarkTheme={isDarkTheme} />
        </button>
        <nav className="marketing-nav" aria-label="Main navigation">
          <button onClick={() => scrollToSection('how-it-works')}>How it works</button>
          <button onClick={() => scrollToSection('split-models')}>Split Models</button>
          <button onClick={() => scrollToSection('pricing')}>Pricing</button>
          <button onClick={() => scrollToSection('story')}>Our story</button>
        </nav>
        <div className="marketing-header-actions">
          <button className="marketing-theme-toggle" onClick={onThemeToggle} aria-label="Toggle theme">
            {isDarkTheme ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button className="marketing-ghost" onClick={() => navigate('/login')}>{user ? 'Dashboard' : 'Sign in'}</button>
          <button className="marketing-primary header-cta" onClick={openTripSetup}>
            Start a Trip <ArrowRight className="w-4 h-4" />
          </button>
          <button className="marketing-menu-button" onClick={() => setMenuOpen(true)} aria-label="Open menu">
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {menuOpen && (
        <div className="marketing-menu-backdrop" onClick={() => setMenuOpen(false)}>
          <div className="marketing-menu-panel" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <span className="marketing-eyebrow">GROUPTRIP LEDGER</span>
              <button onClick={() => setMenuOpen(false)} aria-label="Close menu"><X /></button>
            </div>
            {['how-it-works', 'split-models', 'pricing', 'story'].map((section) => (
              <button key={section} onClick={() => { setMenuOpen(false); scrollToSection(section); }}>
                {section.replace('-', ' ')} <ArrowRight className="w-4 h-4" />
              </button>
            ))}
          </div>
        </div>
      )}

      {setupOpen && (
        <div className="trip-setup-backdrop" onClick={() => setSetupOpen(false)}>
          <section className="trip-setup-modal glass-panel" onClick={(event) => event.stopPropagation()} aria-labelledby="trip-setup-title">
            <div className="trip-setup-header">
              <div><span className="marketing-eyebrow">NEW TRIP WORKSPACE</span><h2 id="trip-setup-title">Start with the numbers.</h2><p>Add the basics now. Every balance below is calculated live from your entries.</p></div>
              <button className="trip-setup-close" onClick={() => setSetupOpen(false)} aria-label="Close trip setup"><X /></button>
            </div>
            <div className="trip-setup-grid">
              <div className="trip-setup-form">
                <label>Trip name<input value={tripName} onChange={(event) => setTripName(event.target.value)} /></label>
                <label>Travelers <span className="field-hint">separate names with commas</span><textarea value={travelerInput} onChange={(event) => setTravelerInput(event.target.value)} rows={2} /></label>
                <label>Split model<select value={splitModel} onChange={(event) => setSplitModel(event.target.value as 'equal' | 'activity')}><option value="equal">Equal split</option><option value="activity">Per-activity split (coming next)</option></select></label>
                <div className="setup-expenses-heading"><strong>Expenses</strong><button className="setup-add-button" onClick={() => setSetupExpenses((current) => [...current, { title: '', amount: '', paidBy: 0 }])}><Plus className="w-3 h-3" /> Add expense</button></div>
                {setupExpenses.map((expense, index) => <div className="setup-expense-row" key={index}>
                  <input value={expense.title} onChange={(event) => setSetupExpenses((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, title: event.target.value } : item))} placeholder="Expense name" />
                  <input value={expense.amount} onChange={(event) => setSetupExpenses((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, amount: event.target.value } : item))} type="number" min="0" placeholder="Amount" />
                  <select value={expense.paidBy} onChange={(event) => setSetupExpenses((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, paidBy: Number(event.target.value) } : item))}>{setupTravelers.map((name, travelerIndex) => <option value={travelerIndex} key={name + travelerIndex}>{name} paid</option>)}</select>
                  {setupExpenses.length > 1 && <button className="setup-remove-button" onClick={() => setSetupExpenses((current) => current.filter((_, itemIndex) => itemIndex !== index))} aria-label="Remove expense"><Trash2 className="w-4 h-4" /></button>}
                </div>)}
                <button className="marketing-primary setup-continue" onClick={() => { sessionStorage.setItem('grouptrip-draft', JSON.stringify({ name: tripName, travelers: setupTravelers, expenses: setupExpenses })); setSetupOpen(false); navigate('/dashboard'); }}>Open {tripName || 'your trip'} <ArrowRight className="w-4 h-4" /></button>
              </div>
              <div className="trip-calculation-preview">
                <span className="marketing-eyebrow">LIVE CALCULATION</span>
                <h3>{tripName || 'Your trip'}</h3>
                <div className="calculation-total"><span>Total trip cost</span><strong>{formatINR(setupTotal)}</strong></div>
                <div className="calculation-total"><span>Fair share per traveler</span><strong>{formatINR(setupShare)}</strong></div>
                <div className="calculation-list">{setupBalances.map((balance) => <div className="calculation-row" key={balance.name}><span>{balance.name}</span><strong className={balance.amount >= 0 ? 'positive' : 'negative'}>{balance.amount >= 0 ? `${formatINR(balance.amount)} gets back` : `${formatINR(Math.abs(balance.amount))} owes`}</strong></div>)}</div>
                <div className="calculation-explainer"><strong>How it works</strong><p>1. Add every active expense.<br />2. Split each expense between the travelers included.<br />3. Each balance = amount paid − fair share.<br />4. Positive balances receive money; negative balances pay it.</p>{splitModel === 'activity' && <small>Per-activity splits will let you choose who joins each expense in the full workspace.</small>}</div>
              </div>
            </div>
          </section>
        </div>
      )}

      <main id="home">
        <section className="marketing-hero marketing-container">
          <div className="hero-copy">
            <span className="marketing-eyebrow"><span className="eyebrow-dot" /> TRIP FINANCES, MADE CLEAR</span>
            <h1>Group trips,<br /><em>without the group chat math.</em></h1>
            <p>One shared ledger for your itinerary, participants, bookings, and balances. Everyone sees what they joined, what they paid, and what they owe.</p>
            <div className="hero-actions">
              <button className="marketing-primary" onClick={openTripSetup}>
                Start Your Trip Free <ArrowRight className="w-4 h-4" />
              </button>
              <button className="marketing-text-link" onClick={() => scrollToSection('how-it-works')}>See how it works <ArrowRight className="w-4 h-4" /></button>
            </div>
            <div className="hero-proof"><Check className="w-4 h-4" /> Free for small trips <span /> <Check className="w-4 h-4" /> No app required to view</div>
          </div>

          <div className="product-preview glass-panel">
            <div className="preview-topline"><span><span className="status-dot" /> LIVE TRIP LEDGER</span><span>GOA · 4 DAYS</span></div>
            <div className="preview-heading"><div><span className="preview-kicker">CURRENT TRIP</span><h2>Goa Coastal Odyssey</h2></div><span className="preview-badge">ACTIVE</span></div>
            <div className="preview-grid">
              <div className="preview-globe"><TripSphere /></div>
              <div className="preview-sidebar">
                <div className="preview-stat"><span>Total tracked</span><strong>{formatINR(demoTotal)}</strong><small>Across {bookings.length} bookings</small></div>
                <div className="preview-stat"><span>Average share</span><strong>{formatINR(demoShare)}</strong><small>{participants.length + (demoJoined ? 1 : 0)} travelers</small></div>
                <div className="preview-list">
                  <div className="preview-list-title"><span>WHO OWES WHAT</span><button onClick={() => setDemoJoined((current) => !current)}>{demoJoined ? 'Reset' : '+ Join demo'}</button></div>
                  {visibleBalances.map((balance) => (
                    <div className="balance-row" key={balance.participantId}>
                      <img src={balance.person?.avatar} alt="" /><span>{balance.person?.name.split(' ')[0]}</span>
                      <strong className={balance.netBalance >= 0 ? 'positive' : 'negative'}>{balance.netBalance >= 0 ? '+' : ''}{formatINR(balance.netBalance)}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="marketing-container idea-section" id="story">
          <div className="section-heading narrow"><span className="marketing-eyebrow">THE WHOLE IDEA</span><h2>Add your trip once. Keep the math working.</h2><p>Add who's doing what. GroupTrip Ledger works out who owes who — and keeps working it out when plans change.</p></div>
          <div className="demo-card glass-panel">
            <div className="demo-card-copy"><span className="demo-number">01</span><h3>Someone joins the scuba trip.</h3><p>Watch their share move into the ledger without asking the group to recalculate anything.</p><button className="marketing-text-link" onClick={() => setDemoJoined((current) => !current)}>{demoJoined ? 'Reset the demo' : 'Play the live update'} <ArrowRight className="w-4 h-4" /></button></div>
            <div className="demo-update"><div className="demo-update-label"><span className="status-dot" /> LIVE RECALCULATION</div><div className="demo-person"><div className="avatar-stack"><img src={participants[0]?.avatar} alt="" /><span className="join-avatar">+</span></div><span>{demoJoined ? 'Rohan joined Scuba Diving' : 'Waiting for a change'}</span></div><div className="demo-balance"><div><small>GROUP TOTAL</small><strong>{formatINR(demoTotal)}</strong></div><ArrowRight className="w-5 h-5" /><div><small>NEW SHARE</small><strong>{formatINR(demoShare)}</strong></div></div></div>
          </div>
        </section>

        <section className="marketing-container steps-section" id="how-it-works">
          <div className="section-heading"><span className="marketing-eyebrow">HOW IT WORKS</span><h2>One shared ledger.<br /><em>Everyone sees their piece.</em></h2><p>Three simple steps from “who paid?” to “we’re settled.”</p></div>
          <div className="steps-grid">
            {[
              [<Compass />, 'Build the itinerary', 'Add transport, stays, and activities. Mark who is part of each one.'],
              [<Receipt />, 'Log payments as they happen', 'Record what you paid, to which vendor, for which item.'],
              [<CircleDollarSign />, 'Get a live settlement view', 'See real-time balances and a personal summary for every traveler.'],
            ].map(([icon, title, text], index) => <article className="step-card glass-panel" key={title as string}><span className="step-number">0{index + 1}</span><div className="step-icon">{icon}</div><h3>{title}</h3><p>{text}</p><ArrowRight className="step-arrow w-5 h-5" /></article>)}
          </div>
          <div className="trust-line"><span>Equal split</span><span>Per-activity split</span><span>Shared-room split</span><span>Organizer-paid</span></div>
        </section>

        <section className="marketing-container models-section" id="split-models">
          <div className="section-heading row-heading"><div><span className="marketing-eyebrow">BUILT FOR YOUR GROUP</span><h2>Every trip has its own rhythm.</h2></div><div className="carousel-controls"><button onClick={() => setUseCase((useCase + useCases.length - 1) % useCases.length)}><ChevronLeft /></button><span>0{useCase + 1} / 0{useCases.length}</span><button onClick={() => setUseCase((useCase + 1) % useCases.length)}><ChevronRight /></button></div></div>
          <div className={`use-case-card glass-panel bg-${useCases[useCase].gradient}`}><div className="use-case-visual"><Users className="w-12 h-12" /><span>{useCases[useCase].tag}</span></div><div className="use-case-copy"><span className="marketing-eyebrow">USE CASE 0{useCase + 1}</span><h3>{useCases[useCase].title}</h3><p>{useCases[useCase].text}</p><button className="marketing-text-link" onClick={openTripSetup}>View a sample trip <ArrowRight className="w-4 h-4" /></button></div></div>
        </section>

        <section className="closing-band" id="pricing">
          <div className="marketing-container closing-inner"><div><span className="marketing-eyebrow">PLANS CHANGE. YOUR LEDGER KEEPS UP.</span><h2>Settle the trip.<br /><em>Not the friendships.</em></h2><p>Participants joining, cancellations, refunds, and added expenses all recalculate automatically.</p><button className="marketing-primary" onClick={openTripSetup}>Start Your Trip Free <ArrowRight className="w-4 h-4" /></button><small>Free for small trips. No app required to view your balance.</small></div><div className="closing-screens"><div className="mini-screen screen-back"><span>PERSONAL SUMMARY</span><strong>₹10,800</strong><small>You're all settled</small></div><div className="mini-screen screen-front"><span>GROUP OVERVIEW</span><strong>₹64,800</strong><div className="mini-bars"><i /><i /><i /><i /></div></div></div></div>
        </section>
      </main>

      <footer className="marketing-footer" id="footer">
        <div className="marketing-container footer-grid">                <div className="footer-brand"><button className="marketing-brand logo-brand" aria-label="GroupTrip Ledger home"><BrandLogo isDarkTheme={isDarkTheme} /></button><p>Clearer trips. Fairer splits.<br />Fewer awkward reminders.</p><button className="marketing-primary" onClick={openTripSetup}>Start a Trip <ArrowRight className="w-4 h-4" /></button></div><div className="footer-links"><span>EXPLORE</span><button onClick={() => scrollToSection('home')}>Home</button><button onClick={() => scrollToSection('how-it-works')}>How it works</button><button onClick={() => scrollToSection('split-models')}>Split Models</button><button onClick={() => scrollToSection('pricing')}>Pricing</button><button onClick={() => scrollToSection('story')}>Our Story</button></div><div className="footer-links"><span>LEGAL</span><button>Privacy Policy</button><button>Terms & Conditions</button><button>Contact</button><a href="https://github.com/NameIsNotMentioned/Sigma" target="_blank" rel="noreferrer">GitHub</a></div><div className="newsletter"><span>ONE USEFUL EMAIL, OCCASIONALLY.</span><p>Trip planning ideas and product updates. No noise.</p><form onSubmit={(event) => { event.preventDefault(); setSubscribed(true); }}><input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" type="email" required /><button type="submit">{subscribed ? <Check /> : <ArrowRight />}</button></form></div></div><div className="marketing-container footer-bottom"><span>© 2026 GroupTrip Ledger</span><span>Built for better group trips.</span></div>
      </footer>
    </div>
  );
};
