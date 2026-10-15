import type { Metadata } from "next";
import Link from "next/link";
import { CONTACT_EMAIL, LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy | Nana's Hub",
  description: "How Nana's Hub collects, uses and protects your personal information.",
};

const email = <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>;

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="15 October 2026"
      intro={
        <>
          <p>
            Nana&apos;s Hub helps people in the UK find Black hair, beauty and grooming professionals. This policy explains
            what personal information we collect, why we collect it, who we share it with, and the choices you have.
          </p>
          <p>
            Nana&apos;s Hub is run by Bethany Boatin, who is the <strong>data controller</strong> for your information. You can
            contact us about anything in this policy at {email}.
          </p>
        </>
      }
      sections={[
        {
          id: "what-we-collect",
          heading: "What we collect",
          body: (
            <>
              <p><strong>If you join the waitlist:</strong> your email address and whether you&apos;re a client or a professional.</p>
              <p><strong>If you create an account:</strong> your first and last name, email address, password (stored securely and never visible to us), and whether you&apos;re a client or a professional. You may also add your town or city.</p>
              <p><strong>If you&apos;re a professional,</strong> the details you add to your profile, which are shown publicly:</p>
              <ul>
                <li>business name, bio and years of experience</li>
                <li>the categories and services you offer, with prices and durations</li>
                <li>where you work (salon address, or that you travel and how far)</li>
                <li>Instagram handle, booking link, when your slots are released, and a featured video link</li>
                <li>photos you upload to Pro Highlights</li>
              </ul>
              <p><strong>If you leave a review:</strong> your star rating, your comment and the date. Reviews are shown publicly with your first name and the first letter of your last name (for example &quot;Amara O.&quot;). If you&apos;re a professional, any replies you write to reviews are also shown publicly.</p>
              <p><strong>Technical information:</strong> our hosting provider records basic information such as your IP address and browser type when you visit, to keep the site running and secure. When you log in, your browser stores a sign-in token so you stay logged in.</p>
            </>
          ),
        },
        {
          id: "how-we-use",
          heading: "How we use it, and our legal reasons",
          body: (
            <>
              <p>UK data protection law requires us to have a legal reason (a &quot;lawful basis&quot;) for using your information:</p>
              <ul>
                <li><strong>To run your account and show pro profiles to clients</strong>, because it&apos;s needed to provide the service you signed up for (contract).</li>
                <li><strong>To email waitlist members when we launch near them</strong>, because you asked us to (consent). You can withdraw this at any time.</li>
                <li><strong>To keep the site secure, prevent misuse and fix problems</strong>, because it&apos;s in our and our users&apos; legitimate interests.</li>
                <li><strong>To meet legal obligations</strong>, for example if the law requires us to keep or share certain information.</li>
              </ul>
              <p>We don&apos;t sell your information, and we don&apos;t use it for advertising profiles.</p>
            </>
          ),
        },
        {
          id: "who-sees",
          heading: "Who can see your information",
          body: (
            <>
              <p><strong>The public</strong> can see professionals&apos; profiles: business name, first and last name, town or city, categories, services and prices, photos, and the other details listed above.</p>
              <p><strong>We never show</strong> anyone&apos;s email address, phone number or full postcode on the site.</p>
              <p><strong>Reviews</strong> are public and show the reviewer&apos;s first name and last initial.</p>
              <p><strong>Clients&apos;</strong> other details aren&apos;t shown publicly.</p>
            </>
          ),
        },
        {
          id: "providers",
          heading: "Companies that help us run Nana's Hub",
          body: (
            <>
              <p>We use a small number of trusted providers. They process your information only on our instructions and must keep it secure:</p>
              <ul>
                <li><strong>Supabase</strong>: stores our database, accounts and uploaded photos.</li>
                <li><strong>Vercel</strong>: hosts the website.</li>
                <li><strong>Resend</strong>: sends our emails.</li>
              </ul>
              <p>
                Some of these providers may store or process information outside the UK, including in the United States. Where
                that happens, we rely on the safeguards UK law allows, such as the UK&apos;s adequacy regulations or the
                International Data Transfer Addendum, so your information gets an equivalent level of protection.
              </p>
            </>
          ),
        },
        {
          id: "bookings",
          heading: "Booking with a professional",
          body: (
            <p>
              When you tap <strong>Book now</strong>, you go to the professional&apos;s own booking website (for example Acuity,
              Fresha or Booksy) or their Instagram. Those sites are run by other companies, and their own privacy policies
              apply to anything you share there. Nana&apos;s Hub doesn&apos;t see or store those bookings.
            </p>
          ),
        },
        {
          id: "how-long",
          heading: "How long we keep it",
          body: (
            <ul>
              <li><strong>Accounts, profiles and reviews:</strong> until you delete them or your account. Deleting your account also deletes the reviews you&apos;ve written and, for professionals, the reviews about you.</li>
              <li><strong>Waitlist:</strong> until you ask to be removed, or 12 months after we launch in your area, whichever is sooner.</li>
              <li><strong>Deleted accounts:</strong> removed straight away from the live site. Copies may remain in our providers&apos; backups for up to 30 days before they&apos;re overwritten.</li>
            </ul>
          ),
        },
        {
          id: "your-rights",
          heading: "Your rights",
          body: (
            <>
              <p>Under UK data protection law you have the right to:</p>
              <ul>
                <li>get a copy of the information we hold about you</li>
                <li>ask us to correct anything that&apos;s wrong</li>
                <li>ask us to delete your information</li>
                <li>ask us to limit how we use it, or object to how we use it</li>
                <li>receive your information in a format you can take elsewhere</li>
                <li>withdraw consent at any time, where we rely on consent</li>
              </ul>
              <p>
                <strong>To delete your account yourself,</strong> log in, go to <Link href="/account">My account</Link> and choose
                <strong> Delete my account</strong>. For anything else, email {email}. We&apos;ll reply within one month.
              </p>
            </>
          ),
        },
        {
          id: "age",
          heading: "Age limits",
          body: (
            <p>
              You must be <strong>16 or over</strong> to create a client account and <strong>18 or over</strong> to create a
              professional account. If you believe someone under these ages has given us their information, email {email} and
              we&apos;ll remove it.
            </p>
          ),
        },
        {
          id: "security",
          heading: "Keeping your information safe",
          body: (
            <p>
              Passwords are stored securely by our account provider, and nobody at Nana&apos;s Hub can see them. Our database
              rules mean people can only change their own information. No website can be completely secure, but if we ever
              discover a breach that puts you at risk, we&apos;ll tell you and the regulator where the law requires it.
            </p>
          ),
        },
        {
          id: "cookies",
          heading: "Cookies and similar storage",
          body: (
            <p>
              We don&apos;t use advertising or tracking cookies. When you log in, your browser stores a small sign-in token so
              you stay logged in between pages. This is strictly necessary for the site to work, so it doesn&apos;t need your
              consent. If we add analytics in future, we&apos;ll update this policy and ask first where the law requires it.
            </p>
          ),
        },
        {
          id: "complaints",
          heading: "Complaints",
          body: (
            <p>
              If you&apos;re unhappy with how we&apos;ve handled your information, please email {email} first so we can put it
              right. You also have the right to complain to the Information Commissioner&apos;s Office (ICO), the UK&apos;s data
              protection regulator, at <a href="https://ico.org.uk/make-a-complaint/" target="_blank" rel="noopener noreferrer">ico.org.uk</a> or
              on 0303 123 1113.
            </p>
          ),
        },
        {
          id: "changes",
          heading: "Changes to this policy",
          body: (
            <p>
              We&apos;ll update this policy when our services or the law change. The date at the top shows when it was last
              updated. If we make a significant change, we&apos;ll let account holders know by email.
            </p>
          ),
        },
      ]}
    />
  );
}
