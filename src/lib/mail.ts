import nodemailer from "nodemailer";
import { Order, ResellerAccount } from "./types";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "pulsegrowthgh@gmail.com";
const SMTP_HOST = process.env.SMTP_HOST || "";
const SMTP_PORT = parseInt(process.env.SMTP_PORT || "465", 10);
const SMTP_USER = process.env.SMTP_USER || "";
const SMTP_PASS = process.env.SMTP_PASS || "";
const SMTP_FROM = process.env.SMTP_FROM || '"Pulse Growth" <noreply@pulsegh.com>';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://www.pulsegh.com";

/**
 * Singleton Nodemailer transport.
 * Will not attempt to send if credentials are not configured.
 */
let transporter: nodemailer.Transporter | null = null;
if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
}

/** Helper to send HTML emails safely. */
async function sendMail(to: string, subject: string, html: string) {
  if (!transporter) {
    console.warn("SMTP credentials not configured. Skipping email to:", to);
    return false;
  }
  try {
    await transporter.sendMail({
      from: SMTP_FROM,
      to,
      subject,
      html,
    });
    return true;
  } catch (error) {
    console.error("Failed to send email:", error);
    return false;
  }
}

/** Sends a beautifully formatted receipt to the customer upon successful payment. */
export async function sendCustomerReceipt(order: Order) {
  if (!order.customerEmail) return false;

  const subject = `Your Order Receipt from Pulse - ${order.id}`;
  
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 12px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #111; font-size: 24px; margin: 0;">Payment Successful!</h1>
        <p style="color: #666; font-size: 16px; margin-top: 8px;">Thank you for your order.</p>
      </div>
      
      <div style="background-color: #fff; padding: 24px; border-radius: 8px; border: 1px solid #eaeaea;">
        <h2 style="font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #888; margin-top: 0;">Order Summary</h2>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
          <tr style="border-bottom: 1px solid #eaeaea;">
            <td style="padding: 12px 0; color: #444; font-weight: 500;">Order ID</td>
            <td style="padding: 12px 0; text-align: right; color: #111; font-weight: 600;">${order.id}</td>
          </tr>
          <tr style="border-bottom: 1px solid #eaeaea;">
            <td style="padding: 12px 0; color: #444; font-weight: 500;">Service</td>
            <td style="padding: 12px 0; text-align: right; color: #111;">${order.serviceName}</td>
          </tr>
          <tr style="border-bottom: 1px solid #eaeaea;">
            <td style="padding: 12px 0; color: #444; font-weight: 500;">Quantity</td>
            <td style="padding: 12px 0; text-align: right; color: #111;">${order.quantity.toLocaleString()}</td>
          </tr>
          <tr style="border-bottom: 1px solid #eaeaea;">
            <td style="padding: 12px 0; color: #444; font-weight: 500;">Target URL</td>
            <td style="padding: 12px 0; text-align: right; color: #111; word-break: break-all;">${order.targetUrl}</td>
          </tr>
          <tr>
            <td style="padding: 12px 0; color: #444; font-weight: 500;">Total Paid</td>
            <td style="padding: 12px 0; text-align: right; color: #2ecc71; font-weight: 700;">₵${order.total.toFixed(2)}</td>
          </tr>
        </table>
        
        <div style="text-align: center; margin-top: 32px;">
          <a href="${BASE_URL}/track?id=${encodeURIComponent(order.id)}" style="display: inline-block; background-color: #111; color: #fff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px;">
            Track Your Order
          </a>
        </div>
      </div>
      
      <p style="text-align: center; color: #888; font-size: 12px; margin-top: 24px;">
        If you have any questions, please reply to this email.<br/>
        &copy; ${new Date().getFullYear()} Pulse Social Growth.
      </p>
    </div>
  `;

  return sendMail(order.customerEmail, subject, html);
}

/** Alerts the admin about a new successful order payment. */
export async function sendAdminOrderAlert(order: Order) {
  const subject = `🎉 New Paid Order - ${order.id} (₵${order.total.toFixed(2)})`;
  
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; padding: 20px;">
      <h2 style="color: #2ecc71;">New Paid Order! 🚀</h2>
      <p>A customer just completed payment for an order.</p>
      <ul style="line-height: 1.6; padding-left: 20px; color: #333;">
        <li><strong>Order ID:</strong> ${order.id}</li>
        <li><strong>Amount:</strong> ₵${order.total.toFixed(2)}</li>
        <li><strong>Service:</strong> ${order.platform} - ${order.serviceName}</li>
        <li><strong>Quantity:</strong> ${order.quantity.toLocaleString()}</li>
        <li><strong>Target:</strong> <a href="${order.targetUrl}">${order.targetUrl}</a></li>
        <li><strong>Customer:</strong> ${order.customerEmail || "N/A"} ${order.customerPhone ? "(" + order.customerPhone + ")" : ""}</li>
        <li><strong>Reseller Order:</strong> ${order.isResellerOrder ? 'Yes' : 'No'}</li>
      </ul>
      <p style="margin-top: 20px;">
        <a href="${BASE_URL}/admin/orders" style="display: inline-block; background: #111; color: #fff; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: bold;">
          View in Admin Dashboard
        </a>
      </p>
    </div>
  `;

  return sendMail(ADMIN_EMAIL, subject, html);
}

/** Alerts the admin when a new reseller signs up. */
export async function sendAdminResellerAlert(reseller: ResellerAccount) {
  const subject = `🚀 New Reseller Signup - ${reseller.name}`;
  
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; padding: 20px;">
      <h2 style="color: #3498db;">New Reseller Registration! 🤝</h2>
      <p>A new user has just registered for a reseller account.</p>
      <ul style="line-height: 1.6; padding-left: 20px; color: #333;">
        <li><strong>Name:</strong> ${reseller.name}</li>
        <li><strong>Business:</strong> ${reseller.businessName || "N/A"}</li>
        <li><strong>Email:</strong> ${reseller.email}</li>
        <li><strong>Phone:</strong> ${reseller.phone || "N/A"}</li>
      </ul>
      <p style="margin-top: 20px;">
        <a href="${BASE_URL}/admin/resellers" style="display: inline-block; background: #111; color: #fff; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: bold;">
          Review Application
        </a>
      </p>
    </div>
  `;

  return sendMail(ADMIN_EMAIL, subject, html);
}
