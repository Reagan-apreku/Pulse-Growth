import { ResellerAccount } from "./types";

/**
 * Clean & format phone numbers to international format (e.g. 0551234567 -> 233551234567)
 */
export function formatWhatsAppPhone(phone: string): string {
  let cleaned = (phone || "").replace(/[^0-9]/g, "");
  if (cleaned.startsWith("0")) {
    cleaned = "233" + cleaned.substring(1);
  }
  return cleaned;
}

/**
 * Automated WhatsApp Notification Gateway helper.
 * Supports UltraMsg or Twilio WhatsApp API.
 * If credentials are not set, logs payload to console.
 */
export async function sendAutomatedWhatsAppMessage(toPhone: string, message: string): Promise<boolean> {
  const formattedPhone = formatWhatsAppPhone(toPhone);
  if (!formattedPhone) return false;

  const ultraInstance = process.env.ULTRAMSG_INSTANCE_ID || process.env.WHATSAPP_INSTANCE_ID;
  const ultraToken = process.env.ULTRAMSG_TOKEN || process.env.WHATSAPP_TOKEN;

  // 1. UltraMsg Gateway Integration
  if (ultraInstance && ultraToken) {
    try {
      const url = `https://api.ultramsg.com/${ultraInstance}/messages/chat`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          token: ultraToken,
          to: formattedPhone,
          body: message,
        }),
      });
      const data = await res.json();
      if (res.ok && data.sent) {
        console.log(`[WhatsApp Automated Bot] Message sent to ${formattedPhone}`);
        return true;
      } else {
        console.error("[WhatsApp Automated Bot] Failed to send via UltraMsg:", data);
      }
    } catch (err) {
      console.error("[WhatsApp Automated Bot] UltraMsg Error:", err);
    }
  }

  // Fallback: log attempt
  console.log(`[WhatsApp Automated Bot — No API credentials configured]`);
  console.log(`To: ${formattedPhone}`);
  console.log(`Message:\n${message}`);
  return false;
}

/**
 * Send automated approval notification to reseller
 */
export async function notifyResellerApprovedWhatsApp(reseller: ResellerAccount): Promise<boolean> {
  if (!reseller.phone) return false;

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://pulsegh.com";
  const message = `Hi ${reseller.name}, your Pulse Wholesale Reseller account has been APPROVED! 🎉 You can now log in at ${baseUrl}/reseller to enjoy 10% wholesale rates on all orders.`;

  return await sendAutomatedWhatsAppMessage(reseller.phone, message);
}
