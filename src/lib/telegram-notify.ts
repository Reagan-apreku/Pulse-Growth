/**
 * Telegram notification helper.
 *
 * Sends a Telegram message to the admin when a new paid order comes in.
 *
 * To enable, set these env vars:
 *   TELEGRAM_BOT_TOKEN=your-bot-token
 *   TELEGRAM_CHAT_ID=your-chat-id
 *
 * If not set, notifications are logged to console instead.
 */

import { Order, ResellerAccount } from "./types";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

export async function notifyAdminTelegram(order: Order): Promise<void> {
  const message = [
    `💰 *New Paid Order!*`,
    ``,
    `📋 Order: \`${order.id}\``,
    `📱 Platform: ${order.platform}`,
    `🛎️ Service: ${order.serviceName}`,
    `📊 Qty: ${order.quantity.toLocaleString()}`,
    `💵 Total: ₵${order.total.toFixed(2)}`,
    `🎯 Target: ${order.targetUrl}`,
    order.customerEmail ? `📧 Email: ${order.customerEmail}` : "",
    ``,
    `⚡ [Manage Orders](${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/admin/orders)`,
  ]
    .filter(Boolean)
    .join("\n");

  await sendTelegramMessage(message);
}

export async function notifyAdminNewReseller(reseller: ResellerAccount): Promise<void> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const message = [
    `🤝 *New Reseller Application!*`,
    ``,
    `👤 *Name:* ${reseller.name}`,
    `📧 *Email:* \`${reseller.email}\``,
    reseller.businessName ? `🏢 *Business:* ${reseller.businessName}` : "",
    reseller.phone ? `📞 *Phone:* ${reseller.phone}` : "",
    `⏳ *Status:* Pending Admin Approval`,
    ``,
    `⚡ [Approve Reseller in Admin](${baseUrl}/admin/resellers)`,
  ]
    .filter(Boolean)
    .join("\n");

  await sendTelegramMessage(message);
}

async function sendTelegramMessage(message: string): Promise<void> {
  if (!BOT_TOKEN || !CHAT_ID) {
    console.log("[Telegram Alert — not configured, logging instead]");
    console.log(message);
    return;
  }

  try {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message,
        parse_mode: "Markdown",
        disable_web_page_preview: true,
      }),
    });
    if (!res.ok) {
      console.error("Telegram notification failed:", await res.text());
    }
  } catch (err) {
    console.error("Telegram notification error:", err);
  }
}

