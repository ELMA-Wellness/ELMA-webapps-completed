import React from 'react'
import { useLang } from '../contexts/LangContext.jsx'

const CONTENT = {
  en: {
    title: 'Cancellation, Rescheduling & Refund Policy',
    updated: 'Last updated: January 2026',
    sections: [
      { heading: null, body: [{ type: 'p', text: 'This Cancellation, Rescheduling & Refund Policy applies to all therapy sessions booked through the ELMA platform ("ELMA", "we", "our", "us"). By booking a session on ELMA, you agree to the terms outlined below.' }] },
      { heading: '1. Nature of Services 🌐', body: [{ type: 'p', text: 'ELMA is a technology platform that enables users to book sessions with independent, certified psychologists.' }, { type: 'p', text: 'ELMA does not provide therapy itself and does not control the clinical content of sessions.' }, { type: 'p', text: 'Sessions are currently conducted outside the ELMA app via third-party video conferencing tools (e.g., Google Meet).' }] },
      { heading: '2. Rescheduling Policy 🔄', body: [{ type: 'ul', items: ['Users may reschedule a session free of charge up to 24 hours before the scheduled session start time.', 'Only one (1) reschedule is permitted per booking.', 'Any reschedule request made within 24 hours of the session start time will be treated as a cancellation and governed by the cancellation rules below.'] }] },
      { heading: '3. User-Initiated Cancellations & Refunds 💸', body: [{ type: 'p', text: 'Refund eligibility depends on when the user cancels the session relative to the scheduled start time:' }, { type: 'h4', text: 'Refund Structure' }, { type: 'ul', items: ['24 hours or more before session start: → 100% refund', 'Between 12 and 24 hours before session start: → 50% refund', 'Less than 12 hours before session start OR no-show by the user: → No refund'] }, { type: 'h4', text: 'Important Notes' }, { type: 'ul', items: ['Refunds are processed to the original payment method only.', 'Refund timelines may vary depending on the payment provider.', 'ELMA reserves the right to deny refunds in cases of suspected misuse, abuse, or policy violations.'] }] },
      { heading: '4. Therapist-Initiated Cancellations 🚫', body: [{ type: 'p', text: 'If a session is cancelled by the psychologist for any reason:' }, { type: 'ul', items: ['The user is entitled to a 100% refund of the session fee.'] }, { type: 'p', text: 'No additional compensation or credits are provided at this stage.' }] },
      { heading: '5. Therapist No-Show Policy (Sessions via Google Meet) ⏳', body: [{ type: 'p', text: 'If a psychologist does not join the scheduled session within 10 minutes of the scheduled start time, the session may be treated as a therapist no-show.' }, { type: 'h4', text: 'Refund Eligibility' }, { type: 'p', text: 'In such cases, the user is eligible for a 100% refund, subject to verification.' }, { type: 'h4', text: 'Verification Requirement' }, { type: 'p', text: 'Because sessions occur outside the ELMA platform, ELMA requires basic verification to prevent misuse or fraudulent claims.' }, { type: 'p', text: 'To request a refund for a therapist no-show, the user must provide:' }, { type: 'ul', items: ['A single screenshot showing:', '• The Google Meet waiting screen or empty meeting room', '• The system time visible, clearly showing at least 10 minutes past the scheduled session start time'] }, { type: 'p', text: "The screenshot must be shared through ELMA's official support channel (e.g., in-app support or registered support email)." }, { type: 'p', text: 'ELMA reserves the right to:' }, { type: 'ul', items: ['Verify the claim against booking records', 'Reject claims that are incomplete, unclear, manipulated, or inconsistent with session data'] }] },
      { heading: '6. Abuse, Fraud & Misuse 🛡️', body: [{ type: 'p', text: 'To protect psychologists, users, and the integrity of the platform:' }, { type: 'ul', items: ['ELMA actively monitors cancellation and refund patterns.', 'Repeated refund requests, false claims, or attempts to manipulate timestamps or evidence may result in:', '• Refund denial', '• Temporary suspension of booking privileges', '• Permanent account restriction in severe cases'] }, { type: 'p', text: 'All decisions taken by ELMA in relation to suspected misuse are final.' }] },
      { heading: '7. Force Majeure & Technical Issues ⚠️', body: [{ type: 'p', text: 'ELMA is not responsible for:' }, { type: 'ul', items: ["Internet connectivity issues on the user's or therapist's end", 'Device failures', 'Issues caused by third-party platforms (including Google Meet)'] }, { type: 'p', text: 'Refunds in such cases are not guaranteed and are evaluated on a case-by-case basis.' }] },
      { heading: '8. Policy Changes 📝', body: [{ type: 'p', text: 'ELMA reserves the right to modify this policy at any time. Any changes will be effective immediately upon being updated on the ELMA website or app.' }, { type: 'p', text: 'Continued use of the platform after updates constitutes acceptance of the revised policy.' }] },
      { heading: '9. Contact & Support 📧', body: [{ type: 'p', text: 'For cancellation-related queries or refund requests, users may contact ELMA through the official support channels listed on the website or within the app.' }] },
    ],
  },
  fr: {
    title: 'Politique d\'Annulation, de Reprogrammation et de Remboursement',
    updated: 'Dernière mise à jour : Janvier 2026',
    sections: [
      { heading: null, body: [{ type: 'p', text: 'Cette politique d\'annulation, de reprogrammation et de remboursement s\'applique à toutes les séances de thérapie réservées via la plateforme ELMA. En réservant une séance sur ELMA, vous acceptez les conditions décrites ci-dessous.' }] },
      { heading: '1. Nature des services 🌐', body: [{ type: 'p', text: 'ELMA est une plateforme technologique qui permet aux utilisateurs de réserver des séances avec des psychologues indépendants certifiés.' }, { type: 'p', text: 'ELMA ne fournit pas elle-même de thérapie et ne contrôle pas le contenu clinique des séances.' }, { type: 'p', text: 'Les séances sont actuellement conduites en dehors de l\'application ELMA via des outils de vidéoconférence tiers (ex : Google Meet).' }] },
      { heading: '2. Politique de reprogrammation 🔄', body: [{ type: 'ul', items: ['Les utilisateurs peuvent reprogrammer une séance gratuitement jusqu\'à 24 heures avant l\'heure de début prévue.', 'Une seule (1) reprogrammation est autorisée par réservation.', 'Toute demande de reprogrammation faite dans les 24 heures suivant l\'heure de début sera traitée comme une annulation et régie par les règles d\'annulation ci-dessous.'] }] },
      { heading: '3. Annulations et remboursements initiés par l\'utilisateur 💸', body: [{ type: 'p', text: 'L\'éligibilité au remboursement dépend du moment où l\'utilisateur annule la séance par rapport à l\'heure de début prévue :' }, { type: 'h4', text: 'Structure de remboursement' }, { type: 'ul', items: ['24 heures ou plus avant le début de la séance : → Remboursement de 100%', 'Entre 12 et 24 heures avant le début : → Remboursement de 50%', 'Moins de 12 heures avant le début OU absence de l\'utilisateur : → Aucun remboursement'] }, { type: 'h4', text: 'Notes importantes' }, { type: 'ul', items: ['Les remboursements sont effectués uniquement sur le mode de paiement original.', 'Les délais de remboursement peuvent varier selon le prestataire de paiement.', 'ELMA se réserve le droit de refuser les remboursements en cas de suspicion d\'abus ou de violations de politique.'] }] },
      { heading: '4. Annulations initiées par le thérapeute 🚫', body: [{ type: 'p', text: 'Si une séance est annulée par le psychologue pour quelque raison que ce soit :' }, { type: 'ul', items: ['L\'utilisateur a droit à un remboursement de 100% des frais de séance.'] }, { type: 'p', text: 'Aucune compensation ou crédit supplémentaire n\'est fourni à ce stade.' }] },
      { heading: '5. Politique d\'absence du thérapeute (Séances via Google Meet) ⏳', body: [{ type: 'p', text: 'Si un psychologue ne rejoint pas la séance planifiée dans les 10 minutes suivant l\'heure de début prévue, la séance peut être traitée comme une absence du thérapeute.' }, { type: 'h4', text: 'Éligibilité au remboursement' }, { type: 'p', text: 'Dans de tels cas, l\'utilisateur est éligible à un remboursement de 100%, sous réserve de vérification.' }, { type: 'h4', text: 'Exigence de vérification' }, { type: 'p', text: 'Étant donné que les séances se déroulent en dehors de la plateforme ELMA, une vérification de base est requise.' }, { type: 'ul', items: ['Une capture d\'écran unique montrant :', '• L\'écran d\'attente Google Meet ou la salle de réunion vide', '• L\'heure système visible, montrant clairement au moins 10 minutes après l\'heure de début prévue'] }, { type: 'p', text: 'La capture d\'écran doit être partagée via le canal de support officiel d\'ELMA.' }] },
      { heading: '6. Abus, fraude et mauvaise utilisation 🛡️', body: [{ type: 'p', text: 'Pour protéger les psychologues, les utilisateurs et l\'intégrité de la plateforme :' }, { type: 'ul', items: ['ELMA surveille activement les tendances d\'annulation et de remboursement.', 'Les demandes répétées de remboursement, les fausses réclamations ou les tentatives de manipulation peuvent entraîner :', '• Refus de remboursement', '• Suspension temporaire des privilèges de réservation', '• Restriction permanente du compte dans les cas graves'] }, { type: 'p', text: 'Toutes les décisions prises par ELMA concernant les abus présumés sont définitives.' }] },
      { heading: '7. Force majeure et problèmes techniques ⚠️', body: [{ type: 'p', text: 'ELMA n\'est pas responsable des :' }, { type: 'ul', items: ['Problèmes de connectivité internet du côté de l\'utilisateur ou du thérapeute', 'Défaillances d\'appareils', 'Problèmes causés par des plateformes tierces (y compris Google Meet)'] }, { type: 'p', text: 'Les remboursements dans de tels cas ne sont pas garantis et sont évalués au cas par cas.' }] },
      { heading: '8. Modifications de la politique 📝', body: [{ type: 'p', text: 'ELMA se réserve le droit de modifier cette politique à tout moment. Tout changement sera effectif immédiatement après sa mise à jour sur le site web ou l\'application ELMA.' }, { type: 'p', text: 'L\'utilisation continue de la plateforme après les mises à jour constitue une acceptation de la politique révisée.' }] },
      { heading: '9. Contact et support 📧', body: [{ type: 'p', text: 'Pour les questions liées aux annulations ou les demandes de remboursement, les utilisateurs peuvent contacter ELMA via les canaux de support officiels répertoriés sur le site web ou dans l\'application.' }] },
    ],
  },
  ja: {
    title: 'キャンセル、日程変更、および返金ポリシー',
    updated: '最終更新日：2026年1月',
    sections: [
      { heading: null, body: [{ type: 'p', text: 'このキャンセル、日程変更、および返金ポリシーは、ELMAプラットフォームを通じて予約されたすべてのセラピーセッションに適用されます。ELMAでセッションを予約することにより、以下に概説された条件に同意したものとみなされます。' }] },
      { heading: '1. サービスの性質 🌐', body: [{ type: 'p', text: 'ELMAは、ユーザーが独立した認定心理士とセッションを予約できるテクノロジープラットフォームです。' }, { type: 'p', text: 'ELMAはセラピー自体を提供せず、セッションの臨床内容を管理しません。' }, { type: 'p', text: 'セッションは現在、第三者のビデオ会議ツール（Google Meetなど）を介してELMAアプリの外部で行われています。' }] },
      { heading: '2. 日程変更ポリシー 🔄', body: [{ type: 'ul', items: ['ユーザーは、予定されたセッション開始時刻の24時間前まで無料でセッションを変更できます。', '予約ごとに1回（1）の変更のみ許可されます。', 'セッション開始時刻の24時間以内に行われた変更リクエストはキャンセルとして扱われ、下記のキャンセル規則によって管理されます。'] }] },
      { heading: '3. ユーザー主導のキャンセルと返金 💸', body: [{ type: 'p', text: '返金資格は、ユーザーが予定開始時刻に対してセッションをキャンセルするタイミングによって異なります：' }, { type: 'h4', text: '返金構造' }, { type: 'ul', items: ['セッション開始24時間以上前：→ 100%返金', 'セッション開始12〜24時間前：→ 50%返金', 'セッション開始12時間未満前またはユーザーの不参加：→ 返金なし'] }, { type: 'h4', text: '重要な注意事項' }, { type: 'ul', items: ['返金は元の支払い方法にのみ処理されます。', '返金のタイムラインは決済プロバイダーによって異なる場合があります。', 'ELMAは、疑いのある悪用や方針違反の場合に返金を拒否する権利を留保します。'] }] },
      { heading: '4. セラピスト主導のキャンセル 🚫', body: [{ type: 'p', text: '何らかの理由で心理士によってセッションがキャンセルされた場合：' }, { type: 'ul', items: ['ユーザーはセッション料金の100%の返金を受ける権利があります。'] }, { type: 'p', text: 'この段階では追加の補償やクレジットは提供されません。' }] },
      { heading: '5. セラピスト不参加ポリシー（Google Meet経由のセッション）⏳', body: [{ type: 'p', text: '心理士が予定された開始時刻から10分以内に予約されたセッションに参加しない場合、そのセッションはセラピスト不参加として扱われる場合があります。' }, { type: 'h4', text: '返金資格' }, { type: 'p', text: 'そのような場合、ユーザーは確認を条件として100%の返金を受ける資格があります。' }, { type: 'h4', text: '確認要件' }, { type: 'ul', items: ['Google Meetの待機画面または空の会議室を示す1枚のスクリーンショット', '• 予定されたセッション開始時刻から少なくとも10分後を明確に示すシステム時刻が見える状態'] }, { type: 'p', text: 'スクリーンショットはELMAの公式サポートチャネルを通じて共有する必要があります。' }] },
      { heading: '6. 乱用、詐欺、悪用 🛡️', body: [{ type: 'p', text: '心理士、ユーザー、プラットフォームの完全性を守るために、ELMAはキャンセルと返金パターンを積極的に監視します。繰り返しの返金要求や虚偽の申請はアカウントの制限につながる場合があります。' }] },
      { heading: '7. 不可抗力と技術的問題 ⚠️', body: [{ type: 'p', text: 'ELMAは以下について責任を負いません：' }, { type: 'ul', items: ['ユーザーまたはセラピスト側のインターネット接続の問題', 'デバイスの障害', '第三者プラットフォーム（Google Meetを含む）によって引き起こされる問題'] }, { type: 'p', text: 'このような場合の返金は保証されず、ケースバイケースで評価されます。' }] },
      { heading: '8. ポリシーの変更 📝', body: [{ type: 'p', text: 'ELMAはいつでもこのポリシーを変更する権利を留保します。変更はELMAのウェブサイトまたはアプリで更新された直後から有効になります。' }] },
      { heading: '9. お問い合わせとサポート 📧', body: [{ type: 'p', text: 'キャンセル関連の問い合わせや返金リクエストについては、ウェブサイトまたはアプリ内に記載されている公式サポートチャネルからELMAにお問い合わせください。' }] },
    ],
  },
  hi: {
    title: 'रद्दीकरण, पुनर्निर्धारण और वापसी नीति',
    updated: 'अंतिम अपडेट: जनवरी 2026',
    sections: [
      { heading: null, body: [{ type: 'p', text: 'यह रद्दीकरण, पुनर्निर्धारण और वापसी नीति ELMA प्लेटफॉर्म के माध्यम से बुक किए गए सभी थेरेपी सत्रों पर लागू होती है। ELMA पर सत्र बुक करके, आप नीचे बताई गई शर्तों से सहमत होते हैं।' }] },
      { heading: '1. सेवाओं की प्रकृति 🌐', body: [{ type: 'p', text: 'ELMA एक तकनीकी प्लेटफॉर्म है जो उपयोगकर्ताओं को स्वतंत्र, प्रमाणित मनोवैज्ञानिकों के साथ सत्र बुक करने में सक्षम बनाता है।' }, { type: 'p', text: 'ELMA स्वयं थेरेपी प्रदान नहीं करती और सत्रों की नैदानिक सामग्री को नियंत्रित नहीं करती।' }] },
      { heading: '2. पुनर्निर्धारण नीति 🔄', body: [{ type: 'ul', items: ['उपयोगकर्ता निर्धारित सत्र प्रारंभ समय से 24 घंटे पहले तक बिना शुल्क के सत्र पुनर्निर्धारित कर सकते हैं।', 'प्रति बुकिंग केवल एक (1) पुनर्निर्धारण की अनुमति है।', 'सत्र प्रारंभ समय के 24 घंटे के भीतर किया गया कोई भी पुनर्निर्धारण अनुरोध रद्दीकरण माना जाएगा।'] }] },
      { heading: '3. उपयोगकर्ता-आरंभित रद्दीकरण और वापसी 💸', body: [{ type: 'p', text: 'वापसी की पात्रता इस बात पर निर्भर करती है कि उपयोगकर्ता निर्धारित प्रारंभ समय के सापेक्ष सत्र कब रद्द करता है:' }, { type: 'h4', text: 'वापसी संरचना' }, { type: 'ul', items: ['सत्र प्रारंभ से 24 घंटे या अधिक पहले: → 100% वापसी', 'सत्र प्रारंभ से 12 से 24 घंटे पहले: → 50% वापसी', 'सत्र प्रारंभ से 12 घंटे से कम पहले या उपयोगकर्ता द्वारा अनुपस्थित: → कोई वापसी नहीं'] }, { type: 'h4', text: 'महत्वपूर्ण नोट्स' }, { type: 'ul', items: ['वापसी केवल मूल भुगतान विधि पर संसाधित की जाती है।', 'वापसी की समयसीमा भुगतान प्रदाता के आधार पर भिन्न हो सकती है।', 'ELMA संदिग्ध दुरुपयोग के मामलों में वापसी से इनकार करने का अधिकार सुरक्षित रखती है।'] }] },
      { heading: '4. थेरेपिस्ट-आरंभित रद्दीकरण 🚫', body: [{ type: 'p', text: 'यदि किसी भी कारण से मनोवैज्ञानिक द्वारा सत्र रद्द किया जाता है:' }, { type: 'ul', items: ['उपयोगकर्ता सत्र शुल्क का 100% वापसी पाने का हकदार है।'] }] },
      { heading: '5. थेरेपिस्ट नो-शो नीति (Google Meet के माध्यम से सत्र) ⏳', body: [{ type: 'p', text: 'यदि मनोवैज्ञानिक निर्धारित प्रारंभ समय के 10 मिनट के भीतर निर्धारित सत्र में शामिल नहीं होता है, तो सत्र को थेरेपिस्ट नो-शो माना जा सकता है।' }, { type: 'ul', items: ['Google Meet प्रतीक्षा स्क्रीन या खाली मीटिंग रूम दिखाने वाला एक स्क्रीनशॉट', '• सिस्टम समय जो निर्धारित सत्र प्रारंभ समय से कम से कम 10 मिनट बाद दिखाता हो'] }, { type: 'p', text: 'स्क्रीनशॉट ELMA के आधिकारिक सहायता चैनल के माध्यम से साझा किया जाना चाहिए।' }] },
      { heading: '6. दुरुपयोग, धोखाधड़ी और कुप्रयोग 🛡️', body: [{ type: 'p', text: 'ELMA रद्दीकरण और वापसी पैटर्न की सक्रिय रूप से निगरानी करती है। बार-बार वापसी अनुरोध, झूठे दावे खाते प्रतिबंधित कर सकते हैं।' }] },
      { heading: '7. अप्रत्याशित परिस्थितियां और तकनीकी समस्याएं ⚠️', body: [{ type: 'p', text: 'ELMA निम्नलिखित के लिए जिम्मेदार नहीं है:' }, { type: 'ul', items: ['उपयोगकर्ता या थेरेपिस्ट की तरफ से इंटरनेट कनेक्टिविटी समस्याएं', 'डिवाइस विफलताएं', 'तृतीय-पक्ष प्लेटफॉर्म (Google Meet सहित) द्वारा उत्पन्न समस्याएं'] }, { type: 'p', text: 'ऐसे मामलों में वापसी की गारंटी नहीं है और मामले-दर-मामले आधार पर मूल्यांकन किया जाता है।' }] },
      { heading: '8. नीति परिवर्तन 📝', body: [{ type: 'p', text: 'ELMA किसी भी समय इस नीति को संशोधित करने का अधिकार सुरक्षित रखती है। निरंतर उपयोग संशोधित नीति की स्वीकृति का प्रतीक है।' }] },
      { heading: '9. संपर्क और सहायता 📧', body: [{ type: 'p', text: 'रद्दीकरण संबंधी प्रश्नों या वापसी अनुरोधों के लिए, उपयोगकर्ता वेबसाइट या ऐप में सूचीबद्ध आधिकारिक सहायता चैनलों के माध्यम से ELMA से संपर्क कर सकते हैं।' }] },
    ],
  },
  es: {
    title: 'Política de Cancelación, Reprogramación y Reembolso',
    updated: 'Última actualización: Enero 2026',
    sections: [
      { heading: null, body: [{ type: 'p', text: 'Esta Política de Cancelación, Reprogramación y Reembolso aplica a todas las sesiones de terapia reservadas a través de la plataforma ELMA. Al reservar una sesión en ELMA, acepta los términos descritos a continuación.' }] },
      { heading: '1. Naturaleza de los servicios 🌐', body: [{ type: 'p', text: 'ELMA es una plataforma tecnológica que permite a los usuarios reservar sesiones con psicólogos independientes certificados.' }, { type: 'p', text: 'ELMA no proporciona terapia por sí misma y no controla el contenido clínico de las sesiones.' }] },
      { heading: '2. Política de reprogramación 🔄', body: [{ type: 'ul', items: ['Los usuarios pueden reprogramar una sesión sin cargo hasta 24 horas antes de la hora de inicio programada.', 'Solo se permite una (1) reprogramación por reserva.', 'Cualquier solicitud de reprogramación realizada dentro de las 24 horas será tratada como una cancelación.'] }] },
      { heading: '3. Cancelaciones y reembolsos iniciados por el usuario 💸', body: [{ type: 'h4', text: 'Estructura de reembolso' }, { type: 'ul', items: ['24 horas o más antes del inicio de la sesión: → Reembolso del 100%', 'Entre 12 y 24 horas antes del inicio: → Reembolso del 50%', 'Menos de 12 horas antes del inicio O ausencia del usuario: → Sin reembolso'] }, { type: 'h4', text: 'Notas importantes' }, { type: 'ul', items: ['Los reembolsos se procesan solo al método de pago original.', 'Los plazos de reembolso pueden variar según el proveedor de pago.', 'ELMA se reserva el derecho de denegar reembolsos en casos de abuso sospechado.'] }] },
      { heading: '4. Cancelaciones iniciadas por el terapeuta 🚫', body: [{ type: 'p', text: 'Si una sesión es cancelada por el psicólogo por cualquier razón:' }, { type: 'ul', items: ['El usuario tiene derecho a un reembolso del 100% de la tarifa de la sesión.'] }] },
      { heading: '5. Política de no asistencia del terapeuta (Sesiones via Google Meet) ⏳', body: [{ type: 'p', text: 'Si un psicólogo no se une a la sesión programada dentro de los 10 minutos posteriores a la hora de inicio, la sesión puede tratarse como una no asistencia del terapeuta.' }, { type: 'p', text: 'En tales casos, el usuario es elegible para un reembolso del 100%, sujeto a verificación.' }, { type: 'ul', items: ['Una captura de pantalla única que muestre la pantalla de espera de Google Meet o la sala de reunión vacía', '• La hora del sistema visible, mostrando claramente al menos 10 minutos después de la hora de inicio programada'] }] },
      { heading: '6. Abuso, fraude y mal uso 🛡️', body: [{ type: 'p', text: 'ELMA monitorea activamente los patrones de cancelación y reembolso. Las solicitudes repetidas de reembolso o reclamaciones falsas pueden resultar en restricción de cuenta.' }] },
      { heading: '7. Fuerza mayor y problemas técnicos ⚠️', body: [{ type: 'p', text: 'ELMA no es responsable de problemas de conectividad a internet, fallas del dispositivo o problemas causados por plataformas de terceros (incluyendo Google Meet). Los reembolsos en tales casos se evalúan caso por caso.' }] },
      { heading: '8. Cambios de política 📝', body: [{ type: 'p', text: 'ELMA se reserva el derecho de modificar esta política en cualquier momento. El uso continuado constituye aceptación de la política revisada.' }] },
      { heading: '9. Contacto y soporte 📧', body: [{ type: 'p', text: 'Para consultas relacionadas con cancelaciones o solicitudes de reembolso, los usuarios pueden contactar a ELMA a través de los canales de soporte oficiales.' }] },
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

function Cancellation() {
  const { lang } = useLang()
  const c = CONTENT[lang] || CONTENT.en

  return (
    <main>
      <section className="subpage">
        <div className="container">
          <header style={{ marginBottom: '2rem', textAlign: 'center', marginTop: '2rem' }}>
            <h1>{c.title} <span className="emoji">📅</span></h1>
            <p style={{ opacity: 0.8, fontStyle: 'italic' }}>{c.updated}</p>
          </header>

          <div style={{ display: 'grid', gap: '1.5rem', maxWidth: '900px', margin: '0 auto' }}>
            {c.sections.map((sec, i) => (
              <section key={i} style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 16, padding: '1.5rem' }}>
                {sec.heading && <h3>{sec.heading}</h3>}
                {renderBody(sec.body)}
              </section>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}

export default Cancellation
