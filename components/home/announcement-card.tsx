"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ANNOUNCEMENTS } from "@/constants/data";
import { ChevronLeft, ChevronRight, Megaphone } from "lucide-react";
import { useState } from "react";
import { slideLeftContent } from "@/lib/motion";
import { useI18n } from "@/components/i18n/use-i18n";

const ANNOUNCEMENT_COPY = [
  { title: "home.announcement.welcomeToRtlauncher", content: "home.announcement.aModernMinecraftLauncherWithAPolishedSmoothExperience" },
  { title: "home.announcement.systemUpdate", content: "home.announcement.weRecentlyReleasedNewFeaturesAndImprovedTheExperience" },
  { title: "home.announcement.tips", content: "home.announcement.readTheDocumentationToGetTheMostFromThe" },
] as const;

export function AnnouncementCard({ compact = false }: { compact?: boolean }) {
  const { t } = useI18n();
  const [current, setCurrent] = useState(0);
  const announcement = ANNOUNCEMENT_COPY[current] ?? ANNOUNCEMENT_COPY[0];

  const prev = () =>
    setCurrent((i) => (i - 1 + ANNOUNCEMENTS.length) % ANNOUNCEMENTS.length);
  const next = () =>
    setCurrent((i) => (i + 1) % ANNOUNCEMENTS.length);

  if (compact) {
    return (
      <Card size="sm" className="flex h-full w-full flex-col shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-1.5 text-sm">
            <Megaphone className="size-3.5 text-primary/70" />
            {t("home.announcement.announcements")}
          </CardTitle>
          <CardDescription className="text-xs">{t("home.announcement.latestNews")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col items-center justify-between gap-2.5 pt-0">
          <div className="relative flex w-full flex-1 items-center overflow-hidden rounded-xl bg-muted/40 p-4 ring-1 ring-border/60">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute right-3 top-2 select-none text-3xl font-semibold tabular-nums text-foreground/[0.06]"
            >
              {String(current + 1).padStart(2, "0")}
            </span>
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                variants={slideLeftContent}
                initial="initial"
                animate="animate"
                exit="exit"
                className="relative w-full"
              >
                <h3 className="text-sm font-medium text-balance">{t(announcement.title)}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-pretty text-muted-foreground">
                  {t(announcement.content)}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon-sm"
              onClick={prev}
              aria-label={t("home.announcement.announcements")}
            >
              <ChevronLeft className="size-3" />
            </Button>
            <div className="flex items-center gap-1">
              {ANNOUNCEMENTS.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setCurrent(index)}
                  aria-label={`${index + 1} / ${ANNOUNCEMENTS.length}`}
                  aria-current={index === current}
                  className={`size-1.5 rounded-full transition-colors ${
                    index === current
                      ? "bg-primary"
                      : "bg-muted-foreground/30 hover:bg-muted-foreground/60"
                  }`}
                />
              ))}
            </div>
            <Button
              variant="outline"
              size="icon-sm"
              onClick={next}
              aria-label={t("home.announcement.announcements")}
            >
              <ChevronRight className="size-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex aspect-square flex-col shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Megaphone className="size-4 text-primary/70" />
          {t("home.announcement.announcements")}
        </CardTitle>
        <CardDescription className="text-xs">{t("home.announcement.latestNewsAndUpdates")}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col items-center justify-between gap-3 pt-0">
        <div className="relative flex w-full flex-1 items-center overflow-hidden rounded-xl bg-muted/40 p-4 ring-1 ring-border/60">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute right-4 top-3 select-none text-4xl font-semibold tabular-nums text-foreground/[0.06]"
          >
            {String(current + 1).padStart(2, "0")}
          </span>
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              variants={slideLeftContent}
              initial="initial"
              animate="animate"
              exit="exit"
              className="relative w-full"
            >
              <h3 className="text-sm font-medium text-balance">{t(announcement.title)}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-pretty text-muted-foreground">
                {t(announcement.content)}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={prev}
            aria-label={t("home.announcement.announcements")}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <div className="flex items-center gap-1.5">
            {ANNOUNCEMENTS.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setCurrent(index)}
                aria-label={`${index + 1} / ${ANNOUNCEMENTS.length}`}
                aria-current={index === current}
                className={`size-2 rounded-full transition-colors ${
                  index === current
                    ? "bg-primary"
                    : "bg-muted-foreground/30 hover:bg-muted-foreground/60"
                }`}
              />
            ))}
          </div>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={next}
            aria-label={t("home.announcement.announcements")}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
