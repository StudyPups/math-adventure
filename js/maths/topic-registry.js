import { primeNumbers } from "./topics/prime-numbers.js";

export const ALL_TOPICS = [primeNumbers];

export function getTopicById(id) {
  return ALL_TOPICS.find((topic) => topic.id === id) || null;
}

export function getTopicsForYear(yearLevel) {
  return ALL_TOPICS.filter((topic) => topic.yearLevel === yearLevel);
}

export function getDefaultPracticeTopics() {
  return getTopicsForYear(5);
}
