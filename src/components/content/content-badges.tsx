import { Badge } from "@/components/ui/badge";
import {
  ContentPlatform,
  ContentType,
  CONTENT_PLATFORM_LABELS,
  CONTENT_TYPE_LABELS,
} from "@/lib/types";
import { cn } from "@/lib/utils";

const platformStyles: Record<ContentPlatform, string> = {
  INSTAGRAM:
    "bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300",
  YOUTUBE: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
  FACEBOOK: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  LINKEDIN:
    "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300",
  TWITTER:
    "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  TIKTOK:
    "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
  OTHER:
    "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
};

export function PlatformBadge({ platform }: { platform: ContentPlatform }) {
  return (
    <Badge
      variant="outline"
      className={cn("border-transparent", platformStyles[platform])}
    >
      {CONTENT_PLATFORM_LABELS[platform]}
    </Badge>
  );
}

export function TypeBadge({ type }: { type: ContentType }) {
  return <Badge variant="secondary">{CONTENT_TYPE_LABELS[type]}</Badge>;
}
