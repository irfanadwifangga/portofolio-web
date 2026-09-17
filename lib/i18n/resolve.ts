import type { DeepDive, Project } from "@/lib/content";
import { formatPeriod } from "@/lib/i18n/format";
import type { Locale } from "@/lib/i18n/locales";

/*
 * Localised content flattened to one language.
 *
 * Server components call these before handing data to a client component, so a
 * client chunk only ever carries the strings of the page it renders.
 */

export interface ResolvedProject {
  name: string;
  image: string;
  role: string;
  period: string;
  org: string;
  summary: string;
}

export function resolveProject(project: Project, locale: Locale): ResolvedProject {
  return {
    name: project.name,
    image: project.image,
    role: project.role[locale],
    period: formatPeriod(project.period, locale),
    org: project.org[locale],
    summary: project.summary[locale]
  };
}

export interface ResolvedDeepDive {
  title: string;
  project: string;
  problem: string;
  approach: string[];
  stack: string[];
}

export function resolveDeepDive(dive: DeepDive, locale: Locale): ResolvedDeepDive {
  return {
    title: dive.title[locale],
    project: dive.project,
    problem: dive.problem[locale],
    approach: dive.approach[locale],
    stack: dive.stack
  };
}
