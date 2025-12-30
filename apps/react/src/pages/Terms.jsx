import React from 'react'

function Terms() {
  return (
    <main>
      <section className="subpage">
        <div className="container">
          <header style={{ marginBottom: '2rem', textAlign: 'center', marginTop: '2rem' }}>
            <h1>Platform Terms & Conditions <span className="emoji">📜</span></h1>
            <p style={{ opacity: 0.8, fontStyle: 'italic' }}>Last Updated: December 2025</p>
          </header>

          <div style={{ display: 'grid', gap: '1.5rem', maxWidth: '900px', margin: '0 auto' }}>
            {/* 1. ELMA’S ROLE (WHAT ELMA IS AND IS NOT) */}
            <section style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 16, padding: '1.5rem' }}>
              <h3>1. ELMA’s Role <span className="emoji">🏷️</span></h3>
              <h4 style={{ marginTop: '1rem' }}>1.1 What ELMA is</h4>
              <ul style={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.8 }}>
                <li>ELMA is a digital emotional wellness support platform that offers:</li>
                <li>• AI-based emotional support tools, and</li>
                <li>• access to independent third-party mental wellness professionals (e.g., psychologists) for online sessions.</li>
              </ul>
              <h4 style={{ marginTop: '1rem' }}>1.2 What ELMA is not</h4>
              <ul style={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.8 }}>
                <li>ELMA is not:</li>
                <li>• a hospital, clinic, medical provider, or emergency service;</li>
                <li>• a psychiatric or medical treatment provider;</li>
                <li>• a crisis intervention service;</li>
                <li>• a substitute for licensed medical/psychiatric care;</li>
                <li>• a replacement for real-life relationships, community support, or professional care.</li>
              </ul>
              <h4 style={{ marginTop: '1rem' }}>1.3 No doctor–patient relationship with ELMA</h4>
              <p style={{ color: 'rgba(255,255,255,0.8)' }}>Your use of ELMA does not create any doctor–patient, therapist–patient, fiduciary, or similar professional relationship between you and ELMA.</p>
            </section>

            {/* 2. ELIGIBILITY, AGE, AND ACCOUNT */}
            <section style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 16, padding: '1.5rem' }}>
              <h3>2. Eligibility, Age, and Account <span className="emoji">✅</span></h3>
              <h4 style={{ marginTop: '1rem' }}>2.1 Eligibility and Age Restriction</h4>
              <ul style={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.8 }}>
                <li>ELMA is intended only for users who are 18 years of age or older.</li>
                <li>By creating an account or using the Platform, you confirm that you are at least 18 years old.</li>
                <li>ELMA does not knowingly collect data from anyone under 18.</li>
                <li>If ELMA becomes aware that a user is under 18, the account will be immediately suspended or deleted without notice.</li>
                <li>Parents or guardians who believe a minor has accessed ELMA should contact us immediately for account removal.</li>
              </ul>
              <h4 style={{ marginTop: '1rem' }}>2.2 Account accuracy</h4>
              <p style={{ color: 'rgba(255,255,255,0.8)' }}>You agree to provide accurate information and keep it updated. You are responsible for all activity under your account.</p>
              <h4 style={{ marginTop: '1rem' }}>2.3 Security</h4>
              <p style={{ color: 'rgba(255,255,255,0.8)' }}>You must keep login credentials confidential. You agree to notify ELMA immediately if you suspect unauthorized access.</p>
            </section>

            {/* 3. AI COMPANION (ELMA AI) — STRICT LIMITATIONS */}
            <section style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 16, padding: '1.5rem' }}>
              <h3>3. AI Companion (ELMA AI) — Strict Limitations <span className="emoji">🤖</span></h3>
              <h4 style={{ marginTop: '1rem' }}>3.1 What ELMA AI does</h4>
              <p style={{ color: 'rgba(255,255,255,0.8)' }}>ELMA AI provides general emotional wellness support such as reflection, grounding, supportive conversation, and simple wellness suggestions.</p>
              <h4 style={{ marginTop: '1rem' }}>3.2 What ELMA AI does not do</h4>
              <ul style={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.8 }}>
                <li>ELMA AI is not human and is not a medical professional;</li>
                <li>does not provide medical, psychiatric, legal, financial, or other professional advice;</li>
                <li>does not diagnose, prescribe, or treat any condition;</li>
                <li>is not intended to be used for emergencies.</li>
              </ul>
              <h4 style={{ marginTop: '1rem' }}>3.3 AI limitations and user responsibility</h4>
              <ul style={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.8 }}>
                <li>AI outputs may be inaccurate, incomplete, or inappropriate for your situation.</li>
                <li>ELMA AI responses are automatically generated.</li>
                <li>You are solely responsible for how you interpret and act on them.</li>
                <li>You will not rely on ELMA AI as a substitute for professional judgment or emergency help.</li>
              </ul>
            </section>

            {/* 4. CRISIS AND EMERGENCY DISCLAIMER */}
            <section style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 16, padding: '1.5rem' }}>
              <h3>4. Crisis and Emergency Disclaimer <span className="emoji">🚨</span></h3>
              <h4 style={{ marginTop: '1rem' }}>4.1 Not an emergency service</h4>
              <p style={{ color: 'rgba(255,255,255,0.8)' }}>ELMA is not suitable for emergencies. If you are at risk of harming yourself or others, or in immediate danger, you must seek immediate help from local emergency services or a trusted person.</p>
              <h4 style={{ marginTop: '1rem' }}>4.2 Crisis resources</h4>
              <p style={{ color: 'rgba(255,255,255,0.8)' }}>ELMA may display crisis resources as a convenience but does not provide emergency response or monitoring.</p>
            </section>

            {/* 5. PROFESSIONALS (PSYCHOLOGISTS) — THIRD-PARTY MARKETPLACE ROLE */}
            <section style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 16, padding: '1.5rem' }}>
              <h3>5. Professionals — Third-Party Marketplace Role <span className="emoji">👩‍⚕️</span></h3>
              <h4 style={{ marginTop: '1rem' }}>5.1 Independent professionals</h4>
              <p style={{ color: 'rgba(255,255,255,0.8)' }}>Psychologists and other professionals available through ELMA are independent third parties. They are not ELMA employees, agents, or representatives.</p>
              <h4 style={{ marginTop: '1rem' }}>5.2 ELMA does not control clinical judgment</h4>
              <p style={{ color: 'rgba(255,255,255,0.8)' }}>ELMA does not supervise, direct, or control the professional services provided, and is not responsible for clinical judgment, outcomes, or professional conduct.</p>
              <h4 style={{ marginTop: '1rem' }}>5.3 User–professional relationship</h4>
              <p style={{ color: 'rgba(255,255,255,0.8)' }}>Any professional relationship created is between you and the professional. Any dispute regarding professional services is primarily between you and the professional, subject to applicable law.</p>
            </section>

            {/* 6. PLATFORM-ONLY RULE (ANTI-CIRCUMVENTION) */}
            <section style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 16, padding: '1.5rem' }}>
              <h3>6. Platform-Only Rule (Anti-Circumvention) <span className="emoji">🧭</span></h3>
              <h4 style={{ marginTop: '1rem' }}>6.1 No off-platform solicitation</h4>
              <p style={{ color: 'rgba(255,255,255,0.8)' }}>You agree not to use ELMA to arrange, solicit, or accept sessions, payments, or ongoing engagements outside the Platform with any professional discovered through ELMA.</p>
              <h4 style={{ marginTop: '1rem' }}>6.2 Enforcement</h4>
              <p style={{ color: 'rgba(255,255,255,0.8)' }}>Circumvention may lead to account suspension/termination, and you may lose access without refund to the extent permitted by law.</p>
            </section>

            {/* 7. USER CONDUCT (STRICT) */}
            <section style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 16, padding: '1.5rem' }}>
              <h3>7. User Conduct (Strict) <span className="emoji">🚦</span></h3>
              <ul style={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.8 }}>
                <li>Do not harass, threaten, exploit, or abuse any person.</li>
                <li>Do not attempt to obtain personal contact details to bypass the Platform.</li>
                <li>Do not upload unlawful, defamatory, hateful, or harmful content.</li>
                <li>Do not misuse the AI to generate harmful instructions or content.</li>
                <li>Do not reverse engineer, disrupt, or attempt unauthorized access.</li>
                <li>Do not manipulate reviews, ratings, or platform integrity.</li>
              </ul>
              <p style={{ color: 'rgba(255,255,255,0.8)' }}>ELMA may take protective action including suspension or termination.</p>
            </section>

            {/* 8. PAYMENTS, REFUNDS, AND CHARGES */}
            <section style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 16, padding: '1.5rem' }}>
              <h3>8. Payments, Refunds, and Charges <span className="emoji">💳</span></h3>
              <h4 style={{ marginTop: '1rem' }}>8.1 Payments</h4>
              <p style={{ color: 'rgba(255,255,255,0.8)' }}>ELMA facilitates payments for services and may charge platform fees. Payment processing may involve third-party payment providers.</p>
              <h4 style={{ marginTop: '1rem' }}>8.2 Refunds/rescheduling</h4>
              <p style={{ color: 'rgba(255,255,255,0.8)' }}>Refund and rescheduling rules are governed by ELMA’s refund/cancellation policy presented at checkout or in the relevant flow. Where required by law, mandatory consumer rights apply.</p>
              <h4 style={{ marginTop: '1rem' }}>8.3 No liability for third-party failures</h4>
              <p style={{ color: 'rgba(255,255,255,0.8)' }}>ELMA is not responsible for failures or delays caused by payment gateways, banks, networks, or third-party services.</p>
            </section>

            <section style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 16, padding: '1.5rem' }}>
              <h3>9. Privacy, Data, and Consent <span className="emoji">🛡️</span></h3>
              <h4 style={{ marginTop: '1rem' }}>9.1 Privacy Policy controls</h4>
              <p style={{ color: 'rgba(255,255,255,0.8)' }}>Your use of ELMA is also governed by the ELMA Privacy Policy. If there is a conflict, the Privacy Policy governs data handling.</p>
              <h4 style={{ marginTop: '1rem' }}>9.2 Consent and feature-specific disclosures</h4>
              <p style={{ color: 'rgba(255,255,255,0.8)' }}>ELMA may require additional feature-specific consents (e.g., AI chat, voice features, therapy sessions). By using those features, you agree to the relevant disclosures and consents.</p>
              <h4 style={{ marginTop: '1rem' }}>9.3 Data rights and requests</h4>
              <p style={{ color: 'rgba(255,255,255,0.8)' }}>You may request access, correction, or deletion of your data subject to legal requirements and security obligations, as described in the Privacy Policy.</p>
            </section>

            <section style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 16, padding: '1.5rem' }}>
              <h3>10. Technical Limitations <span className="emoji">🛠️</span></h3>
              <p style={{ color: 'rgba(255,255,255,0.8)' }}>ELMA does not guarantee uninterrupted operation. You acknowledge the Platform may be affected by:</p>
              <ul style={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.8 }}>
                <li>device limitations</li>
                <li>OS updates</li>
                <li>internet outages</li>
                <li>maintenance</li>
                <li>third-party service disruptions</li>
              </ul>
            </section>

            <section style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 16, padding: '1.5rem' }}>
              <h3>11. Intellectual Property <span className="emoji">©️</span></h3>
              <p style={{ color: 'rgba(255,255,255,0.8)' }}>ELMA and its logos, UI, and platform content are owned by ELMA or licensors. You may not copy, modify, distribute, or exploit ELMA IP without permission.</p>
            </section>

            <section style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 16, padding: '1.5rem' }}>
              <h3>12. Reputation, Public Sharing, and Misrepresentation <span className="emoji">📣</span></h3>
              <p style={{ color: 'rgba(255,255,255,0.8)' }}>You agree not to:</p>
              <ul style={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.8 }}>
                <li>publish ELMA content or conversations in a misleading way,</li>
                <li>misrepresent ELMA’s services as medical diagnosis/treatment,</li>
                <li>defame or harass professionals or users.</li>
              </ul>
              <p style={{ color: 'rgba(255,255,255,0.8)' }}>ELMA may take action to protect safety and reputation.</p>
            </section>

            <section style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 16, padding: '1.5rem' }}>
              <h3>13. Limitation of Liability (Maximum Protection) <span className="emoji">⚖️</span></h3>
              <p style={{ color: 'rgba(255,255,255,0.8)' }}>To the fullest extent permitted by law:</p>
              <ul style={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.8 }}>
                <li>ELMA is not liable for emotional outcomes, distress, or any reliance on AI outputs.</li>
                <li>ELMA is not liable for professional services, clinical outcomes, or disputes between users and professionals.</li>
                <li>ELMA is not liable for indirect, incidental, special, consequential, or punitive damages.</li>
              </ul>
              <p style={{ color: 'rgba(255,255,255,0.8)' }}>If liability cannot be excluded, ELMA’s total liability will be limited to the fees you paid to ELMA in the 30 days immediately before the event giving rise to the claim.</p>
            </section>

            <section style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 16, padding: '1.5rem' }}>
              <h3>14. Termination and Safety Actions <span className="emoji">🛑</span></h3>
              <p style={{ color: 'rgba(255,255,255,0.8)' }}>ELMA may suspend or terminate your account at any time if required for:</p>
              <ul style={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.8 }}>
                <li>safety</li>
                <li>legal compliance</li>
                <li>suspected fraud</li>
                <li>policy violations</li>
                <li>platform integrity</li>
              </ul>
            </section>

            <section style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 16, padding: '1.5rem' }}>
              <h3>15. Changes to Terms <span className="emoji">📝</span></h3>
              <p style={{ color: 'rgba(255,255,255,0.8)' }}>We may update these Terms from time to time. If changes are material, we will provide notice within the app or website. Continued use after updates means you accept the updated Terms.</p>
            </section>

            <section style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 16, padding: '1.5rem' }}>
              <h3>16. Governing Law and Jurisdiction <span className="emoji">📜</span></h3>
              <p style={{ color: 'rgba(255,255,255,0.8)' }}>These Terms are governed by the laws of India. Courts of Jaipur, Rajasthan, India shall have exclusive jurisdiction, subject to mandatory consumer protections where applicable.</p>
            </section>

            <section style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 16, padding: '1.5rem' }}>
              <h3>17. Final Acknowledgement <span className="emoji">✅</span></h3>
              <p style={{ color: 'rgba(255,255,255,0.8)' }}>By using ELMA, you confirm that:</p>
              <ul style={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.8 }}>
                <li>you understand ELMA’s limits and that it is not an emergency service;</li>
                <li>you accept responsibility for your decisions and usage;</li>
                <li>you use the Platform voluntarily and agree to these Terms.</li>
              </ul>
            </section>

            {/* Privacy reference */}
            <section style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 16, padding: '1.5rem' }}>
              <h3>Privacy Policy <span className="emoji">🛡️</span></h3>
              <p style={{ color: 'rgba(255,255,255,0.8)' }}>Your use of ELMA is also governed by our Privacy Policy. Please review it to understand how we handle your data.</p>
            </section>

            {/* Contact */}
            <section style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 16, padding: '1.5rem' }}>
              <h3>Contact <span className="emoji">📞</span></h3>
              <ul style={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.8 }}>
                <li>Email: <a href="mailto:support@elma.ltd">support@elma.ltd</a></li>
                <li>Company: ELMA Emotion Solutions LLP</li>
                <li>Address: ELMA motion Solutions LLP, Jaipur, Rajasthan, India</li>
              </ul>
            </section>
          </div>
        </div>
      </section>
    </main>
  )
}

export default Terms
