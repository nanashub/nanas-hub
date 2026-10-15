import type { Metadata } from "next";
import Link from "next/link";
import { CONTACT_EMAIL, LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Terms of Use | Nana's Hub",
  description: "The rules for using Nana's Hub as a client or a beauty professional.",
};

const email = <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>;

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Use"
      updated="15 October 2026"
      intro={
        <>
          <p>
            These terms are the rules for using Nana&apos;s Hub (nanashub.co.uk). Nana&apos;s Hub is run by Bethany Boatin
            (&quot;we&quot;, &quot;us&quot;). By creating an account or using the site, you agree to these terms. Please also
            read our <Link href="/privacy" className="text-[#B8746E] font-semibold hover:underline">Privacy Policy</Link>.
          </p>
        </>
      }
      sections={[
        {
          id: "what-we-do",
          heading: "What Nana's Hub is",
          body: (
            <>
              <p>
                Nana&apos;s Hub is a directory that helps clients find Black hair, beauty and grooming professionals
                (&quot;pros&quot;) across the UK. Pros create profiles showing their work, services and prices.
              </p>
              <p>
                <strong>We aren&apos;t part of your booking.</strong> When you book, you book directly with the pro, usually
                through their own booking site or Instagram. The agreement for the treatment, including price, deposits,
                cancellations and refunds, is between you and the pro. We don&apos;t take payments for treatments.
              </p>
            </>
          ),
        },
        {
          id: "who-can-join",
          heading: "Who can join",
          body: (
            <ul>
              <li>You must be <strong>16 or over</strong> to create a client account.</li>
              <li>You must be <strong>18 or over</strong> to create a professional account.</li>
              <li>You must give accurate information and keep your login details private. You&apos;re responsible for anything done through your account.</li>
              <li>One person, one account, unless we agree otherwise.</li>
            </ul>
          ),
        },
        {
          id: "pros",
          heading: "If you're a professional",
          body: (
            <>
              <p>By listing yourself on Nana&apos;s Hub, you confirm that:</p>
              <ul>
                <li>you&apos;re qualified and trained for the services you list, and hold any licences, registrations and insurance the law or your local council requires</li>
                <li>you follow health, safety and hygiene rules, including patch tests and consultations where needed</li>
                <li>you check clients meet any age requirements for your treatments, for example for some lash, brow, skin and aesthetic treatments</li>
                <li>your prices, services, location and availability are accurate and kept up to date</li>
                <li>you own, or have permission to use, every photo and video you upload, including consent from anyone shown in them</li>
                <li>you&apos;re responsible for your own bookings, payments, tax and customer service</li>
              </ul>
              <p>
                <strong>Plans:</strong> the Starter plan is free. If we introduce paid plans (such as Pro), we&apos;ll tell you
                the price and what&apos;s included before you&apos;re ever charged, and you&apos;ll choose whether to sign up.
              </p>
            </>
          ),
        },
        {
          id: "clients",
          heading: "If you're a client",
          body: (
            <ul>
              <li>Read the pro&apos;s profile and their own booking terms before you book.</li>
              <li>Tell the pro about allergies, sensitivities or medical conditions that could affect your treatment.</li>
              <li>Prices on Nana&apos;s Hub are a guide. The pro confirms the final price when you book.</li>
              <li>Raise any problem with a treatment with the pro first. If you think a pro is breaking these terms, email {email}.</li>
            </ul>
          ),
        },
        {
          id: "content",
          heading: "What you post",
          body: (
            <>
              <p>You keep ownership of what you post. By posting it, you let us show it on Nana&apos;s Hub and use it to promote the site, for example sharing a pro&apos;s work on our social media with credit. You can ask us to stop at any time.</p>
              <p>You must not post anything that:</p>
              <ul>
                <li>is false, misleading or impersonates someone else</li>
                <li>is offensive, hateful, discriminatory, sexual or harassing</li>
                <li>shows someone without their permission, or shares other people&apos;s personal information</li>
                <li>copies someone else&apos;s work or breaks the law</li>
                <li>is spam, or tries to harm or break the site</li>
              </ul>
              <p>We may remove content that breaks these rules.</p>
            </>
          ),
        },
        {
          id: "reviews",
          heading: "Ratings and reviews",
          body: (
            <p>
              Reviews must be honest and based on a real experience. Pros must not write reviews of themselves, or pay or
              pressure anyone for reviews. We may remove reviews that break these rules.
            </p>
          ),
        },
        {
          id: "suspension",
          heading: "Suspending or closing accounts",
          body: (
            <>
              <p>
                You can delete your account at any time from <Link href="/account">My account</Link>.
              </p>
              <p>
                We may suspend or remove an account or profile if it breaks these terms, puts others at risk, or if we&apos;re
                required to by law. Where it&apos;s fair and safe to, we&apos;ll tell you why first and give you a chance to
                put things right.
              </p>
            </>
          ),
        },
        {
          id: "liability",
          heading: "Our responsibility to you",
          body: (
            <>
              <p>
                We work hard to keep Nana&apos;s Hub accurate and running, but we can&apos;t promise it will always be
                available or error-free. We don&apos;t check every pro&apos;s qualifications, and a profile on Nana&apos;s Hub
                isn&apos;t a recommendation or guarantee of their work.
              </p>
              <p>
                Because we&apos;re not part of your booking, we aren&apos;t responsible for the treatment itself, or for any
                loss caused by a pro or client. Nothing in these terms limits our responsibility where it would be unlawful
                to do so, including for death or personal injury caused by our negligence, fraud, or your legal rights as a
                consumer.
              </p>
            </>
          ),
        },
        {
          id: "changes",
          heading: "Changes to these terms",
          body: (
            <p>
              We may update these terms as Nana&apos;s Hub grows. The date at the top shows the latest version. If we make
              a significant change, we&apos;ll let account holders know by email before it takes effect.
            </p>
          ),
        },
        {
          id: "law",
          heading: "Law",
          body: (
            <p>
              These terms are governed by the law of England and Wales. If you live in Scotland or Northern Ireland, you can
              also bring proceedings in your local courts. If you have a problem, please email {email} first. Most things
              can be sorted out quickly.
            </p>
          ),
        },
      ]}
    />
  );
}
