import React from 'react'

function Privacy() {
  return (
    <main>
      <section className="subpage">
        <div className="container">
          <header style={{ marginBottom: '2rem', textAlign: 'center', marginTop: '2rem' }}>
            <h1>Privacy Policy <span className="emoji">🔒</span></h1>
            <p style={{ opacity: 0.8, fontStyle: 'italic' }}>Last Updated: December 2025</p>
          </header>

          <div style={{ display: 'grid', gap: '1.5rem', maxWidth: '900px', margin: '0 auto' }}>
            {/* 1. WHO THIS POLICY APPLIES TO */}
            <section style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 16, padding: '1.5rem' }}>
              <h3>1. Who This Policy Applies To <span className="emoji">👥</span></h3>
              <p style={{ color: 'rgba(255,255,255,0.8)' }}>This Policy applies to:</p>
              <ul style={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.8 }}>
                <li>Users of the ELMA mobile app and website</li>
                <li>Individuals interacting with ELMA AI</li>
                <li>Users booking sessions with psychologists through ELMA</li>
              </ul>
              <p style={{ color: 'rgba(255,255,255,0.8)' }}>ELMA is intended only for users aged 18 years or older. We do not knowingly collect data from anyone under 18.</p>
            </section>

            {/* 2. WHAT ELMA DOES (CONTEXT) */}
            <section style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 16, padding: '1.5rem' }}>
              <h3>2. What ELMA Does (Context) <span className="emoji">🧠</span></h3>
              <p style={{ color: 'rgba(255,255,255,0.8)' }}>ELMA is an emotional wellness support platform that:</p>
              <ul style={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.8 }}>
                <li>offers AI-based emotional support tools, and</li>
                <li>enables access to independent third-party psychologists for online sessions.</li>
              </ul>
              <p style={{ color: 'rgba(255,255,255,0.8)' }}>ELMA is not a medical provider, not an emergency service, and not a replacement for professional care.</p>
            </section>

            {/* 3. INFORMATION WE COLLECT */}
            <section style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 16, padding: '1.5rem' }}>
              <h3>3. Information We Collect <span className="emoji">🗂️</span></h3>
              <h4 style={{ marginTop: '1rem' }}>3.1 Information you provide directly</h4>
              <p style={{ color: 'rgba(255,255,255,0.8)' }}>Depending on how you use ELMA, we may collect:</p>
              <ul style={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.8 }}>
                <li>Mobile number, email address, or authentication credentials</li>
                <li>Profile details you choose to share</li>
                <li>Messages you type to ELMA AI</li>
                <li>Voice input you choose to submit</li>
                <li>Booking information for therapy sessions</li>
                <li>Support or feedback communications</li>
              </ul>
              <p style={{ color: 'rgba(255,255,255,0.8)' }}>You should not share:</p>
              <ul style={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.8 }}>
                <li>passwords</li>
                <li>bank details</li>
                <li>government IDs</li>
                <li>highly sensitive personal identifiers</li>
              </ul>

              <h4 style={{ marginTop: '1rem' }}>3.2 AI & voice interactions</h4>
              <p style={{ color: 'rgba(255,255,255,0.8)' }}>If you use AI chat or voice features:</p>
              <ul style={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.8 }}>
                <li>Text and/or voice input may be processed to generate responses</li>
                <li>Voice features require microphone permission (controlled by your device)</li>
                <li>Voice input may be converted to text to function properly</li>
              </ul>
              <p style={{ color: 'rgba(255,255,255,0.8)' }}>ELMA does not use AI interactions to diagnose or treat medical conditions.</p>

              <h4 style={{ marginTop: '1rem' }}>3.3 Therapy-related data</h4>
              <p style={{ color: 'rgba(255,255,255,0.8)' }}>For therapy sessions, ELMA may process:</p>
              <ul style={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.8 }}>
                <li>Booking details (date, time, therapist ID)</li>
                <li>Payment and transaction records</li>
                <li>Limited session metadata required to operate the platform</li>
              </ul>
              <p style={{ color: 'rgba(255,255,255,0.8)' }}>ELMA does not record therapy sessions unless explicitly stated and consented.</p>

              <h4 style={{ marginTop: '1rem' }}>3.4 Automatically collected information</h4>
              <p style={{ color: 'rgba(255,255,255,0.8)' }}>We may collect:</p>
              <ul style={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.8 }}>
                <li>Device type and operating system</li>
                <li>App version</li>
                <li>Log data (crashes, errors)</li>
                <li>IP address (for security and fraud prevention)</li>
                <li>Session timestamps</li>
              </ul>
            </section>

            {/* 4. HOW WE USE YOUR DATA */}
            <section style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 16, padding: '1.5rem' }}>
              <h3>4. How We Use Your Data <span className="emoji">🔍</span></h3>
              <p style={{ color: 'rgba(255,255,255,0.8)' }}>We use your data to:</p>
              <ul style={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.8 }}>
                <li>Operate and improve the ELMA platform</li>
                <li>Enable AI emotional support features</li>
                <li>Facilitate therapy bookings and payments</li>
                <li>Ensure safety, security, and abuse prevention</li>
                <li>Comply with legal obligations</li>
                <li>Respond to support or legal requests</li>
              </ul>
              <p style={{ color: 'rgba(255,255,255,0.8)' }}>We do not use your data to:</p>
              <ul style={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.8 }}>
                <li>sell personal information</li>
                <li>run targeted advertising based on sensitive emotional content</li>
              </ul>
            </section>

            {/* 5. LEGAL BASIS FOR PROCESSING (GDPR & DPDP) */}
            <section style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 16, padding: '1.5rem' }}>
              <h3>5. Legal Basis for Processing (GDPR & DPDP) <span className="emoji">📜</span></h3>
              <p style={{ color: 'rgba(255,255,255,0.8)' }}>We process personal data based on:</p>
              <ul style={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.8 }}>
                <li>Your explicit consent (primary basis)</li>
                <li>Performance of a contract (providing services you request)</li>
                <li>Legal obligations</li>
                <li>Legitimate interests (platform security, fraud prevention)</li>
              </ul>
              <p style={{ color: 'rgba(255,255,255,0.8)' }}>You may withdraw consent at any time, subject to legal and operational limits.</p>
            </section>

            {/* 6. AI-SPECIFIC DISCLOSURE */}
            <section style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 16, padding: '1.5rem' }}>
              <h3>6. AI-Specific Disclosure <span className="emoji">🤖</span></h3>
              <ul style={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.8 }}>
                <li>AI responses are generated automatically and may be imperfect.</li>
                <li>AI is used only for emotional wellness support.</li>
                <li>AI does not provide medical, legal, or professional advice.</li>
                <li>You remain responsible for decisions you make.</li>
              </ul>
            </section>

            {/* 7. SHARING OF DATA */}
            <section style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 16, padding: '1.5rem' }}>
              <h3>7. Sharing of Data <span className="emoji">🔄</span></h3>
              <p style={{ color: 'rgba(255,255,255,0.8)' }}>We may share limited data with:</p>
              <ul style={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.8 }}>
                <li>Cloud infrastructure providers</li>
                <li>Payment gateways</li>
                <li>Analytics and security providers</li>
                <li>Licensed psychologists (only what is necessary for sessions)</li>
                <li>Legal authorities if required by law</li>
              </ul>
              <p style={{ color: 'rgba(255,255,255,0.8)' }}>All third parties are required to follow appropriate data protection standards.</p>
            </section>

            {/* 8. INTERNATIONAL DATA TRANSFERS */}
            <section style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 16, padding: '1.5rem' }}>
              <h3>8. International Data Transfers <span className="emoji">🌍</span></h3>
              <p style={{ color: 'rgba(255,255,255,0.8)' }}>Your data may be processed or stored outside your country (including India, EU, or other regions) using secure cloud services. Where required, we rely on:</p>
              <ul style={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.8 }}>
                <li>contractual safeguards</li>
                <li>standard data protection measures</li>
                <li>applicable legal mechanisms</li>
              </ul>
            </section>

            {/* 9. DATA RETENTION */}
            <section style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 16, padding: '1.5rem' }}>
              <h3>9. Data Retention <span className="emoji">🗄️</span></h3>
              <p style={{ color: 'rgba(255,255,255,0.8)' }}>We retain personal data:</p>
              <ul style={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.8 }}>
                <li>only as long as necessary for the purposes stated</li>
                <li>or as required by law, security, or dispute resolution</li>
              </ul>
              <p style={{ color: 'rgba(255,255,255,0.8)' }}>You may request deletion of your account and associated data, subject to legal retention requirements.</p>
            </section>

            {/* 10. YOUR RIGHTS */}
            <section style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 16, padding: '1.5rem' }}>
              <h3>10. Your Rights <span className="emoji">⚖️</span></h3>
              <p style={{ color: 'rgba(255,255,255,0.8)' }}>Depending on your jurisdiction, you may have the right to:</p>
              <ul style={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.8 }}>
                <li>access your personal data</li>
                <li>correct inaccurate data</li>
                <li>request deletion</li>
                <li>withdraw consent</li>
                <li>restrict or object to processing</li>
                <li>lodge a complaint with a data protection authority</li>
              </ul>
              <p style={{ color: 'rgba(255,255,255,0.8)' }}>Requests can be made via the contact details below.</p>
            </section>

            {/* 11. SECURITY MEASURES */}
            <section style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 16, padding: '1.5rem' }}>
              <h3>11. Security Measures <span className="emoji">🔐</span></h3>
              <p style={{ color: 'rgba(255,255,255,0.8)' }}>We use reasonable administrative, technical, and organizational safeguards to protect your data, including:</p>
              <ul style={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.8 }}>
                <li>encryption</li>
                <li>access controls</li>
                <li>secure infrastructure</li>
              </ul>
              <p style={{ color: 'rgba(255,255,255,0.8)' }}>However, no system is 100% secure, and you acknowledge this risk.</p>
            </section>

            {/* 12. CHILDREN’S PRIVACY (STRICT) */}
            <section style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 16, padding: '1.5rem' }}>
              <h3>12. Children’s Privacy (Strict) <span className="emoji">👶</span></h3>
              <p style={{ color: 'rgba(255,255,255,0.8)' }}>ELMA is 18+ only.</p>
              <ul style={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.8 }}>
                <li>We do not knowingly collect data from minors.</li>
                <li>Accounts identified as belonging to users under 18 will be terminated.</li>
              </ul>
            </section>

            {/* 13. COOKIES & TRACKING */}
            <section style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 16, padding: '1.5rem' }}>
              <h3>13. Cookies & Tracking <span className="emoji">🍪</span></h3>
              <p style={{ color: 'rgba(255,255,255,0.8)' }}>Our website may use cookies or similar technologies for:</p>
              <ul style={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.8 }}>
                <li>functionality</li>
                <li>security</li>
                <li>analytics</li>
              </ul>
              <p style={{ color: 'rgba(255,255,255,0.8)' }}>You can manage cookie preferences via your browser settings.</p>
            </section>

            {/* 14. CHANGES TO THIS POLICY */}
            <section style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 16, padding: '1.5rem' }}>
              <h3>14. Changes to This Policy <span className="emoji">🔄</span></h3>
              <p style={{ color: 'rgba(255,255,255,0.8)' }}>We may update this Privacy Policy from time to time.</p>
              <p style={{ color: 'rgba(255,255,255,0.8)' }}>Material changes will be communicated via the app or website.</p>
              <p style={{ color: 'rgba(255,255,255,0.8)' }}>Continued use after changes means acceptance of the updated Policy.</p>
            </section>

            {/* 15. CONTACT & GRIEVANCE REDRESSAL */}
            <section style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 16, padding: '1.5rem' }}>
              <h3>15. Contact & Grievance Redressal <span className="emoji">📞</span></h3>
              <p style={{ color: 'rgba(255,255,255,0.8)' }}>If you have questions, concerns, or data requests:</p>
              <ul style={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.8 }}>
                <li>Grievance / Privacy Officer</li>
                <li>ELMA Emotion Solutions LLP</li>
                <li>📧 <a href="mailto:privacy@elma.ltd">privacy@elma.ltd</a></li>
                <li>Address: ELMA Emotion Solutions LLP, Jaipur, Rajasthan, India</li>
              </ul>
              <p style={{ color: 'rgba(255,255,255,0.8)' }}>We aim to respond within a reasonable timeframe as required by law.</p>
            </section>

            {/* 16. GOVERNING LAW */}
            <section style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 16, padding: '1.5rem' }}>
              <h3>16. Governing Law <span className="emoji">📚</span></h3>
              <p style={{ color: 'rgba(255,255,255,0.8)' }}>This Privacy Policy is governed by the laws of India, subject to mandatory consumer and data protection rights applicable in your jurisdiction.</p>
            </section>

            {/* FINAL NOTE TO USERS */}
            <section style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 16, padding: '1.5rem' }}>
              <h3>Final Note to Users <span className="emoji">❤️</span></h3>
              <p style={{ color: 'rgba(255,255,255,0.8)' }}>ELMA is built with care, respect, and privacy in mind.</p>
              <p style={{ color: 'rgba(255,255,255,0.8)' }}>You control what you share.</p>
              <p style={{ color: 'rgba(255,255,255,0.8)' }}>You can stop using the Platform at any time.</p>
            </section>
          </div>
        </div>
      </section>
    </main>
  )
}

export default Privacy
