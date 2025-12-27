import React from 'react'

function Terms() {
  return (
    <main>
      <section className="subpage">
        <div className="container">
          <header style={{ marginBottom: '2rem', textAlign: 'center', marginTop: '2rem' }}>
            <h1>Terms of Service <span className="emoji">📜</span></h1>
            <p style={{ opacity: 0.8, fontStyle: 'italic' }}>Effective Date: October 2025</p>
          </header>

          <div style={{ display: 'grid', gap: '1.5rem', maxWidth: '900px', margin: '0 auto' }}>
            <section style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 16, padding: '1.5rem' }}>
              <h3>Medical Disclaimer <span className="emoji">⚠️</span></h3>
              <p style={{ color: 'rgba(255,255,255,0.8)' }}>ELMA is NOT a medical or clinical tool. It does not provide medical advice, diagnosis, or treatment. Always seek professional medical guidance for mental health concerns.</p>
            </section>

            <section style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 16, padding: '1.5rem' }}>
              <h3>Acceptance of Terms <span className="emoji">📄</span></h3>
              <p style={{ color: 'rgba(255,255,255,0.8)' }}>By accessing or using ELMA, you agree to these Terms & Conditions. If you do not agree, you must not use the platform.</p>
            </section>

            <section style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 16, padding: '1.5rem' }}>
              <h3>Eligibility <span className="emoji">✅</span></h3>
              <ul style={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.8 }}>
                <li>You must be at least 18 years old to use ELMA.</li>
                <li>By using ELMA, you confirm that you have the legal capacity to enter into this agreement.</li>
              </ul>
            </section>

            <section style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 16, padding: '1.5rem' }}>
              <h3>Account Registration and Security <span className="emoji">🔐</span></h3>
              <h4 style={{ marginTop: '1rem' }}>Registration <span className="emoji">📝</span></h4>
              <p style={{ color: 'rgba(255,255,255,0.8)' }}>You may be required to provide accurate information to create an account and use certain features.</p>
              <h4 style={{ marginTop: '1rem' }}>Security <span className="emoji">🛡️</span></h4>
              <ul style={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.8 }}>
                <li>You are responsible for maintaining the confidentiality of your account.</li>
                <li>Notify us immediately of any unauthorized use at <a href="mailto:support@elma.ltd">support@elma.ltd</a>.</li>
              </ul>
            </section>

            <section style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 16, padding: '1.5rem' }}>
              <h3>Service Description <span className="emoji">🤖</span></h3>
              <p style={{ color: 'rgba(255,255,255,0.8)' }}>ELMA is an emotional wellness companion powered by AI, designed to help users build emotional awareness and resilience.</p>
              <h4 style={{ marginTop: '1rem' }}>ELMA Provides <span className="emoji">🧰</span></h4>
              <ul style={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.8 }}>
                <li>AI-powered emotional support conversation</li>
                <li>Mood logs, emotional awareness tools, and progress tracking</li>
                <li>Access to verified psychologists upon request</li>
              </ul>
              <h4 style={{ marginTop: '1rem' }}>ELMA Does Not Provide <span className="emoji">⛔</span></h4>
              <ul style={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.8 }}>
                <li>Medical diagnosis, treatment, or crisis intervention</li>
                <li>Emergency services (call local authorities in emergencies)</li>
              </ul>
            </section>

            <section style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 16, padding: '1.5rem' }}>
              <h3>User Obligations and Conduct <span className="emoji">🚦</span></h3>
              <ul style={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.8 }}>
                <li>Use ELMA respectfully and lawfully.</li>
                <li>Do not upload harmful content or misuse the platform.</li>
                <li>Do not reverse engineer, scrape, or exploit ELMA.</li>
              </ul>
            </section>

            <section style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 16, padding: '1.5rem' }}>
              <h3>Psychologist Services <span className="emoji">🧑‍⚕️</span></h3>
              <h4 style={{ marginTop: '1rem' }}>Payments & Sessions <span className="emoji">💳</span></h4>
              <ul style={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.8 }}>
                <li>Payments are processed securely via third-party providers.</li>
                <li>Refunds are subject to provider policies and service usage.</li>
                <li>Session scheduling and cancellations follow professional availability.</li>
              </ul>
              <h4 style={{ marginTop: '1rem' }}>Professional Relationship <span className="emoji">🤝</span></h4>
              <p style={{ color: 'rgba(255,255,255,0.8)' }}>ELMA connects users to licensed professionals upon request but does not guarantee outcomes or endorse specific providers.</p>
            </section>

            <section style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 16, padding: '1.5rem' }}>
              <h3>Intellectual Property <span className="emoji">©️</span></h3>
              <p style={{ color: 'rgba(255,255,255,0.8)' }}>All content, logos, and software associated with ELMA are the property of ELMA Ltd. You may not copy, modify, or distribute content without permission.</p>
              <p style={{ color: 'rgba(255,255,255,0.8)' }}>You retain ownership of content you submit; by submitting, you grant ELMA a limited license to use it for providing services.</p>
            </section>

            <section style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 16, padding: '1.5rem' }}>
              <h3>Privacy and Data Protection <span className="emoji">🛡️</span></h3>
              <p style={{ color: 'rgba(255,255,255,0.8)' }}>Your use of ELMA is also governed by our <a href="/privacy">Privacy Policy</a>. Please review it to understand how we handle your data.</p>
            </section>

            <section style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 16, padding: '1.5rem' }}>
              <h3>Disclaimers and Limitations <span className="emoji">⚠️</span></h3>
              <ul style={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.8 }}>
                <li>ELMA is provided "as is" without warranties of any kind.</li>
                <li>We are not liable for indirect, incidental, or consequential damages.</li>
                <li>We do not guarantee uninterrupted availability or error-free operation.</li>
              </ul>
            </section>

            <section style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 16, padding: '1.5rem' }}>
              <h3>Termination <span className="emoji">🛑</span></h3>
              <h4 style={{ marginTop: '1rem' }}>By You <span className="emoji">👤</span></h4>
              <ul style={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.8 }}>
                <li>You may stop using ELMA at any time.</li>
                <li>You may request account deletion by emailing <a href="mailto:support@elma.ltd">support@elma.ltd</a>.</li>
              </ul>
              <h4 style={{ marginTop: '1rem' }}>By ELMA <span className="emoji">🏢</span></h4>
              <ul style={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.8 }}>
                <li>We may suspend or terminate accounts that violate these terms.</li>
                <li>We may modify or discontinue features with prior notice where reasonable.</li>
              </ul>
            </section>

            <section style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 16, padding: '1.5rem' }}>
              <h3>Governing Law and Jurisdiction <span className="emoji">⚖️</span></h3>
              <p style={{ color: 'rgba(255,255,255,0.8)' }}>These terms are governed by the laws of India. Any disputes will be subject to the exclusive jurisdiction of courts in Bangalore, India.</p>
            </section>

            <section style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 16, padding: '1.5rem' }}>
              <h3>Dispute Resolution <span className="emoji">🧾</span></h3>
              <h4 style={{ marginTop: '1rem' }}>Informal Resolution <span className="emoji">🗣️</span></h4>
              <p style={{ color: 'rgba(255,255,255,0.8)' }}>Contact us at <a href="mailto:support@elma.ltd">support@elma.ltd</a> to resolve concerns informally before escalating.</p>
              <h4 style={{ marginTop: '1rem' }}>Arbitration <span className="emoji">⚖️</span></h4>
              <p style={{ color: 'rgba(255,255,255,0.8)' }}>If a dispute cannot be resolved, it may be referred to arbitration in Bangalore, India, in accordance with applicable laws.</p>
            </section>

            <section style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 16, padding: '1.5rem' }}>
              <h3>General Provisions <span className="emoji">📜</span></h3>
              <ul style={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.8 }}>
                <li>If any provision is found invalid, the rest remain in effect.</li>
                <li>These terms constitute the entire agreement between you and ELMA.</li>
                <li>We may update these terms from time to time; continued use implies acceptance.</li>
                <li>We will notify users of material changes where appropriate.</li>
              </ul>
            </section>

            <section style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 16, padding: '1.5rem' }}>
              <h3>Contact Information <span className="emoji">📞</span></h3>
              <ul style={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.8 }}>
                <li>Email: <a href="mailto:support@elma.ltd">support@elma.ltd</a></li>
                <li>Address: ELMA Wellness LLP, Jaipur, Rajasthan, India</li>
              </ul>
            </section>

            <section style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 16, padding: '1.5rem' }}>
              <h3>Well-being Notice <span className="emoji">❤️‍🩹</span></h3>
              <p style={{ color: 'rgba(255,255,255,0.8)' }}>If you are in crisis or experiencing severe distress, contact local emergency services or a trusted mental health professional immediately.</p>
            </section>
          </div>
        </div>
      </section>
    </main>
  )
}

export default Terms