import { Service } from "./types";

/**
 * All prices are in GHS (₵).
 */
export const SERVICES: Service[] = [
  {
    platform: "Instagram",
    icon: "instagram",
    name: "Instagram",
    description: "Followers, Likes, Views",
    startingPrice: 35,
    serviceTypes: [
      { label: "Followers", ratePer1k: 200, minOrder: 500 },
      { label: "Post Likes", ratePer1k: 70, minOrder: 500 },
      { label: "Video Views", ratePer1k: 90, minOrder: 500 },
    ],
  },
  {
    platform: "TikTok",
    icon: "tiktok",
    name: "TikTok",
    description: "Views, Likes, Followers, Shares & Saves",
    startingPrice: 30,
    serviceTypes: [
      { label: "Video Views", ratePer1k: 150, minOrder: 500 },
      { label: "Followers", ratePer1k: 200, minOrder: 500 },
      { label: "Likes", ratePer1k: 160, minOrder: 500 },
      { label: "Shares", ratePer1k: 60, minOrder: 500 },
      { label: "Saves", ratePer1k: 80, minOrder: 500 },
    ],
  },
  {
    platform: "YouTube",
    icon: "youtube",
    name: "YouTube",
    description: "Subscribers, Views, Watch Hours",
    startingPrice: 30,
    serviceTypes: [
      { label: "Subscribers", ratePer1k: 1000, minOrder: 500 },
      { label: "Watch Hours", ratePer1k: 1500, minOrder: 1000 },
      { label: "Likes", ratePer1k: 300, minOrder: 500 },
      { label: "Video Views", ratePer1k: 200, minOrder: 500 },
    ],
  },
  {
    platform: "Telegram",
    icon: "telegram",
    name: "Telegram",
    description: "Members, Post Views, Reactions",
    startingPrice: 25,
    serviceTypes: [
      { label: "Channel Members", ratePer1k: 120, minOrder: 500 },
      { label: "Post Views", ratePer1k: 50, minOrder: 500 },
      { label: "Reactions", ratePer1k: 65, minOrder: 500 },
    ],
  },
  {
    platform: "Facebook",
    icon: "facebook",
    name: "Facebook",
    description: "Likes, Followers, Views",
    startingPrice: 30,
    serviceTypes: [
      { label: "Page Likes", ratePer1k: 100, minOrder: 500 },
      { label: "Page Followers", ratePer1k: 300, minOrder: 500 },
      { label: "Profile Followers", ratePer1k: 200, minOrder: 500 },
      { label: "Post Likes", ratePer1k: 200, minOrder: 500 },
      { label: "Video Views", ratePer1k: 60, minOrder: 500 },
    ],
  },
  {
    platform: "X (Twitter)",
    icon: "x",
    name: "X (Twitter)",
    description: "Followers, Retweets, Likes",
    startingPrice: 115,
    serviceTypes: [
      { label: "Followers", ratePer1k: 1000, minOrder: 500 },
      { label: "Retweets", ratePer1k: 500, minOrder: 500 },
      { label: "Likes", ratePer1k: 230, minOrder: 500 },
    ],
  },
  {
    platform: "Spotify",
    icon: "spotify",
    name: "Spotify",
    description: "Followers, Plays",
    startingPrice: 50,
    serviceTypes: [
      { label: "Followers", ratePer1k: 100, minOrder: 500 },
      { label: "Plays", ratePer1k: 120, minOrder: 500 },
      { label: "Premium Plays", ratePer1k: 200, minOrder: 500 },
      { label: "Playlist Plays", ratePer1k: 300, minOrder: 500 },
    ],
  },
  {
    platform: "Snapchat",
    icon: "snapchat",
    name: "Snapchat",
    description: "Followers, Views, Likes",
    startingPrice: 125,
    serviceTypes: [
      { label: "Followers", ratePer1k: 750, minOrder: 500 },
      { label: "All Story Views", ratePer1k: 250, minOrder: 500 },
      { label: "Video Likes", ratePer1k: 350, minOrder: 500 },
      { label: "Spotlight Likes + Views", ratePer1k: 300, minOrder: 500 },
    ],
  },
];

export const PAYMENT_METHODS = [
  {
    id: "paystack" as const,
    label: "Pay with Paystack",
    hint: "MoMo, Card, Bank Transfer",
  },
];

export function generateOrderId(): string {
  const n = Math.floor(10000 + Math.random() * 89999);
  return `SMM-${n}`;
}

/** Format a GHS amount for display. */
export function formatGHS(amount: number): string {
  return `₵${amount.toFixed(2)}`;
}
