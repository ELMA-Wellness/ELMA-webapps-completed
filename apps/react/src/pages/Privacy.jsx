import React from 'react'
import { useLang } from '../contexts/LangContext.jsx'
import SEO from '../components/SEO.jsx'

const CONTENT = {
  en: {
    title: 'Privacy Policy',
    updated: 'Last Updated: December 2025',
    sections: [
      {
        heading: '1. Who This Policy Applies To 👥',
        body: [
          { type: 'p', text: 'This Policy applies to:' },
          { type: 'ul', items: ['Users of the ELMA mobile app and website', 'Individuals interacting with ELMA AI', 'Users booking sessions with psychologists through ELMA'] },
          { type: 'p', text: 'ELMA is intended only for users aged 18 years or older. We do not knowingly collect data from anyone under 18.' },
        ],
      },
      {
        heading: '2. What ELMA Does (Context) 🧠',
        body: [
          { type: 'p', text: 'ELMA is an emotional wellness support platform that:' },
          { type: 'ul', items: ['offers AI-based emotional support tools, and', 'enables access to independent third-party psychologists for online sessions.'] },
          { type: 'p', text: 'ELMA is not a medical provider, not an emergency service, and not a replacement for professional care.' },
        ],
      },
      {
        heading: '3. Information We Collect 🗂️',
        body: [
          { type: 'h4', text: '3.1 Information you provide directly' },
          { type: 'p', text: 'Depending on how you use ELMA, we may collect:' },
          { type: 'ul', items: ['Mobile number, email address, or authentication credentials', 'Profile details you choose to share', 'Messages you type to ELMA AI', 'Voice input you choose to submit', 'Booking information for therapy sessions', 'Support or feedback communications'] },
          { type: 'p', text: 'You should not share:' },
          { type: 'ul', items: ['passwords', 'bank details', 'government IDs', 'highly sensitive personal identifiers'] },
          { type: 'h4', text: '3.2 AI & voice interactions' },
          { type: 'p', text: 'If you use AI chat or voice features:' },
          { type: 'ul', items: ['Text and/or voice input may be processed to generate responses', 'Voice features require microphone permission (controlled by your device)', 'Voice input may be converted to text to function properly'] },
          { type: 'p', text: 'ELMA does not use AI interactions to diagnose or treat medical conditions.' },
          { type: 'h4', text: '3.3 Therapy-related data' },
          { type: 'p', text: 'For therapy sessions, ELMA may process:' },
          { type: 'ul', items: ['Booking details (date, time, therapist ID)', 'Payment and transaction records', 'Limited session metadata required to operate the platform'] },
          { type: 'p', text: 'ELMA does not record therapy sessions unless explicitly stated and consented.' },
          { type: 'h4', text: '3.4 Automatically collected information' },
          { type: 'p', text: 'We may collect:' },
          { type: 'ul', items: ['Device type and operating system', 'App version', 'Log data (crashes, errors)', 'IP address (for security and fraud prevention)', 'Session timestamps'] },
        ],
      },
      {
        heading: '4. How We Use Your Data 🔍',
        body: [
          { type: 'p', text: 'We use your data to:' },
          { type: 'ul', items: ['Operate and improve the ELMA platform', 'Enable AI emotional support features', 'Facilitate therapy bookings and payments', 'Ensure safety, security, and abuse prevention', 'Comply with legal obligations', 'Respond to support or legal requests'] },
          { type: 'p', text: 'We do not use your data to:' },
          { type: 'ul', items: ['sell personal information', 'run targeted advertising based on sensitive emotional content'] },
        ],
      },
      {
        heading: '5. Legal Basis for Processing (GDPR & DPDP) 📜',
        body: [
          { type: 'p', text: 'We process personal data based on:' },
          { type: 'ul', items: ['Your explicit consent (primary basis)', 'Performance of a contract (providing services you request)', 'Legal obligations', 'Legitimate interests (platform security, fraud prevention)'] },
          { type: 'p', text: 'You may withdraw consent at any time, subject to legal and operational limits.' },
        ],
      },
      {
        heading: '6. AI-Specific Disclosure 🤖',
        body: [
          { type: 'ul', items: ['AI responses are generated automatically and may be imperfect.', 'AI is used only for emotional wellness support.', 'AI does not provide medical, legal, or professional advice.', 'You remain responsible for decisions you make.'] },
        ],
      },
      {
        heading: '7. Sharing of Data 🔄',
        body: [
          { type: 'p', text: 'We may share limited data with:' },
          { type: 'ul', items: ['Cloud infrastructure providers', 'Payment gateways', 'Analytics and security providers', 'Licensed psychologists (only what is necessary for sessions)', 'Legal authorities if required by law'] },
          { type: 'p', text: 'All third parties are required to follow appropriate data protection standards.' },
        ],
      },
      {
        heading: '8. International Data Transfers 🌍',
        body: [
          { type: 'p', text: 'Your data may be processed or stored outside your country (including India, EU, or other regions) using secure cloud services. Where required, we rely on:' },
          { type: 'ul', items: ['contractual safeguards', 'standard data protection measures', 'applicable legal mechanisms'] },
        ],
      },
      {
        heading: '9. Data Retention 🗄️',
        body: [
          { type: 'p', text: 'We retain personal data:' },
          { type: 'ul', items: ['only as long as necessary for the purposes stated', 'or as required by law, security, or dispute resolution'] },
          { type: 'p', text: 'You may request deletion of your account and associated data, subject to legal retention requirements.' },
        ],
      },
      {
        heading: '10. Your Rights ⚖️',
        body: [
          { type: 'p', text: 'Depending on your jurisdiction, you may have the right to:' },
          { type: 'ul', items: ['access your personal data', 'correct inaccurate data', 'request deletion', 'withdraw consent', 'restrict or object to processing', 'lodge a complaint with a data protection authority'] },
          { type: 'p', text: 'Requests can be made via the contact details below.' },
        ],
      },
      {
        heading: '11. Security Measures 🔐',
        body: [
          { type: 'p', text: 'We use reasonable administrative, technical, and organizational safeguards to protect your data, including:' },
          { type: 'ul', items: ['encryption', 'access controls', 'secure infrastructure'] },
          { type: 'p', text: 'However, no system is 100% secure, and you acknowledge this risk.' },
        ],
      },
      {
        heading: "12. Children's Privacy (Strict) 👶",
        body: [
          { type: 'p', text: 'ELMA is 18+ only.' },
          { type: 'ul', items: ['We do not knowingly collect data from minors.', 'Accounts identified as belonging to users under 18 will be terminated.'] },
        ],
      },
      {
        heading: '13. Cookies & Tracking 🍪',
        body: [
          { type: 'p', text: 'Our website may use cookies or similar technologies for:' },
          { type: 'ul', items: ['functionality', 'security', 'analytics'] },
          { type: 'p', text: 'You can manage cookie preferences via your browser settings.' },
        ],
      },
      {
        heading: '14. Changes to This Policy 🔄',
        body: [
          { type: 'p', text: 'We may update this Privacy Policy from time to time.' },
          { type: 'p', text: 'Material changes will be communicated via the app or website.' },
          { type: 'p', text: 'Continued use after changes means acceptance of the updated Policy.' },
        ],
      },
      {
        heading: '15. Contact & Grievance Redressal 📞',
        body: [
          { type: 'p', text: 'If you have questions, concerns, or data requests:' },
          { type: 'ul', items: ['Grievance / Privacy Officer', 'ELMA Emotion Solutions LLP', '📧 privacy@elma.ltd', 'Address: ELMA Emotion Solutions LLP, Jaipur, Rajasthan, India'] },
          { type: 'p', text: 'We aim to respond within a reasonable timeframe as required by law.' },
        ],
      },
      {
        heading: '16. Governing Law 📚',
        body: [
          { type: 'p', text: 'This Privacy Policy is governed by the laws of India, subject to mandatory consumer and data protection rights applicable in your jurisdiction.' },
        ],
      },
      {
        heading: 'Final Note to Users ❤️',
        body: [
          { type: 'p', text: 'ELMA is built with care, respect, and privacy in mind.' },
          { type: 'p', text: 'You control what you share.' },
          { type: 'p', text: 'You can stop using the Platform at any time.' },
        ],
      },
    ],
  },
  fr: {
    title: 'Politique de Confidentialité',
    updated: 'Dernière mise à jour : Décembre 2025',
    sections: [
      {
        heading: '1. À qui s\'applique cette politique 👥',
        body: [
          { type: 'p', text: 'Cette politique s\'applique à :' },
          { type: 'ul', items: ['Les utilisateurs de l\'application mobile et du site web ELMA', 'Les personnes interagissant avec l\'IA ELMA', 'Les utilisateurs réservant des séances avec des psychologues via ELMA'] },
          { type: 'p', text: 'ELMA est destinée uniquement aux utilisateurs âgés de 18 ans ou plus. Nous ne collectons pas sciemment de données auprès de personnes de moins de 18 ans.' },
        ],
      },
      {
        heading: '2. Ce que fait ELMA (Contexte) 🧠',
        body: [
          { type: 'p', text: 'ELMA est une plateforme de soutien au bien-être émotionnel qui :' },
          { type: 'ul', items: ['propose des outils de soutien émotionnel basés sur l\'IA, et', 'permet l\'accès à des psychologues indépendants tiers pour des séances en ligne.'] },
          { type: 'p', text: 'ELMA n\'est pas un prestataire médical, pas un service d\'urgence, et ne remplace pas les soins professionnels.' },
        ],
      },
      {
        heading: '3. Informations que nous collectons 🗂️',
        body: [
          { type: 'h4', text: '3.1 Informations que vous fournissez directement' },
          { type: 'p', text: 'Selon la façon dont vous utilisez ELMA, nous pouvons collecter :' },
          { type: 'ul', items: ['Numéro de mobile, adresse e-mail ou identifiants d\'authentification', 'Détails de profil que vous choisissez de partager', 'Messages que vous tapez à l\'IA ELMA', 'Entrée vocale que vous choisissez de soumettre', 'Informations de réservation pour les séances de thérapie', 'Communications de support ou de retour d\'information'] },
          { type: 'p', text: 'Vous ne devez pas partager :' },
          { type: 'ul', items: ['mots de passe', 'coordonnées bancaires', 'pièces d\'identité gouvernementales', 'identifiants personnels hautement sensibles'] },
          { type: 'h4', text: '3.2 Interactions IA et vocales' },
          { type: 'p', text: 'Si vous utilisez les fonctionnalités de chat IA ou vocales :' },
          { type: 'ul', items: ['Les entrées texte et/ou vocales peuvent être traitées pour générer des réponses', 'Les fonctionnalités vocales nécessitent une autorisation de microphone (contrôlée par votre appareil)', 'L\'entrée vocale peut être convertie en texte pour fonctionner correctement'] },
          { type: 'p', text: 'ELMA n\'utilise pas les interactions IA pour diagnostiquer ou traiter des conditions médicales.' },
          { type: 'h4', text: '3.3 Données liées à la thérapie' },
          { type: 'p', text: 'Pour les séances de thérapie, ELMA peut traiter :' },
          { type: 'ul', items: ['Détails de réservation (date, heure, ID du thérapeute)', 'Enregistrements de paiement et de transaction', 'Métadonnées de séance limitées nécessaires au fonctionnement de la plateforme'] },
          { type: 'p', text: 'ELMA n\'enregistre pas les séances de thérapie sauf mention explicite et consentement.' },
          { type: 'h4', text: '3.4 Informations collectées automatiquement' },
          { type: 'p', text: 'Nous pouvons collecter :' },
          { type: 'ul', items: ['Type d\'appareil et système d\'exploitation', 'Version de l\'application', 'Données de journal (pannes, erreurs)', 'Adresse IP (pour la sécurité et la prévention des fraudes)', 'Horodatages de session'] },
        ],
      },
      {
        heading: '4. Comment nous utilisons vos données 🔍',
        body: [
          { type: 'p', text: 'Nous utilisons vos données pour :' },
          { type: 'ul', items: ['Exploiter et améliorer la plateforme ELMA', 'Activer les fonctionnalités de soutien émotionnel IA', 'Faciliter les réservations et paiements de thérapie', 'Assurer la sécurité et la prévention des abus', 'Respecter les obligations légales', 'Répondre aux demandes de support ou légales'] },
          { type: 'p', text: 'Nous n\'utilisons pas vos données pour :' },
          { type: 'ul', items: ['vendre des informations personnelles', 'diffuser de la publicité ciblée basée sur du contenu émotionnel sensible'] },
        ],
      },
      {
        heading: '5. Base juridique du traitement (RGPD et DPDP) 📜',
        body: [
          { type: 'p', text: 'Nous traitons les données personnelles sur la base de :' },
          { type: 'ul', items: ['Votre consentement explicite (base principale)', 'Exécution d\'un contrat (prestation des services demandés)', 'Obligations légales', 'Intérêts légitimes (sécurité de la plateforme, prévention des fraudes)'] },
          { type: 'p', text: 'Vous pouvez retirer votre consentement à tout moment, sous réserve de limites légales et opérationnelles.' },
        ],
      },
      {
        heading: '6. Divulgation spécifique à l\'IA 🤖',
        body: [
          { type: 'ul', items: ['Les réponses de l\'IA sont générées automatiquement et peuvent être imparfaites.', 'L\'IA est utilisée uniquement pour le soutien au bien-être émotionnel.', 'L\'IA ne fournit pas de conseils médicaux, juridiques ou professionnels.', 'Vous restez responsable des décisions que vous prenez.'] },
        ],
      },
      {
        heading: '7. Partage des données 🔄',
        body: [
          { type: 'p', text: 'Nous pouvons partager des données limitées avec :' },
          { type: 'ul', items: ['Fournisseurs d\'infrastructure cloud', 'Passerelles de paiement', 'Fournisseurs d\'analyses et de sécurité', 'Psychologues agréés (uniquement ce qui est nécessaire pour les séances)', 'Autorités légales si requis par la loi'] },
          { type: 'p', text: 'Tous les tiers sont tenus de respecter les normes de protection des données appropriées.' },
        ],
      },
      {
        heading: '8. Transferts internationaux de données 🌍',
        body: [
          { type: 'p', text: 'Vos données peuvent être traitées ou stockées en dehors de votre pays (y compris en Inde, dans l\'UE ou dans d\'autres régions) via des services cloud sécurisés. Si nécessaire, nous nous appuyons sur :' },
          { type: 'ul', items: ['des garanties contractuelles', 'des mesures standard de protection des données', 'des mécanismes juridiques applicables'] },
        ],
      },
      {
        heading: '9. Conservation des données 🗄️',
        body: [
          { type: 'p', text: 'Nous conservons les données personnelles :' },
          { type: 'ul', items: ['uniquement aussi longtemps que nécessaire aux fins indiquées', 'ou comme requis par la loi, la sécurité ou la résolution des litiges'] },
          { type: 'p', text: 'Vous pouvez demander la suppression de votre compte et des données associées, sous réserve des exigences légales de conservation.' },
        ],
      },
      {
        heading: '10. Vos droits ⚖️',
        body: [
          { type: 'p', text: 'Selon votre juridiction, vous pouvez avoir le droit de :' },
          { type: 'ul', items: ['accéder à vos données personnelles', 'corriger des données inexactes', 'demander la suppression', 'retirer votre consentement', 'restreindre ou s\'opposer au traitement', 'déposer une plainte auprès d\'une autorité de protection des données'] },
          { type: 'p', text: 'Les demandes peuvent être faites via les coordonnées ci-dessous.' },
        ],
      },
      {
        heading: '11. Mesures de sécurité 🔐',
        body: [
          { type: 'p', text: 'Nous utilisons des mesures de protection administratives, techniques et organisationnelles raisonnables pour protéger vos données, notamment :' },
          { type: 'ul', items: ['le chiffrement', 'les contrôles d\'accès', 'une infrastructure sécurisée'] },
          { type: 'p', text: 'Cependant, aucun système n\'est sécurisé à 100 %, et vous reconnaissez ce risque.' },
        ],
      },
      {
        heading: '12. Confidentialité des enfants (Strict) 👶',
        body: [
          { type: 'p', text: 'ELMA est réservée aux 18 ans et plus.' },
          { type: 'ul', items: ['Nous ne collectons pas sciemment de données auprès de mineurs.', 'Les comptes identifiés comme appartenant à des utilisateurs de moins de 18 ans seront résiliés.'] },
        ],
      },
      {
        heading: '13. Cookies et suivi 🍪',
        body: [
          { type: 'p', text: 'Notre site web peut utiliser des cookies ou des technologies similaires pour :' },
          { type: 'ul', items: ['la fonctionnalité', 'la sécurité', 'l\'analyse'] },
          { type: 'p', text: 'Vous pouvez gérer les préférences de cookies via les paramètres de votre navigateur.' },
        ],
      },
      {
        heading: '14. Modifications de cette politique 🔄',
        body: [
          { type: 'p', text: 'Nous pouvons mettre à jour cette politique de confidentialité de temps en temps.' },
          { type: 'p', text: 'Les modifications importantes seront communiquées via l\'application ou le site web.' },
          { type: 'p', text: 'L\'utilisation continue après les modifications signifie l\'acceptation de la politique mise à jour.' },
        ],
      },
      {
        heading: '15. Contact et recours aux griefs 📞',
        body: [
          { type: 'p', text: 'Si vous avez des questions, des préoccupations ou des demandes de données :' },
          { type: 'ul', items: ['Responsable des griefs / Responsable de la protection de la vie privée', 'ELMA Emotion Solutions LLP', '📧 privacy@elma.ltd', 'Adresse : ELMA Emotion Solutions LLP, Jaipur, Rajasthan, Inde'] },
          { type: 'p', text: 'Nous visons à répondre dans un délai raisonnable tel que requis par la loi.' },
        ],
      },
      {
        heading: '16. Droit applicable 📚',
        body: [
          { type: 'p', text: 'Cette politique de confidentialité est régie par les lois de l\'Inde, sous réserve des droits obligatoires des consommateurs et de protection des données applicables dans votre juridiction.' },
        ],
      },
      {
        heading: 'Note finale aux utilisateurs ❤️',
        body: [
          { type: 'p', text: 'ELMA est conçue avec soin, respect et confidentialité à l\'esprit.' },
          { type: 'p', text: 'Vous contrôlez ce que vous partagez.' },
          { type: 'p', text: 'Vous pouvez cesser d\'utiliser la plateforme à tout moment.' },
        ],
      },
    ],
  },
  ja: {
    title: 'プライバシーポリシー',
    updated: '最終更新日：2025年12月',
    sections: [
      { heading: '1. このポリシーの適用対象 👥', body: [{ type: 'p', text: 'このポリシーは以下に適用されます：' }, { type: 'ul', items: ['ELMAモバイルアプリおよびウェブサイトのユーザー', 'ELMA AIと交流する個人', 'ELMAを通じて心理士とのセッションを予約するユーザー'] }, { type: 'p', text: 'ELMAは18歳以上のユーザーのみを対象としています。18歳未満の方からデータを故意に収集することはありません。' }] },
      { heading: '2. ELMAが行うこと（コンテキスト）🧠', body: [{ type: 'p', text: 'ELMAは感情的ウェルネスサポートプラットフォームです：' }, { type: 'ul', items: ['AIベースの感情サポートツールを提供し、', 'オンラインセッションのための独立した第三者の心理士へのアクセスを可能にします。'] }, { type: 'p', text: 'ELMAは医療提供者でも緊急サービスでもなく、専門的なケアの代替品でもありません。' }] },
      { heading: '3. 収集する情報 🗂️', body: [{ type: 'h4', text: '3.1 直接提供される情報' }, { type: 'p', text: 'ELMAの使用方法によって、以下を収集する場合があります：' }, { type: 'ul', items: ['携帯番号、メールアドレス、または認証情報', '共有を選択したプロフィール詳細', 'ELMA AIに入力したメッセージ', '送信を選択した音声入力', 'セラピーセッションの予約情報', 'サポートまたはフィードバックのコミュニケーション'] }, { type: 'p', text: '以下は共有しないでください：' }, { type: 'ul', items: ['パスワード', '銀行情報', '政府発行のID', '非常に機密性の高い個人識別子'] }, { type: 'h4', text: '3.2 AIと音声のインタラクション' }, { type: 'ul', items: ['テキストおよび/または音声入力は応答を生成するために処理される場合があります', '音声機能はマイクの許可が必要です（デバイスによって制御）', '音声入力は正しく機能するためにテキストに変換される場合があります'] }, { type: 'p', text: 'ELMAはAIインタラクションを使用して医療状態を診断または治療しません。' }, { type: 'h4', text: '3.3 セラピー関連データ' }, { type: 'ul', items: ['予約詳細（日付、時間、セラピストID）', '支払いおよび取引記録', 'プラットフォームの運営に必要な限られたセッションメタデータ'] }, { type: 'p', text: 'ELMAは明示的な記載と同意がない限りセラピーセッションを録音しません。' }, { type: 'h4', text: '3.4 自動収集情報' }, { type: 'ul', items: ['デバイスの種類とオペレーティングシステム', 'アプリバージョン', 'ログデータ（クラッシュ、エラー）', 'IPアドレス（セキュリティと不正防止）', 'セッションタイムスタンプ'] }] },
      { heading: '4. データの使用方法 🔍', body: [{ type: 'p', text: 'お客様のデータを次の目的で使用します：' }, { type: 'ul', items: ['ELMAプラットフォームの運営と改善', 'AI感情サポート機能の有効化', 'セラピー予約と支払いの促進', '安全、セキュリティ、および乱用防止の確保', '法的義務の遵守', 'サポートまたは法的要求への対応'] }, { type: 'p', text: '以下の目的にはデータを使用しません：' }, { type: 'ul', items: ['個人情報の販売', '機密性の高い感情的コンテンツに基づくターゲット広告の実施'] }] },
      { heading: '5. 処理の法的根拠（GDPRとDPDP）📜', body: [{ type: 'p', text: '以下に基づいて個人データを処理します：' }, { type: 'ul', items: ['お客様の明示的な同意（主な根拠）', '契約の履行（要求されたサービスの提供）', '法的義務', '正当な利益（プラットフォームのセキュリティ、不正防止）'] }, { type: 'p', text: 'お客様は法的および運営上の制限に従い、いつでも同意を撤回することができます。' }] },
      { heading: '6. AI固有の開示 🤖', body: [{ type: 'ul', items: ['AIの応答は自動的に生成され、不完全な場合があります。', 'AIは感情的ウェルネスサポートのみに使用されます。', 'AIは医療、法律、または専門的なアドバイスを提供しません。', 'お客様は自分で下す決断に責任を持ちます。'] }] },
      { heading: '7. データの共有 🔄', body: [{ type: 'p', text: '以下の限定されたデータを共有する場合があります：' }, { type: 'ul', items: ['クラウドインフラプロバイダー', '決済ゲートウェイ', '分析およびセキュリティプロバイダー', '認可された心理士（セッションに必要なもののみ）', '法律で要求される場合の法的機関'] }, { type: 'p', text: 'すべての第三者は適切なデータ保護基準に従うことが求められています。' }] },
      { heading: '8. 国際データ転送 🌍', body: [{ type: 'p', text: 'お客様のデータは安全なクラウドサービスを使用して、お客様の国外（インド、EU、またはその他の地域を含む）で処理または保存される場合があります。必要に応じて、以下に依拠します：' }, { type: 'ul', items: ['契約上の保護措置', '標準的なデータ保護措置', '適用される法的メカニズム'] }] },
      { heading: '9. データ保持 🗄️', body: [{ type: 'p', text: '個人データは以下の期間保持します：' }, { type: 'ul', items: ['述べた目的のために必要な期間のみ', 'または法律、セキュリティ、または紛争解決に必要な期間'] }, { type: 'p', text: 'お客様は法的保持要件に従い、アカウントと関連データの削除を要求することができます。' }] },
      { heading: '10. お客様の権利 ⚖️', body: [{ type: 'p', text: 'お客様の管轄区域によっては、以下の権利を持つ場合があります：' }, { type: 'ul', items: ['個人データへのアクセス', '不正確なデータの修正', '削除の要求', '同意の撤回', '処理の制限または反対', 'データ保護機関への苦情申し立て'] }, { type: 'p', text: '以下の連絡先詳細を通じてリクエストできます。' }] },
      { heading: '11. セキュリティ対策 🔐', body: [{ type: 'p', text: 'お客様のデータを保護するために、以下を含む合理的な管理的、技術的、および組織的な保護措置を使用しています：' }, { type: 'ul', items: ['暗号化', 'アクセス制御', '安全なインフラ'] }, { type: 'p', text: 'ただし、いかなるシステムも100%安全ではなく、お客様はこのリスクを認識します。' }] },
      { heading: '12. 子どものプライバシー（厳格）👶', body: [{ type: 'p', text: 'ELMAは18歳以上のみです。' }, { type: 'ul', items: ['未成年者からデータを故意に収集することはありません。', '18歳未満のユーザーのものと特定されたアカウントは終了されます。'] }] },
      { heading: '13. クッキーとトラッキング 🍪', body: [{ type: 'p', text: '当ウェブサイトは以下の目的でクッキーまたは同様の技術を使用する場合があります：' }, { type: 'ul', items: ['機能性', 'セキュリティ', '分析'] }, { type: 'p', text: 'ブラウザの設定でクッキーの設定を管理できます。' }] },
      { heading: '14. このポリシーの変更 🔄', body: [{ type: 'p', text: 'このプライバシーポリシーを随時更新する場合があります。' }, { type: 'p', text: '重要な変更はアプリまたはウェブサイトを通じてお知らせします。' }, { type: 'p', text: '変更後も引き続き使用することは、更新されたポリシーへの同意を意味します。' }] },
      { heading: '15. お問い合わせと苦情処理 📞', body: [{ type: 'p', text: '質問、懸念、またはデータリクエストがある場合：' }, { type: 'ul', items: ['苦情/プライバシー担当者', 'ELMA Emotion Solutions LLP', '📧 privacy@elma.ltd', '住所：ELMA Emotion Solutions LLP、ジャイプール、ラジャスタン州、インド'] }, { type: 'p', text: '法律で要求されるように、合理的な期間内に対応することを目指しています。' }] },
      { heading: '16. 準拠法 📚', body: [{ type: 'p', text: 'このプライバシーポリシーは、お客様の管轄区域で適用される強制的な消費者およびデータ保護の権利に従い、インドの法律に準拠します。' }] },
      { heading: 'ユーザーへの最後のメモ ❤️', body: [{ type: 'p', text: 'ELMAはケア、尊重、プライバシーを念頭に置いて構築されています。' }, { type: 'p', text: 'お客様は何を共有するかを管理します。' }, { type: 'p', text: 'いつでもプラットフォームの使用を停止できます。' }] },
    ],
  },
  hi: {
    title: 'गोपनीयता नीति',
    updated: 'अंतिम अपडेट: दिसंबर 2025',
    sections: [
      { heading: '1. यह नीति किस पर लागू होती है 👥', body: [{ type: 'p', text: 'यह नीति निम्नलिखित पर लागू होती है:' }, { type: 'ul', items: ['ELMA मोबाइल ऐप और वेबसाइट के उपयोगकर्ता', 'ELMA AI के साथ बातचीत करने वाले व्यक्ति', 'ELMA के माध्यम से मनोवैज्ञानिकों के साथ सत्र बुक करने वाले उपयोगकर्ता'] }, { type: 'p', text: 'ELMA केवल 18 वर्ष या उससे अधिक आयु के उपयोगकर्ताओं के लिए है। हम जानबूझकर 18 वर्ष से कम आयु के किसी भी व्यक्ति से डेटा एकत्र नहीं करते।' }] },
      { heading: '2. ELMA क्या करती है (संदर्भ) 🧠', body: [{ type: 'p', text: 'ELMA एक भावनात्मक कल्याण सहायता प्लेटफॉर्म है जो:' }, { type: 'ul', items: ['AI-आधारित भावनात्मक सहायता उपकरण प्रदान करती है, और', 'ऑनलाइन सत्रों के लिए स्वतंत्र तृतीय-पक्ष मनोवैज्ञानिकों तक पहुंच प्रदान करती है।'] }, { type: 'p', text: 'ELMA कोई चिकित्सा प्रदाता नहीं है, कोई आपातकालीन सेवा नहीं है, और पेशेवर देखभाल का विकल्प नहीं है।' }] },
      { heading: '3. हम जो जानकारी एकत्र करते हैं 🗂️', body: [{ type: 'h4', text: '3.1 आपके द्वारा सीधे प्रदान की गई जानकारी' }, { type: 'p', text: 'आप ELMA का उपयोग कैसे करते हैं, इसके आधार पर, हम एकत्र कर सकते हैं:' }, { type: 'ul', items: ['मोबाइल नंबर, ईमेल पता, या प्रमाणीकरण क्रेडेंशियल', 'आपके द्वारा साझा की गई प्रोफ़ाइल विवरण', 'ELMA AI को आपके टाइप किए गए संदेश', 'आपके द्वारा सबमिट की गई आवाज़ इनपुट', 'थेरेपी सत्रों के लिए बुकिंग जानकारी', 'सहायता या फीडबैक संचार'] }, { type: 'p', text: 'आपको साझा नहीं करना चाहिए:' }, { type: 'ul', items: ['पासवर्ड', 'बैंक विवरण', 'सरकारी आईडी', 'अत्यधिक संवेदनशील व्यक्तिगत पहचानकर्ता'] }, { type: 'h4', text: '3.2 AI और आवाज़ इंटरैक्शन' }, { type: 'ul', items: ['प्रतिक्रियाएं उत्पन्न करने के लिए टेक्स्ट और/या आवाज़ इनपुट संसाधित हो सकते हैं', 'आवाज़ सुविधाओं के लिए माइक्रोफोन अनुमति की आवश्यकता है (आपके डिवाइस द्वारा नियंत्रित)', 'आवाज़ इनपुट को ठीक से काम करने के लिए टेक्स्ट में बदला जा सकता है'] }, { type: 'p', text: 'ELMA चिकित्सा स्थितियों का निदान या उपचार करने के लिए AI इंटरैक्शन का उपयोग नहीं करती है।' }, { type: 'h4', text: '3.3 थेरेपी-संबंधित डेटा' }, { type: 'ul', items: ['बुकिंग विवरण (तिथि, समय, थेरेपिस्ट ID)', 'भुगतान और लेनदेन रिकॉर्ड', 'प्लेटफॉर्म संचालित करने के लिए आवश्यक सीमित सत्र मेटाडेटा'] }, { type: 'p', text: 'ELMA स्पष्ट रूप से बताए और सहमति के बिना थेरेपी सत्र रिकॉर्ड नहीं करती है।' }, { type: 'h4', text: '3.4 स्वचालित रूप से एकत्रित जानकारी' }, { type: 'ul', items: ['डिवाइस प्रकार और ऑपरेटिंग सिस्टम', 'ऐप संस्करण', 'लॉग डेटा (क्रैश, त्रुटियां)', 'IP पता (सुरक्षा और धोखाधड़ी निवारण के लिए)', 'सत्र टाइमस्टैम्प'] }] },
      { heading: '4. हम आपके डेटा का उपयोग कैसे करते हैं 🔍', body: [{ type: 'p', text: 'हम आपके डेटा का उपयोग करते हैं:' }, { type: 'ul', items: ['ELMA प्लेटफॉर्म को संचालित और बेहतर बनाने के लिए', 'AI भावनात्मक सहायता सुविधाओं को सक्षम करने के लिए', 'थेरेपी बुकिंग और भुगतान की सुविधा के लिए', 'सुरक्षा और दुर्व्यवहार निवारण सुनिश्चित करने के लिए', 'कानूनी दायित्वों का पालन करने के लिए', 'सहायता या कानूनी अनुरोधों का जवाब देने के लिए'] }, { type: 'p', text: 'हम आपके डेटा का उपयोग इसके लिए नहीं करते:' }, { type: 'ul', items: ['व्यक्तिगत जानकारी बेचना', 'संवेदनशील भावनात्मक सामग्री के आधार पर लक्षित विज्ञापन चलाना'] }] },
      { heading: '5. प्रसंस्करण का कानूनी आधार (GDPR और DPDP) 📜', body: [{ type: 'p', text: 'हम निम्न के आधार पर व्यक्तिगत डेटा संसाधित करते हैं:' }, { type: 'ul', items: ['आपकी स्पष्ट सहमति (प्राथमिक आधार)', 'अनुबंध का पालन (आपके द्वारा अनुरोधित सेवाएं प्रदान करना)', 'कानूनी दायित्व', 'वैध हित (प्लेटफॉर्म सुरक्षा, धोखाधड़ी निवारण)'] }, { type: 'p', text: 'आप कानूनी और परिचालन सीमाओं के अधीन किसी भी समय सहमति वापस ले सकते हैं।' }] },
      { heading: '6. AI-विशिष्ट प्रकटीकरण 🤖', body: [{ type: 'ul', items: ['AI प्रतिक्रियाएं स्वचालित रूप से उत्पन्न होती हैं और अपूर्ण हो सकती हैं।', 'AI का उपयोग केवल भावनात्मक कल्याण सहायता के लिए किया जाता है।', 'AI चिकित्सा, कानूनी या पेशेवर सलाह नहीं देती है।', 'आप अपने द्वारा लिए गए निर्णयों के लिए जिम्मेदार रहते हैं।'] }] },
      { heading: '7. डेटा साझा करना 🔄', body: [{ type: 'p', text: 'हम सीमित डेटा साझा कर सकते हैं:' }, { type: 'ul', items: ['क्लाउड इंफ्रास्ट्रक्चर प्रदाताओं के साथ', 'भुगतान गेटवे', 'विश्लेषण और सुरक्षा प्रदाताओं के साथ', 'लाइसेंस प्राप्त मनोवैज्ञानिक (केवल सत्रों के लिए आवश्यक)', 'कानून द्वारा आवश्यक होने पर कानूनी अधिकारियों के साथ'] }, { type: 'p', text: 'सभी तृतीय पक्षों को उचित डेटा संरक्षण मानकों का पालन करना आवश्यक है।' }] },
      { heading: '8. अंतर्राष्ट्रीय डेटा स्थानांतरण 🌍', body: [{ type: 'p', text: 'आपका डेटा सुरक्षित क्लाउड सेवाओं का उपयोग करके आपके देश के बाहर (भारत, EU, या अन्य क्षेत्रों सहित) संसाधित या संग्रहीत किया जा सकता है।' }, { type: 'ul', items: ['संविदात्मक सुरक्षा उपाय', 'मानक डेटा संरक्षण उपाय', 'लागू कानूनी तंत्र'] }] },
      { heading: '9. डेटा प्रतिधारण 🗄️', body: [{ type: 'p', text: 'हम व्यक्तिगत डेटा बनाए रखते हैं:' }, { type: 'ul', items: ['केवल बताए गए उद्देश्यों के लिए आवश्यक समय तक', 'या कानून, सुरक्षा, या विवाद समाधान द्वारा आवश्यक होने तक'] }, { type: 'p', text: 'आप कानूनी प्रतिधारण आवश्यकताओं के अधीन अपने खाते और संबंधित डेटा को हटाने का अनुरोध कर सकते हैं।' }] },
      { heading: '10. आपके अधिकार ⚖️', body: [{ type: 'p', text: 'आपके अधिकार क्षेत्र के आधार पर, आपके पास अधिकार हो सकते हैं:' }, { type: 'ul', items: ['अपने व्यक्तिगत डेटा तक पहुंच', 'अशुद्ध डेटा सही करना', 'हटाने का अनुरोध', 'सहमति वापस लेना', 'प्रसंस्करण को प्रतिबंधित करना या आपत्ति करना', 'डेटा संरक्षण प्राधिकरण के पास शिकायत दर्ज करना'] }, { type: 'p', text: 'अनुरोध नीचे दिए गए संपर्क विवरण के माध्यम से किए जा सकते हैं।' }] },
      { heading: '11. सुरक्षा उपाय 🔐', body: [{ type: 'p', text: 'हम आपके डेटा की सुरक्षा के लिए उचित प्रशासनिक, तकनीकी और संगठनात्मक सुरक्षा उपायों का उपयोग करते हैं, जिनमें शामिल हैं:' }, { type: 'ul', items: ['एन्क्रिप्शन', 'पहुंच नियंत्रण', 'सुरक्षित बुनियादी ढांचा'] }, { type: 'p', text: 'हालांकि, कोई भी सिस्टम 100% सुरक्षित नहीं है, और आप इस जोखिम को स्वीकार करते हैं।' }] },
      { heading: '12. बच्चों की गोपनीयता (सख्त) 👶', body: [{ type: 'p', text: 'ELMA केवल 18+ के लिए है।' }, { type: 'ul', items: ['हम जानबूझकर नाबालिगों से डेटा एकत्र नहीं करते।', '18 वर्ष से कम आयु के उपयोगकर्ताओं के खाते समाप्त कर दिए जाएंगे।'] }] },
      { heading: '13. कुकीज़ और ट्रैकिंग 🍪', body: [{ type: 'p', text: 'हमारी वेबसाइट निम्नलिखित के लिए कुकीज़ या समान तकनीकों का उपयोग कर सकती है:' }, { type: 'ul', items: ['कार्यक्षमता', 'सुरक्षा', 'विश्लेषण'] }, { type: 'p', text: 'आप अपने ब्राउज़र सेटिंग्स के माध्यम से कुकी प्राथमिकताओं को प्रबंधित कर सकते हैं।' }] },
      { heading: '14. इस नीति में बदलाव 🔄', body: [{ type: 'p', text: 'हम समय-समय पर इस गोपनीयता नीति को अपडेट कर सकते हैं।' }, { type: 'p', text: 'महत्वपूर्ण बदलाव ऐप या वेबसाइट के माध्यम से सूचित किए जाएंगे।' }, { type: 'p', text: 'बदलाव के बाद निरंतर उपयोग का अर्थ है अपडेट की गई नीति की स्वीकृति।' }] },
      { heading: '15. संपर्क और शिकायत निवारण 📞', body: [{ type: 'p', text: 'यदि आपके प्रश्न, चिंताएं, या डेटा अनुरोध हैं:' }, { type: 'ul', items: ['शिकायत / गोपनीयता अधिकारी', 'ELMA Emotion Solutions LLP', '📧 privacy@elma.ltd', 'पता: ELMA Emotion Solutions LLP, जयपुर, राजस्थान, भारत'] }, { type: 'p', text: 'हम कानून द्वारा आवश्यक उचित समय सीमा के भीतर प्रतिक्रिया देने का लक्ष्य रखते हैं।' }] },
      { heading: '16. शासन कानून 📚', body: [{ type: 'p', text: 'यह गोपनीयता नीति भारत के कानूनों द्वारा शासित है, आपके अधिकार क्षेत्र में लागू अनिवार्य उपभोक्ता और डेटा संरक्षण अधिकारों के अधीन।' }] },
      { heading: 'उपयोगकर्ताओं के लिए अंतिम नोट ❤️', body: [{ type: 'p', text: 'ELMA को देखभाल, सम्मान और गोपनीयता को ध्यान में रखकर बनाया गया है।' }, { type: 'p', text: 'आप नियंत्रित करते हैं कि आप क्या साझा करते हैं।' }, { type: 'p', text: 'आप किसी भी समय प्लेटफॉर्म का उपयोग बंद कर सकते हैं।' }] },
    ],
  },
  es: {
    title: 'Política de Privacidad',
    updated: 'Última Actualización: Diciembre 2025',
    sections: [
      { heading: '1. A quién aplica esta política 👥', body: [{ type: 'p', text: 'Esta política aplica a:' }, { type: 'ul', items: ['Usuarios de la aplicación móvil y el sitio web de ELMA', 'Personas que interactúan con la IA de ELMA', 'Usuarios que reservan sesiones con psicólogos a través de ELMA'] }, { type: 'p', text: 'ELMA está destinada únicamente a usuarios de 18 años o más. No recopilamos datos de menores de 18 años intencionalmente.' }] },
      { heading: '2. Qué hace ELMA (Contexto) 🧠', body: [{ type: 'p', text: 'ELMA es una plataforma de apoyo al bienestar emocional que:' }, { type: 'ul', items: ['ofrece herramientas de apoyo emocional basadas en IA, y', 'permite acceso a psicólogos independientes de terceros para sesiones en línea.'] }, { type: 'p', text: 'ELMA no es un proveedor médico, no es un servicio de emergencia y no reemplaza la atención profesional.' }] },
      { heading: '3. Información que recopilamos 🗂️', body: [{ type: 'h4', text: '3.1 Información que usted proporciona directamente' }, { type: 'p', text: 'Según cómo utilice ELMA, podemos recopilar:' }, { type: 'ul', items: ['Número de móvil, dirección de correo electrónico o credenciales de autenticación', 'Detalles de perfil que elija compartir', 'Mensajes que escriba a la IA de ELMA', 'Entradas de voz que elija enviar', 'Información de reserva para sesiones de terapia', 'Comunicaciones de soporte o comentarios'] }, { type: 'p', text: 'No debe compartir:' }, { type: 'ul', items: ['contraseñas', 'datos bancarios', 'identificaciones gubernamentales', 'identificadores personales altamente sensibles'] }, { type: 'h4', text: '3.2 Interacciones de IA y voz' }, { type: 'ul', items: ['La entrada de texto y/o voz puede procesarse para generar respuestas', 'Las funciones de voz requieren permiso de micrófono (controlado por su dispositivo)', 'La entrada de voz puede convertirse a texto para funcionar correctamente'] }, { type: 'p', text: 'ELMA no usa interacciones de IA para diagnosticar o tratar condiciones médicas.' }, { type: 'h4', text: '3.3 Datos relacionados con la terapia' }, { type: 'ul', items: ['Detalles de reserva (fecha, hora, ID del terapeuta)', 'Registros de pago y transacciones', 'Metadatos de sesión limitados necesarios para operar la plataforma'] }, { type: 'p', text: 'ELMA no graba sesiones de terapia a menos que se indique explícitamente y se dé consentimiento.' }, { type: 'h4', text: '3.4 Información recopilada automáticamente' }, { type: 'ul', items: ['Tipo de dispositivo y sistema operativo', 'Versión de la aplicación', 'Datos de registro (fallos, errores)', 'Dirección IP (para seguridad y prevención de fraudes)', 'Marcas de tiempo de sesión'] }] },
      { heading: '4. Cómo usamos sus datos 🔍', body: [{ type: 'p', text: 'Usamos sus datos para:' }, { type: 'ul', items: ['Operar y mejorar la plataforma ELMA', 'Habilitar funciones de apoyo emocional con IA', 'Facilitar reservas de terapia y pagos', 'Garantizar seguridad y prevención de abuso', 'Cumplir con obligaciones legales', 'Responder a solicitudes de soporte o legales'] }, { type: 'p', text: 'No usamos sus datos para:' }, { type: 'ul', items: ['vender información personal', 'ejecutar publicidad dirigida basada en contenido emocional sensible'] }] },
      { heading: '5. Base legal para el procesamiento (GDPR y DPDP) 📜', body: [{ type: 'p', text: 'Procesamos datos personales basándonos en:' }, { type: 'ul', items: ['Su consentimiento explícito (base principal)', 'Ejecución de un contrato (prestación de los servicios que solicita)', 'Obligaciones legales', 'Intereses legítimos (seguridad de la plataforma, prevención de fraudes)'] }, { type: 'p', text: 'Puede retirar su consentimiento en cualquier momento, sujeto a límites legales y operativos.' }] },
      { heading: '6. Divulgación específica de IA 🤖', body: [{ type: 'ul', items: ['Las respuestas de IA se generan automáticamente y pueden ser imperfectas.', 'La IA se utiliza solo para el apoyo al bienestar emocional.', 'La IA no proporciona asesoramiento médico, legal o profesional.', 'Usted sigue siendo responsable de las decisiones que toma.'] }] },
      { heading: '7. Compartición de datos 🔄', body: [{ type: 'p', text: 'Podemos compartir datos limitados con:' }, { type: 'ul', items: ['Proveedores de infraestructura en la nube', 'Pasarelas de pago', 'Proveedores de análisis y seguridad', 'Psicólogos con licencia (solo lo necesario para las sesiones)', 'Autoridades legales si lo requiere la ley'] }, { type: 'p', text: 'Todos los terceros deben seguir los estándares apropiados de protección de datos.' }] },
      { heading: '8. Transferencias internacionales de datos 🌍', body: [{ type: 'p', text: 'Sus datos pueden procesarse o almacenarse fuera de su país (incluidos India, UE u otras regiones) utilizando servicios en la nube seguros. Cuando sea necesario, nos basamos en:' }, { type: 'ul', items: ['salvaguardias contractuales', 'medidas estándar de protección de datos', 'mecanismos legales aplicables'] }] },
      { heading: '9. Retención de datos 🗄️', body: [{ type: 'p', text: 'Retenemos datos personales:' }, { type: 'ul', items: ['solo durante el tiempo necesario para los fines indicados', 'o según lo requiera la ley, la seguridad o la resolución de disputas'] }, { type: 'p', text: 'Puede solicitar la eliminación de su cuenta y datos asociados, sujeto a los requisitos legales de retención.' }] },
      { heading: '10. Sus derechos ⚖️', body: [{ type: 'p', text: 'Según su jurisdicción, puede tener derecho a:' }, { type: 'ul', items: ['acceder a sus datos personales', 'corregir datos inexactos', 'solicitar la eliminación', 'retirar su consentimiento', 'restringir u oponerse al procesamiento', 'presentar una queja ante una autoridad de protección de datos'] }, { type: 'p', text: 'Las solicitudes se pueden hacer a través de los datos de contacto a continuación.' }] },
      { heading: '11. Medidas de seguridad 🔐', body: [{ type: 'p', text: 'Utilizamos medidas de protección administrativas, técnicas y organizativas razonables para proteger sus datos, incluyendo:' }, { type: 'ul', items: ['cifrado', 'controles de acceso', 'infraestructura segura'] }, { type: 'p', text: 'Sin embargo, ningún sistema es 100% seguro, y usted reconoce este riesgo.' }] },
      { heading: '12. Privacidad de los niños (Estricta) 👶', body: [{ type: 'p', text: 'ELMA es solo para mayores de 18 años.' }, { type: 'ul', items: ['No recopilamos datos de menores intencionalmente.', 'Las cuentas identificadas como pertenecientes a usuarios menores de 18 años serán terminadas.'] }] },
      { heading: '13. Cookies y seguimiento 🍪', body: [{ type: 'p', text: 'Nuestro sitio web puede usar cookies o tecnologías similares para:' }, { type: 'ul', items: ['funcionalidad', 'seguridad', 'análisis'] }, { type: 'p', text: 'Puede gestionar las preferencias de cookies a través de la configuración de su navegador.' }] },
      { heading: '14. Cambios a esta política 🔄', body: [{ type: 'p', text: 'Podemos actualizar esta Política de Privacidad de vez en cuando.' }, { type: 'p', text: 'Los cambios importantes se comunicarán a través de la aplicación o el sitio web.' }, { type: 'p', text: 'El uso continuado después de los cambios implica la aceptación de la Política actualizada.' }] },
      { heading: '15. Contacto y reparación de quejas 📞', body: [{ type: 'p', text: 'Si tiene preguntas, inquietudes o solicitudes de datos:' }, { type: 'ul', items: ['Oficial de Quejas / Privacidad', 'ELMA Emotion Solutions LLP', '📧 privacy@elma.ltd', 'Dirección: ELMA Emotion Solutions LLP, Jaipur, Rajasthan, India'] }, { type: 'p', text: 'Nos comprometemos a responder dentro de un plazo razonable según lo requiera la ley.' }] },
      { heading: '16. Ley aplicable 📚', body: [{ type: 'p', text: 'Esta Política de Privacidad se rige por las leyes de India, sujeta a los derechos obligatorios de protección al consumidor y datos aplicables en su jurisdicción.' }] },
      { heading: 'Nota final para los usuarios ❤️', body: [{ type: 'p', text: 'ELMA está construida con cuidado, respeto y privacidad en mente.' }, { type: 'p', text: 'Usted controla lo que comparte.' }, { type: 'p', text: 'Puede dejar de usar la Plataforma en cualquier momento.' }] },
    ],
  },
}

function renderBody(items) {
  return items.map((item, i) => {
    if (item.type === 'p') return <p key={i} style={{ color: 'rgba(255,255,255,0.8)' }}>{item.text}</p>
    if (item.type === 'h4') return <h4 key={i} style={{ marginTop: '1rem' }}>{item.text}</h4>
    if (item.type === 'ul') return (
      <ul key={i} style={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.8 }}>
        {item.items.map((li, j) => <li key={j}>{li}</li>)}
      </ul>
    )
    return null
  })
}

function Privacy() {
  const { lang } = useLang()
  const c = CONTENT[lang] || CONTENT.en

  return (
    <main>
      <SEO
        title="Privacy Policy — How ELMA Protects Your Data"
        description="ELMA Privacy Policy — how we collect, use, and safeguard your personal and emotional data. Your privacy is our priority. Read our full policy here."
        canonical="/privacy"
      />
      <section className="subpage">
        <div className="container">
          <header style={{ marginBottom: '2rem', textAlign: 'center', marginTop: '2rem' }}>
            <h1>{c.title} <span className="emoji">🔒</span></h1>
            <p style={{ opacity: 0.8, fontStyle: 'italic' }}>{c.updated}</p>
          </header>

          <div style={{ display: 'grid', gap: '1.5rem', maxWidth: '900px', margin: '0 auto' }}>
            {c.sections.map((sec, i) => (
              <section key={i} style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 16, padding: '1.5rem' }}>
                <h3>{sec.heading}</h3>
                {renderBody(sec.body)}
              </section>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}

export default Privacy
