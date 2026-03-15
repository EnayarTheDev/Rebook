import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = 'onboarding@resend.dev';

export async function sendApprovalAccepted(email: string, firstName: string) {
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: 'Votre compte Re:Book a été approuvé !',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#fdfbf7;border:2px solid #2d2d2d;border-radius:8px;">
        <h2 style="font-size:1.5rem;margin-bottom:8px;">Bonjour ${firstName},</h2>
        <p style="color:#444;">Bonne nouvelle ! Votre demande d'accès à <strong>Re:Book</strong> a été <strong>approuvée</strong>.</p>
        <p style="color:#444;">Vous pouvez maintenant vous connecter et commencer à échanger des livres.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/auth/login"
           style="display:inline-block;margin-top:16px;padding:12px 24px;background:#2d8a4e;color:white;border-radius:6px;text-decoration:none;font-weight:bold;">
          Se connecter →
        </a>
        <p style="margin-top:32px;color:#aaa;font-size:0.85rem;">Re:Book — Échangez vos livres gratuitement</p>
      </div>
    `,
  });
}

export async function sendApprovalRejected(email: string, firstName: string) {
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: 'Demande Re:Book refusée',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#fdfbf7;border:2px solid #2d2d2d;border-radius:8px;">
        <h2 style="font-size:1.5rem;margin-bottom:8px;">Bonjour ${firstName},</h2>
        <p style="color:#444;">Votre demande d'accès à <strong>Re:Book</strong> n'a pas pu être approuvée pour le moment.</p>
        <p style="color:#444;">Si vous pensez qu'il s'agit d'une erreur, contactez un administrateur.</p>
        <p style="margin-top:32px;color:#aaa;font-size:0.85rem;">Re:Book — Échangez vos livres gratuitement</p>
      </div>
    `,
  });
}

export async function sendBookRequest(
  ownerEmail: string,
  ownerFirstName: string,
  requesterName: string,
  bookTitle: string
) {
  await resend.emails.send({
    from: FROM,
    to: ownerEmail,
    subject: `Quelqu'un veut échanger "${bookTitle}"`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#fdfbf7;border:2px solid #2d2d2d;border-radius:8px;">
        <h2 style="font-size:1.5rem;margin-bottom:8px;">Bonjour ${ownerFirstName},</h2>
        <p style="color:#444;"><strong>${requesterName}</strong> souhaite échanger votre livre <strong>"${bookTitle}"</strong>.</p>
        <p style="color:#444;">Connectez-vous pour voir la demande et y répondre.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}"
           style="display:inline-block;margin-top:16px;padding:12px 24px;background:#2d8a4e;color:white;border-radius:6px;text-decoration:none;font-weight:bold;">
          Voir la demande →
        </a>
        <p style="margin-top:32px;color:#aaa;font-size:0.85rem;">Re:Book — Échangez vos livres gratuitement</p>
      </div>
    `,
  });
}

export async function sendExchangeConfirmed(
  email: string,
  firstName: string,
  bookTitle: string,
  otherPersonName: string
) {
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: `Échange confirmé pour "${bookTitle}"`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#fdfbf7;border:2px solid #2d2d2d;border-radius:8px;">
        <h2 style="font-size:1.5rem;margin-bottom:8px;">Bonjour ${firstName},</h2>
        <p style="color:#444;">Votre échange du livre <strong>"${bookTitle}"</strong> avec <strong>${otherPersonName}</strong> a été <strong>confirmé</strong> !</p>
        <p style="color:#444;">Coordonnez-vous pour organiser l'échange.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}"
           style="display:inline-block;margin-top:16px;padding:12px 24px;background:#2d8a4e;color:white;border-radius:6px;text-decoration:none;font-weight:bold;">
          Ouvrir Re:Book →
        </a>
        <p style="margin-top:32px;color:#aaa;font-size:0.85rem;">Re:Book — Échangez vos livres gratuitement</p>
      </div>
    `,
  });
}