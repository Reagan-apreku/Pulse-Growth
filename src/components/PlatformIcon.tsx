import { Camera, Music2, PlayCircle, Send, ThumbsUp, AtSign, Headphones, Ghost } from "lucide-react";

// lucide-react dropped brand/logo marks, so each platform gets a generic
// glyph that gestures at its content type instead of a trademarked logo.
const MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Instagram: Camera,
  TikTok: Music2,
  YouTube: PlayCircle,
  Telegram: Send,
  Facebook: ThumbsUp,
  "X (Twitter)": AtSign,
  Spotify: Headphones,
  Snapchat: Ghost,
};

export function PlatformIcon({ platform, className }: { platform: string; className?: string }) {
  const Icon = MAP[platform] || Camera;
  return <Icon className={className} />;
}
