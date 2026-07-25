import { Badge } from "@/components/ui/badge";
import {
  ContentPlatform,
  ContentType,
  ContentStage,
  CONTENT_PLATFORM_LABELS,
  CONTENT_TYPE_LABELS,
  CONTENT_STAGE_LABELS,
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

const stageStyles: Record<ContentStage, string> = {
  IDEA: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  SCRIPT: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  SHOOT_PLANNED:
    "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  SHOOTING:
    "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  EDITING: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  CLIENT_REVIEW:
    "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
  APPROVED:
    "bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300",
  SCHEDULED:
    "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300",
  PUBLISHED:
    "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
};

export function StageBadge({ stage }: { stage: ContentStage }) {
  return (
    <Badge variant="outline" className={cn("border-transparent", stageStyles[stage])}>
      {CONTENT_STAGE_LABELS[stage]}
    </Badge>
  );
}
