import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";

const TITLES: Record<string, string> = {
  terms: "Terms of Service",
  privacy: "Privacy Policy",
  refunds: "Refund Policy",
  "momo-guide": "Mobile Money Payment Guide",
};

export default async function LegalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const title = TITLES[slug] || "Document";

  return (
    <div className="flex min-h-screen flex-col">
      <NavBar />
      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-16 sm:px-8">
        <h1 className="font-display text-3xl font-semibold">{title}</h1>
        {slug === "momo-guide" && (
          <div className="mt-8 space-y-6 text-ink-soft">
            <p>
              Paying for social growth services with Mobile Money (MTN MoMo, Telecel Cash, or AT Money) is completely seamless through our Paystack integration.
            </p>
            <h2 className="font-display text-xl font-semibold text-ink">Step-by-step instructions</h2>
            <ol className="ml-5 list-decimal space-y-3">
              <li>Configure your order (select platform, service, and quantity) and enter your target link.</li>
              <li>Click <strong>"Pay & place order"</strong>. You will be redirected to the secure Paystack checkout.</li>
              <li>Select <strong>"Mobile Money"</strong> from the payment options.</li>
              <li>Choose your network (MTN, Telecel, or AT) and enter your Mobile Money number.</li>
              <li>Click <strong>"Confirm"</strong>. A payment prompt will automatically appear on your phone.</li>
              <li>Enter your PIN on your phone to authorize the transaction.</li>
            </ol>
            <p className="mt-4 rounded-xl border border-line bg-canvas p-4 text-sm">
              <strong className="text-ink">Note:</strong> Once you authorize the payment on your phone, wait a few seconds on the checkout page. You will automatically be redirected back to Pulse and your order tracking ID will be generated instantly.
            </p>
          </div>
        )}

        {slug === "terms" && (
          <div className="mt-8 space-y-6 text-ink-soft">
            <h2 className="font-display text-xl font-semibold text-ink">1. Service Usage</h2>
            <p>
              By placing an order with Pulse, you automatically accept all the below-listed terms of service whether you read them or not. We reserve the right to change these terms of service without notice. You are expected to read all terms of service before placing an order to ensure you are up to date with any changes or any future changes.
            </p>
            <h2 className="font-display text-xl font-semibold text-ink">2. Delivery Expectations</h2>
            <p>
              Pulse does not guarantee a delivery time for any services. We offer our best estimation for when the order will be delivered. This is only an estimation and Pulse will not refund orders that are processing if you feel they are taking too long.
            </p>
            <h2 className="font-display text-xl font-semibold text-ink">3. Account Status</h2>
            <p>
              Your social media account <strong>MUST</strong> be set to public during the entire delivery process. Changing your account to private, changing your username, or deleting the post while an order is running will halt delivery and void your right to a refund.
            </p>
            <h2 className="font-display text-xl font-semibold text-ink">4. Liability</h2>
            <p>
              Pulse is in no way liable for any account suspension or picture deletion done by Instagram, Twitter, Facebook, YouTube, TikTok, or other Social Media platforms.
            </p>
          </div>
        )}

        {slug === "privacy" && (
          <div className="mt-8 space-y-6 text-ink-soft">
            <h2 className="font-display text-xl font-semibold text-ink">1. Data Collection</h2>
            <p>
              We value your privacy. We only collect the necessary information required to process your order, which includes your email address (for order updates and receipts) and the public link/username to the target social media account.
            </p>
            <h2 className="font-display text-xl font-semibold text-ink">2. No Passwords Required</h2>
            <p>
              <strong>We will NEVER ask for your password.</strong> All of our services are delivered externally to public accounts. If anyone claiming to be from Pulse asks for your password, do not provide it.
            </p>
            <h2 className="font-display text-xl font-semibold text-ink">3. Data Sharing</h2>
            <p>
              Your personal information is kept strictly confidential. We do not sell, rent, or distribute your email or personal details to any third-party marketing companies. Your data is solely used for fulfillment and customer support regarding your specific orders.
            </p>
          </div>
        )}

        {slug === "refunds" && (
          <div className="mt-8 space-y-6 text-ink-soft">
            <h2 className="font-display text-xl font-semibold text-ink">1. Non-Delivery</h2>
            <p>
              If your order cannot be started within 72 hours of payment, you are entitled to a full refund. Please contact our WhatsApp support team with your order ID to request a manual refund.
            </p>
            <h2 className="font-display text-xl font-semibold text-ink">2. Partial Drops & Refills</h2>
            <p>
              Due to the nature of social media platforms updating their algorithms, some drop-off in followers or engagement may occur. We offer a <strong>30-day refill guarantee</strong> on most services. If numbers drop, contact support for a free refill. We do not issue cash refunds for partial drops.
            </p>
            <h2 className="font-display text-xl font-semibold text-ink">3. Voided Guarantees</h2>
            <p>
              Refunds will <strong>NOT</strong> be issued under the following conditions:
            </p>
            <ul className="ml-5 list-disc space-y-2">
              <li>You change your account to private or change your username while the order is active.</li>
              <li>You delete the target post/video before delivery is complete.</li>
              <li>You place multiple orders for the exact same link at the exact same time (wait for the first to finish).</li>
            </ul>
          </div>
        )}

        {!["momo-guide", "terms", "privacy", "refunds"].includes(slug) && (
          <p className="mt-4 text-ink-soft">
            Page not found.
          </p>
        )}
      </main>
      <Footer />
    </div>
  );
}
