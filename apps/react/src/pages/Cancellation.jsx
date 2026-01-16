import React from 'react'

function Cancellation() {
  return (
    <main>
      <section className="subpage">
        <div className="container">
          <header style={{ marginBottom: '2rem', textAlign: 'center', marginTop: '2rem' }}>
            <h1>Cancellation, Rescheduling & Refund Policy <span className="emoji">📅</span></h1>
            <p style={{ opacity: 0.8, fontStyle: 'italic' }}>Last updated: January 2026</p>
          </header>

          <div style={{ display: 'grid', gap: '1.5rem', maxWidth: '900px', margin: '0 auto' }}>
            
            {/* Intro */}
            <section style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 16, padding: '1.5rem' }}>
              <p style={{ color: 'rgba(255,255,255,0.8)' }}>
                This Cancellation, Rescheduling & Refund Policy applies to all therapy sessions booked through the ELMA platform (“ELMA”, “we”, “our”, “us”). By booking a session on ELMA, you agree to the terms outlined below.
              </p>
            </section>

            {/* 1. Nature of Services */}
            <section style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 16, padding: '1.5rem' }}>
              <h3>1. Nature of Services <span className="emoji">🌐</span></h3>
              <p style={{ color: 'rgba(255,255,255,0.8)', marginTop: '1rem' }}>
                ELMA is a technology platform that enables users to book sessions with independent, certified psychologists.
              </p>
              <p style={{ color: 'rgba(255,255,255,0.8)', marginTop: '1rem' }}>
                ELMA <strong>does not provide therapy itself</strong> and does not control the clinical content of sessions.
              </p>
              <p style={{ color: 'rgba(255,255,255,0.8)', marginTop: '1rem' }}>
                Sessions are currently conducted <strong>outside the ELMA app</strong> via third-party video conferencing tools (e.g., Google Meet).
              </p>
            </section>

            {/* 2. Rescheduling Policy */}
            <section style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 16, padding: '1.5rem' }}>
              <h3>2. Rescheduling Policy <span className="emoji">🔄</span></h3>
              <ul style={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.8 }}>
                <li>Users may reschedule a session <strong>free of charge up to 24 hours</strong> before the scheduled session start time.</li>
                <li>Only <strong>one (1) reschedule</strong> is permitted per booking.</li>
                <li>Any reschedule request made <strong>within 24 hours</strong> of the session start time will be <strong>treated as a cancellation</strong> and governed by the cancellation rules below.</li>
              </ul>
            </section>

            {/* 3. User-Initiated Cancellations & Refunds */}
            <section style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 16, padding: '1.5rem' }}>
              <h3>3. User-Initiated Cancellations & Refunds <span className="emoji">💸</span></h3>
              <p style={{ color: 'rgba(255,255,255,0.8)', marginTop: '1rem' }}>
                Refund eligibility depends on when the user cancels the session relative to the scheduled start time:
              </p>
              
              <h4 style={{ marginTop: '1rem' }}>Refund Structure</h4>
              <ul style={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.8 }}>
                <li><strong>24 hours or more before session start:</strong><br/> → 100% refund</li>
                <li><strong>Between 12 and 24 hours before session start:</strong><br/> → 50% refund</li>
                <li><strong>Less than 12 hours before session start OR no-show by the user:</strong><br/> → No refund</li>
              </ul>

              <h4 style={{ marginTop: '1rem' }}>Important Notes</h4>
              <ul style={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.8 }}>
                <li>Refunds are processed to the <strong>original payment method</strong> only.</li>
                <li>Refund timelines may vary depending on the payment provider.</li>
                <li>ELMA reserves the right to deny refunds in cases of suspected misuse, abuse, or policy violations.</li>
              </ul>
            </section>

            {/* 4. Therapist-Initiated Cancellations */}
            <section style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 16, padding: '1.5rem' }}>
              <h3>4. Therapist-Initiated Cancellations <span className="emoji">🚫</span></h3>
              <p style={{ color: 'rgba(255,255,255,0.8)', marginTop: '1rem' }}>
                If a session is cancelled by the psychologist for any reason:
              </p>
              <ul style={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.8 }}>
                <li>The user is entitled to a <strong>100% refund</strong> of the session fee.</li>
              </ul>
              <p style={{ color: 'rgba(255,255,255,0.8)', marginTop: '1rem' }}>
                No additional compensation or credits are provided at this stage.
              </p>
            </section>

            {/* 5. Therapist No-Show Policy */}
            <section style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 16, padding: '1.5rem' }}>
              <h3>5. Therapist No-Show Policy (Sessions via Google Meet) <span className="emoji">⏳</span></h3>
              <p style={{ color: 'rgba(255,255,255,0.8)', marginTop: '1rem' }}>
                If a psychologist does not join the scheduled session <strong>within 10 minutes</strong> of the scheduled start time, the session may be treated as a <strong>therapist no-show</strong>.
              </p>
              
              <h4 style={{ marginTop: '1rem' }}>Refund Eligibility</h4>
              <p style={{ color: 'rgba(255,255,255,0.8)' }}>
                In such cases, the user is eligible for a <strong>100% refund</strong>, subject to verification.
              </p>

              <h4 style={{ marginTop: '1rem' }}>Verification Requirement</h4>
              <p style={{ color: 'rgba(255,255,255,0.8)' }}>
                Because sessions occur outside the ELMA platform, ELMA requires <strong>basic verification</strong> to prevent misuse or fraudulent claims.
              </p>
              <p style={{ color: 'rgba(255,255,255,0.8)', marginTop: '0.5rem' }}>
                To request a refund for a therapist no-show, the user must provide:
              </p>
              <ul style={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.8 }}>
                <li><strong>A single screenshot</strong> showing:</li>
                <li style={{ marginLeft: '1rem' }}>• The Google Meet waiting screen or empty meeting room</li>
                <li style={{ marginLeft: '1rem' }}>• The <strong>system time visible</strong>, clearly showing at least 10 minutes past the scheduled session start time</li>
              </ul>
              <p style={{ color: 'rgba(255,255,255,0.8)', marginTop: '1rem' }}>
                The screenshot must be shared through ELMA’s official support channel (e.g., in-app support or registered support email).
              </p>
              <p style={{ color: 'rgba(255,255,255,0.8)', marginTop: '1rem' }}>
                ELMA reserves the right to:
              </p>
              <ul style={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.8 }}>
                <li>Verify the claim against booking records</li>
                <li>Reject claims that are incomplete, unclear, manipulated, or inconsistent with session data</li>
              </ul>
            </section>

            {/* 6. Abuse, Fraud & Misuse */}
            <section style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 16, padding: '1.5rem' }}>
              <h3>6. Abuse, Fraud & Misuse <span className="emoji">🛡️</span></h3>
              <p style={{ color: 'rgba(255,255,255,0.8)', marginTop: '1rem' }}>
                To protect psychologists, users, and the integrity of the platform:
              </p>
              <ul style={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.8 }}>
                <li>ELMA actively monitors cancellation and refund patterns.</li>
                <li>Repeated refund requests, false claims, or attempts to manipulate timestamps or evidence may result in:</li>
                <li style={{ marginLeft: '1rem' }}>• Refund denial</li>
                <li style={{ marginLeft: '1rem' }}>• Temporary suspension of booking privileges</li>
                <li style={{ marginLeft: '1rem' }}>• Permanent account restriction in severe cases</li>
              </ul>
              <p style={{ color: 'rgba(255,255,255,0.8)', marginTop: '1rem' }}>
                All decisions taken by ELMA in relation to suspected misuse are final.
              </p>
            </section>

            {/* 7. Force Majeure & Technical Issues */}
            <section style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 16, padding: '1.5rem' }}>
              <h3>7. Force Majeure & Technical Issues <span className="emoji">⚠️</span></h3>
              <p style={{ color: 'rgba(255,255,255,0.8)', marginTop: '1rem' }}>
                ELMA is not responsible for:
              </p>
              <ul style={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.8 }}>
                <li>Internet connectivity issues on the user’s or therapist’s end</li>
                <li>Device failures</li>
                <li>Issues caused by third-party platforms (including Google Meet)</li>
              </ul>
              <p style={{ color: 'rgba(255,255,255,0.8)', marginTop: '1rem' }}>
                Refunds in such cases are <strong>not guaranteed</strong> and are evaluated on a case-by-case basis.
              </p>
            </section>

            {/* 8. Policy Changes */}
            <section style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 16, padding: '1.5rem' }}>
              <h3>8. Policy Changes <span className="emoji">📝</span></h3>
              <p style={{ color: 'rgba(255,255,255,0.8)', marginTop: '1rem' }}>
                ELMA reserves the right to modify this policy at any time. Any changes will be effective immediately upon being updated on the ELMA website or app.
              </p>
              <p style={{ color: 'rgba(255,255,255,0.8)', marginTop: '1rem' }}>
                Continued use of the platform after updates constitutes acceptance of the revised policy.
              </p>
            </section>

            {/* 9. Contact & Support */}
            <section style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 16, padding: '1.5rem' }}>
              <h3>9. Contact & Support <span className="emoji">📧</span></h3>
              <p style={{ color: 'rgba(255,255,255,0.8)', marginTop: '1rem' }}>
                For cancellation-related queries or refund requests, users may contact ELMA through the official support channels listed on the website or within the app.
              </p>
            </section>

          </div>
        </div>
      </section>
    </main>
  )
}

export default Cancellation