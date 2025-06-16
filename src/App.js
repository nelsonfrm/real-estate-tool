import React, { useState } from 'react';

const faqs = [
  {
    question: "We don't have time for new systems…",
    answer: "Our solutions are designed for rapid deployment and minimal disruption. Most firms see value within days, not months.",
  },
  {
    question: "Will lawyers actually use it?",
    answer: "We design with lawyers in mind—usability tested, intuitive, and tailored to your workflows.",
  },
  {
    question: "What about security?",
    answer: "We follow industry best practices for data security and compliance, ensuring your sensitive information is protected.",
  },
  {
    question: "Is this too expensive for a small firm?",
    answer: "Our solutions are scalable and cost-effective, with options for firms of all sizes.",
  },
];

function App() {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f5f7ff] to-[#eaf0fb] text-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-gray-100">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2 font-bold text-xl">
            <span className="inline-block w-6 h-6 bg-blue-600 rounded-full mr-2"></span>
            Foresight Studio
          </div>
          <nav className="hidden md:flex gap-8 text-base font-medium">
            <a href="#fractional-cpo" className="hover:text-blue-600">Fractional CPO</a>
            <a href="#automations" className="hover:text-blue-600">Automations</a>
            <a href="#software-ai" className="hover:text-blue-600">Software & AI</a>
            <a href="#consulting" className="hover:text-blue-600">Consulting</a>
          </nav>
          <a href="#cta" className="ml-4 px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 transition">Book Consultation</a>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center py-20 px-4 bg-gradient-to-b from-[#f5f7ff] to-[#eaf0fb]">
        <h1 className="text-3xl md:text-5xl font-extrabold mb-4">Build Smarter Legal Systems—Without the Dev Headache</h1>
        <p className="text-lg md:text-xl text-gray-500 mb-8 max-w-2xl">From custom internal apps to AI-powered legal tools, we help your firm automate operations, boost profitability, and modernize client experience—without coding or long dev cycles.</p>
        <a href="#cta" className="w-full max-w-xs py-4 px-6 bg-blue-600 text-white text-lg rounded-lg shadow hover:bg-blue-700 transition flex items-center justify-center gap-2">
          <span role="img" aria-label="point">👉</span> Book Your Free Strategy Call
        </a>
      </section>

      {/* Value Proposition Block */}
      <section className="max-w-5xl mx-auto py-16 px-4" id="why-us">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">Why Law Firms Work With Us</h2>
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <ul className="space-y-4 text-lg">
            <li>• Tailored internal tools</li>
            <li>• Automation for admin tasks</li>
            <li>• AI assistants for docs & intake</li>
            <li>• Strategic UX-first design</li>
          </ul>
          <div className="bg-gray-50 rounded-lg p-6 flex items-center gap-4 shadow">
            <span className="text-2xl">⚡</span>
            <div>
              <div className="font-semibold">Custom-built. No-code speed. Lawyer-tested usability.</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pain & Emotional Framing Section */}
      <section className="bg-white py-16 px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">Your team is smart. But they're wasting hours…</h2>
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8 mb-8">
          <ul className="space-y-3 text-lg text-red-500">
            <li>❌ Manual data entry</li>
            <li>❌ Chasing documents</li>
            <li>❌ Repetitive admin work</li>
            <li>❌ Missed deadlines</li>
          </ul>
          <ul className="space-y-3 text-lg text-green-600 animate-fade-in-up">
            <li>✅ Automated workflows</li>
            <li>✅ AI-powered document intake</li>
            <li>✅ More time for high-value work</li>
            <li>✅ Happier clients & team</li>
          </ul>
        </div>
        <div className="text-center text-gray-500">Imagine the difference…</div>
      </section>

      {/* FAQ / Objection Handling */}
      <section className="max-w-3xl mx-auto py-16 px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">FAQs</h2>
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="border rounded-lg overflow-hidden">
              <button
                className="w-full flex justify-between items-center px-6 py-4 text-left font-medium text-lg bg-gray-50 hover:bg-gray-100 focus:outline-none"
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
              >
                {faq.question}
                <span>{openFaq === idx ? '−' : '+'}</span>
              </button>
              {openFaq === idx && (
                <div className="px-6 py-4 bg-white text-gray-700 border-t animate-fade-in">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Call-to-Action Section */}
      <section id="cta" className="py-16 px-4 bg-blue-50 text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">Let's streamline your legal operations—book a free strategy call.</h2>
        <a href="#" className="inline-block py-4 px-8 bg-blue-600 text-white text-lg rounded-lg shadow hover:bg-blue-700 transition">
          Book Your Free Strategy Call
        </a>
      </section>
    </div>
  );
}

export default App;
