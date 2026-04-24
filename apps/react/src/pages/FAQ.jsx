import SEO from '../components/SEO.jsx'

const BASE_URL = 'https://elma.ltd'

const faqs = [
  {
    category: 'About ELMA',
    questions: [
      {
        q: 'What is ELMA?',
        a: 'ELMA (Emotional Life Management Assistant) is a 24/7 AI emotional companion app built for India. It helps you understand your emotions, track your mood patterns, process difficult feelings through voice and text, and connect with certified psychologists when you need professional support. ELMA is available free on Android and iOS.',
      },
      {
        q: 'What does ELMA stand for?',
        a: 'ELMA stands for Emotional Life Management Assistant. It is India\'s dedicated AI emotional companion — designed specifically for the Indian user, supporting 8+ languages and built to DPDP 2023 and GDPR privacy standards.',
      },
      {
        q: 'Is ELMA a therapy app?',
        a: 'No. ELMA is an emotional companion and self-awareness tool — not therapy and not a substitute for clinical mental health treatment. ELMA is designed for daily emotional practice: understanding your patterns, processing your feelings, and building emotional intelligence. When professional support is needed, ELMA connects you with certified psychologists through ELMA Experts.',
      },
      {
        q: 'Is ELMA a meditation app?',
        a: 'No. ELMA is not a meditation or mindfulness app. ELMA focuses on emotional intelligence, mood tracking, and AI-powered conversation — helping you understand your emotional patterns rather than teaching relaxation techniques.',
      },
      {
        q: 'Who is ELMA for?',
        a: 'ELMA is designed for GenZ (18–26) and Millennials (27–35) who want to understand their emotions with precision — the same way they track their fitness or finances. If you have ever felt reactive without knowing why, emotionally stuck, or lacking language for what you are experiencing, ELMA is built for you.',
      },
      {
        q: 'Is ELMA available outside India?',
        a: 'Yes. While ELMA is built specifically for the Indian context and supports Indian languages, it is available globally on Android and iOS. The app complies with both India\'s DPDP 2023 and EU/UK GDPR data protection frameworks.',
      },
    ],
  },
  {
    category: 'Features',
    questions: [
      {
        q: 'What can ELMA help me with?',
        a: 'ELMA helps with: understanding and naming your emotions precisely, tracking mood patterns over time to identify triggers and trends, processing anxiety, stress, burnout, loneliness, and relationship difficulties through AI conversation, building emotional intelligence as a daily practice, and connecting with certified psychologists when professional support is needed.',
      },
      {
        q: 'What is the Emotion Flower Wheel?',
        a: 'The Emotion Flower Wheel is ELMA\'s multi-petal mood selector. Instead of asking "how do you feel on a scale of 1–10?", the Emotion Flower Wheel lets you identify your exact emotional state from a rich vocabulary of specific emotions. Research shows that naming emotions precisely — distinguishing "frustrated" from "disappointed" from "resentful" — reduces emotional intensity and builds self-awareness.',
      },
      {
        q: 'What is the ELMA Diary?',
        a: 'The ELMA Diary is an encrypted, Face ID-locked personal journal within the app. It is completely private — no one else can access it, including ELMA. You can choose to share specific entries with your ELMA Expert (therapist) to enrich your therapy sessions, but this is entirely your choice.',
      },
      {
        q: 'What is Handsfree AI?',
        a: 'Handsfree AI is ELMA\'s voice-driven emotional companion. You speak your thoughts and feelings out loud; ELMA responds with depth and understanding. Voice processing is neurologically distinct from writing — speaking emotions activates different pathways that can reduce emotional intensity and aid processing.',
      },
      {
        q: 'What is the Emotional Awareness Index?',
        a: 'The Emotional Awareness Index (EAI) is ELMA\'s personalised score that tracks your emotional intelligence development over time. It reflects your consistency in tracking, the precision of your emotional vocabulary, your engagement with the AI companion, and your progress on emotional goals. Think of it as your emotional fitness score.',
      },
      {
        q: 'What is the Mood Curve?',
        a: 'The Mood Curve visualises your emotional arc across days and weeks. It transforms daily mood logs into a visible pattern — showing you trends that are invisible in day-to-day experience. Many users describe seeing their Mood Curve for the first time as one of the most significant moments of self-awareness they have had.',
      },
      {
        q: 'What languages does ELMA support?',
        a: 'ELMA supports 8+ languages including English, Hindi, Tamil, Telugu, and other regional Indian languages. Language support is core to the product — emotional nuance is often impossible to communicate in a second language, and India\'s linguistic diversity means one language does not reach everyone.',
      },
    ],
  },
  {
    category: 'ELMA Experts (Therapists)',
    questions: [
      {
        q: 'What are ELMA Experts?',
        a: 'ELMA Experts is an in-app marketplace of certified Indian psychologists. You can book 1:1 sessions — text, voice, or video — directly within the app. With your permission, your ELMA Expert can access your mood data and diary summaries to make sessions more targeted and efficient.',
      },
      {
        q: 'How are ELMA Experts verified?',
        a: 'All ELMA Experts are verified licensed mental health professionals — psychologists, counsellors, and therapists registered with recognised Indian psychological bodies. Their credentials are checked before they join the platform.',
      },
      {
        q: 'How much do ELMA Expert sessions cost?',
        a: 'ELMA Expert sessions are priced at accessible Indian rates (INR pricing). Costs vary by the expert and session format. All pricing is visible before you book. The core ELMA app (AI companion, mood tracking, diary) is free — Expert sessions are an optional paid add-on.',
      },
      {
        q: 'Can I use ELMA alongside my existing therapist?',
        a: 'Yes — and this is one of ELMA\'s most effective use cases. ELMA provides daily emotional practice and pattern tracking between therapy sessions. Your existing therapist can benefit from the mood and diary data (if you choose to share it) — making sessions more efficient. Many ELMA Experts describe their sessions as "supercharged" by the data context ELMA provides.',
      },
    ],
  },
  {
    category: 'Privacy & Safety',
    questions: [
      {
        q: 'Is my emotional data private on ELMA?',
        a: 'Yes. ELMA is compliant with India\'s DPDP Act 2023 and EU/UK GDPR. Your emotional data is never sold to third parties. Your ELMA Diary is Face ID-locked and completely private. Data shared with ELMA Experts is opt-in and controlled entirely by you.',
      },
      {
        q: 'Does ELMA sell my data?',
        a: 'No. ELMA does not sell personal or emotional data to any third party. See the full privacy policy at elma.ltd/privacy.',
      },
      {
        q: 'What should I do if I am in a mental health crisis?',
        a: 'ELMA is not a crisis service. If you are experiencing thoughts of self-harm or suicide, or are in immediate danger, please contact a human crisis line immediately: iCall — 9152987821 (India) | Vandrevala Foundation — 1860-2662-345 | NIMHANS — 080-46110007. ELMA displays crisis resources when it detects signals of severe distress.',
      },
      {
        q: 'Is ELMA suitable for children?',
        a: 'ELMA is designed for users aged 18 and above. The app is not suitable for children or minors.',
      },
    ],
  },
  {
    category: 'Download & Pricing',
    questions: [
      {
        q: 'Is ELMA free?',
        a: 'Yes. The core ELMA app — AI companion, Emotion Flower Wheel, Mood Curve, Energy Tempo Bars, ELMA Diary, Handsfree AI, and My Growth tracking — is free to download and use. ELMA Expert sessions with certified psychologists are an optional paid feature with INR pricing.',
      },
      {
        q: 'Where can I download ELMA?',
        a: 'ELMA is available on Android (Google Play) and iOS (App Store). Android: https://play.google.com/store/apps/details?id=com.elmadevs.ElMAAPP | iOS: https://apps.apple.com/in/app/elma-emotional-companion/id6756991672',
      },
      {
        q: 'Does ELMA work offline?',
        a: 'Some features of ELMA require an internet connection — specifically the AI conversation and Handsfree AI features. Basic diary logging and mood tracking may be available offline with sync when connected.',
      },
    ],
  },
]

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.flatMap(cat =>
    cat.questions.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    }))
  ),
}

export default function FAQPage() {
  return (
    <>
      <SEO
        title="FAQ — Everything About ELMA, the AI Emotional Companion App"
        description="Answers to every question about ELMA: what it is, how it works, ELMA Experts, privacy, pricing, and more."
        canonical="/faq"
        schema={faqSchema}
      />

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '3rem 1.5rem 5rem' }}>
        <h1 style={{ fontSize: 'clamp(1.8rem,4vw,2.5rem)', fontWeight: 800, color: '#fff', marginBottom: '0.6rem' }}>
          Frequently Asked Questions
        </h1>
        <p style={{ color: '#8a7fa8', marginBottom: '3rem', fontSize: '1.05rem' }}>
          Everything you need to know about ELMA — the AI emotional companion built for India.
        </p>

        {faqs.map(({ category, questions }) => (
          <section key={category} style={{ marginBottom: '3rem' }}>
            <h2 style={{
              fontSize: '1.1rem',
              fontWeight: 700,
              color: '#ba92ff',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '1.25rem',
              paddingBottom: '0.5rem',
              borderBottom: '1px solid rgba(186,146,255,0.2)',
            }}>
              {category}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {questions.map(({ q, a }) => (
                <details
                  key={q}
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(186,146,255,0.12)',
                    borderRadius: 12,
                    padding: '1.25rem 1.5rem',
                  }}
                >
                  <summary style={{
                    cursor: 'pointer',
                    fontWeight: 600,
                    color: '#e0d5f5',
                    fontSize: '1rem',
                    listStyle: 'none',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                    {q}
                    <span style={{ color: '#ba92ff', fontSize: '1.2rem', flexShrink: 0, marginLeft: '1rem' }}>+</span>
                  </summary>
                  <p style={{
                    marginTop: '0.9rem',
                    color: '#b0a8cc',
                    lineHeight: 1.7,
                    fontSize: '0.97rem',
                  }}>
                    {a}
                  </p>
                </details>
              ))}
            </div>
          </section>
        ))}

        <div style={{
          marginTop: '3rem',
          padding: '2rem',
          background: 'linear-gradient(135deg, rgba(186,146,255,0.1), rgba(144,224,239,0.08))',
          border: '1px solid rgba(186,146,255,0.25)',
          borderRadius: 16,
          textAlign: 'center',
        }}>
          <h3 style={{ color: '#ba92ff', marginBottom: '0.5rem', fontWeight: 700, fontSize: '1.15rem' }}>
            Still have questions?
          </h3>
          <p style={{ color: '#b0a8cc', marginBottom: '1.25rem', fontSize: '0.95rem' }}>
            Reach us at <a href="mailto:support@elma.ltd" style={{ color: '#ba92ff' }}>support@elma.ltd</a>
          </p>
          <a
            href="https://play.google.com/store/apps/details?id=com.elmadevs.ElMAAPP"
            style={{
              display: 'inline-block',
              background: 'linear-gradient(135deg, #ba92ff, #90e0ef)',
              color: '#0a0613',
              fontWeight: 700,
              padding: '0.75rem 2rem',
              borderRadius: 999,
              fontSize: '1rem',
              textDecoration: 'none',
            }}
          >
            Download ELMA Free
          </a>
        </div>
      </div>

      <style>{`
        details > summary::-webkit-details-marker { display: none; }
        details[open] summary span { transform: rotate(45deg); display: inline-block; }
      `}</style>
    </>
  )
}
