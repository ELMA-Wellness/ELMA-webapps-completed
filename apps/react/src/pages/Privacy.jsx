import React from 'react'

function Privacy() {
  return (
    <main>
      <section className="subpage">
        <div className="container">
          <header style={{ marginBottom: '2rem', textAlign: 'center', marginTop: '2rem' }}>
            <h1>Privacy Policy <span className="emoji">🔒</span></h1>
            <p style={{ opacity: 0.8, fontStyle: 'italic' }}>Last Updated: September 2025</p>
          </header>

          {/* Imported content from privacy.html, formatted for React */}
          <div style={{ display: 'grid', gap: '1.5rem', maxWidth: '900px', margin: '0 auto' }}>
            <section style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 16, padding: '1.5rem' }}>
              <h3>Important Notice <span className="emoji">⚠️</span></h3>
              <p style={{ color: 'rgba(255,255,255,0.8)' }}>ELMA is an emotional companion application designed to support your emotional wellness journey. ELMA is NOT a medical or clinical tool and does not provide medical advice, diagnosis, or treatment. All data shared with ELMA is for emotional wellness support purposes only.</p>
            </section>

            <section style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 16, padding: '1.5rem' }}>
              <h3>Introduction <span className="emoji">📘</span></h3>
              <p style={{ color: 'rgba(255,255,255,0.8)' }}>We are committed to protecting your privacy and giving you control over your personal information. This policy explains how we collect, use, disclose, and safeguard your information when you use ELMA.</p>
              <p style={{ color: 'rgba(255,255,255,0.8)' }}>We comply with:</p>
              <ul style={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.8 }}>
                <li>India's Digital Personal Data Protection Act (DPDP) 2023</li>
                <li>United Kingdom General Data Protection Regulation (UK GDPR)</li>
                <li>Australia Privacy Act 1988 and Australian Privacy Principles</li>
              </ul>
            </section>

            <section style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 16, padding: '1.5rem' }}>
              <h3>Information We Collect <span className="emoji">🗂️</span></h3>
              <h4 style={{ marginTop: '1rem' }}>Personal Information <span className="emoji">👤</span></h4>
              <ul style={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.8 }}>
                <li>Name and email address (for account creation)</li>
                <li>Age range and general location (country/city)</li>
                <li>Communication preferences</li>
              </ul>
              <h4 style={{ marginTop: '1rem' }}>Emotional Wellness Data <span className="emoji">🧠</span></h4>
              <ul style={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.8 }}>
                <li>Mood logs and emotional patterns</li>
                <li>Daily check-in responses</li>
                <li>Interaction with emotional skill games</li>
                <li>Chat conversations with ELMA AI companion</li>
                <li>Progress tracking and growth metrics</li>
              </ul>
              <h4 style={{ marginTop: '1rem' }}>Usage Information <span className="emoji">📊</span></h4>
              <ul style={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.8 }}>
                <li>App usage patterns and frequency</li>
                <li>Features accessed and time spent</li>
                <li>Device information (type, OS version)</li>
                <li>IP address for security purposes</li>
              </ul>
              <h4 style={{ marginTop: '1rem' }}>Professional Information (For Psychologists) <span className="emoji">🧑‍⚕️</span></h4>
              <ul style={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.8 }}>
                <li>Professional credentials and license numbers</li>
                <li>Areas of expertise</li>
                <li>Availability schedule</li>
                <li>Professional contact information</li>
              </ul>
            </section>

            <section style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 16, padding: '1.5rem' }}>
              <h3>How We Use Your Information <span className="emoji">🔍</span></h3>
              <p style={{ color: 'rgba(255,255,255,0.8)' }}>We use your information to:</p>
              <ul style={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.8 }}>
                <li>Provide personalized emotional wellness support</li>
                <li>Track your emotional growth and progress</li>
                <li>Improve ELMA's AI responses and features</li>
                <li>Connect you with verified psychologists (if requested)</li>
                <li>Send wellness tips and updates (with consent)</li>
                <li>Ensure platform security and prevent misuse</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 16, padding: '1.5rem' }}>
              <h3>Data Storage and Security <span className="emoji">🔐</span></h3>
              <ul style={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.8 }}>
                <li>Encrypted transmission using SSL/TLS</li>
                <li>Personal information encrypted at rest</li>
                <li>Restricted access to authorized personnel</li>
                <li>Regular security audits and updates</li>
                <li>Data centers comply with international security standards</li>
              </ul>
            </section>

            <section style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 16, padding: '1.5rem' }}>
              <h3>Data Sharing and Disclosure <span className="emoji">🔄</span></h3>
              <p style={{ color: 'rgba(255,255,255,0.8)' }}>We DO NOT sell, trade, or rent your personal information. We may share data only in these circumstances:</p>
              <ul style={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.8 }}>
                <li><strong>With your consent:</strong> When you explicitly agree to share</li>
                <li><strong>With psychologists:</strong> Only when you book a session (limited information shared)</li>
                <li><strong>For legal compliance:</strong> When required by law or court order</li>
                <li><strong>For safety:</strong> To prevent harm or illegal activities</li>
                <li><strong>Anonymized data:</strong> For research (de-identified)</li>
              </ul>
            </section>

            <section style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 16, padding: '1.5rem' }}>
              <h3>Your Rights and Controls <span className="emoji">⚖️</span></h3>
              <ul style={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.8 }}>
                <li>Access & Portability: Request a copy of your personal data</li>
                <li>Correction: Update or correct your information</li>
                <li>Deletion: Request deletion of your account and data</li>
                <li>Consent Withdrawal: Withdraw consent anytime</li>
                <li>Data Minimization: Choose what information to share</li>
              </ul>
              <h4 style={{ marginTop: '1rem' }}>To Request Deletion <span className="emoji">🗑️</span>:</h4>
              <ul style={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.8 }}>
                <li>Email us at privacy@elma.ltd</li>
                <li>Include your registered email and account details</li>
                <li>We will process deletion within 30 days</li>
              </ul>
            </section>

            <section style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 16, padding: '1.5rem' }}>
              <h3>Additional Policies <span className="emoji">📑</span></h3>
              <h4 style={{ marginTop: '0.75rem' }}>Children's Privacy <span className="emoji">👶</span></h4>
              <p style={{ color: 'rgba(255,255,255,0.8)' }}>ELMA is designed for users aged 18 and above. We do not knowingly collect information from children under 18. If we discover such data, we will delete it immediately.</p>
              <h4 style={{ marginTop: '0.75rem' }}>International Data Transfers <span className="emoji">🌍</span></h4>
              <p style={{ color: 'rgba(255,255,255,0.8)' }}>Your data may be transferred globally with appropriate safeguards, including Standard Contractual Clauses and cross-border agreements.</p>
              <h4 style={{ marginTop: '0.75rem' }}>Cookies and Tracking <span className="emoji">🍪</span></h4>
              <p style={{ color: 'rgba(255,255,255,0.8)' }}>We use minimal cookies for session management, preferences, and anonymized analytics.</p>
              <h4 style={{ marginTop: '0.75rem' }}>Data Retention <span className="emoji">🗄️</span></h4>
              <ul style={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.8 }}>
                <li>Active account data: As long as your account is active</li>
                <li>Mood logs: Up to 2 years for pattern analysis</li>
                <li>Deleted account data: Removed within 30 days</li>
                <li>Legal compliance data: As required by law</li>
              </ul>
            </section>

            <section style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 16, padding: '1.5rem' }}>
              <h3>Contact Us <span className="emoji">📞</span></h3>
              <p style={{ color: 'rgba(255,255,255,0.8)' }}>For privacy-related questions or concerns:</p>
              <ul style={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.8 }}>
                <li>General Privacy: <a href="mailto:privacy@elma.ltd">privacy@elma.ltd</a></li>
                <li>Data Protection Officer: <a href="mailto:dpo@elma.ltd">dpo@elma.ltd</a></li>
                <li>Address: ELMA Wellness LLP, Jaipur, Rajasthan, India</li>
              </ul>
            </section>

            <section style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 16, padding: '1.5rem' }}>
              <h3>Compliance Information <span className="emoji">📜</span></h3>
              <h4 style={{ marginTop: '0.75rem' }}>For Indian Users (DPDP Act 2023) <span className="emoji">🇮🇳</span></h4>
              <p style={{ color: 'rgba(255,255,255,0.8)' }}>You have the right to access, correct, and erase your data. Consent can be withdrawn at any time. Grievances can be raised with our Data Protection Officer.</p>
              <h4 style={{ marginTop: '0.75rem' }}>For UK Users (UK GDPR) <span className="emoji">🇬🇧</span></h4>
              <p style={{ color: 'rgba(255,255,255,0.8)' }}>You have rights under UK GDPR including access, rectification, erasure, restriction, portability, and objection. You may lodge complaints with the Information Commissioner's Office (ICO).</p>
              <h4 style={{ marginTop: '0.75rem' }}>For Australian Users (Privacy Act 1988) <span className="emoji">🇦🇺</span></h4>
              <p style={{ color: 'rgba(255,255,255,0.8)' }}>We comply with Australian Privacy Principles. You may access and correct your information and lodge complaints with the Office of the Australian Information Commissioner (OAIC).</p>
            </section>

            <section style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 16, padding: '1.5rem' }}>
              <h3>Remember <span className="emoji">❤️</span></h3>
              <p style={{ color: 'rgba(255,255,255,0.8)' }}>Your emotional wellness journey is personal and private. We are committed to protecting your data while supporting your growth. You always have control over your information.</p>
            </section>
          </div>
        </div>
      </section>
    </main>
  )
}

export default Privacy