import type { JDStructure, ResumeStructure, MatchAnalysis, InterviewQuestions } from "@/lib/schemas";

const INPUT_KEY = "jd2story:input";
const RESULT_KEY = "jd2story:result";

export type InputPayload = {
  jd: string;
  title: string;
  company: string;
  direction: string;
  resume: string;
};

export type ResultPayload = {
  jd?: JDStructure;
  resume?: ResumeStructure;
  match?: MatchAnalysis;
  questions?: InterviewQuestions;
};

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function read<T>(key: string): T | null {
  if (!isBrowser()) return null;
  const raw = window.sessionStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function write<T>(key: string, value: T): void {
  if (!isBrowser()) return;
  window.sessionStorage.setItem(key, JSON.stringify(value));
}

function clear(key: string): void {
  if (!isBrowser()) return;
  window.sessionStorage.removeItem(key);
}

export const inputStore = {
  load: () => read<InputPayload>(INPUT_KEY),
  save: (v: InputPayload) => write(INPUT_KEY, v),
  clear: () => clear(INPUT_KEY),
};

export const resultStore = {
  load: () => read<ResultPayload>(RESULT_KEY),
  save: (v: ResultPayload) => write(RESULT_KEY, v),
  clear: () => clear(RESULT_KEY),
};
