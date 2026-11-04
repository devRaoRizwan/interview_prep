// Curated interview coding challenges, starter code, expected output, and interviewer deep-dive questions
// Decoupled modular topic architecture for Python (1-51) and Django (1-54)

import { ALL_PYTHON_TOPICS } from './pythonTopics/index.js';
import { ALL_DJANGO_TOPICS } from './djangoTopics/index.js';

export const SANDBOX_LINKS = {
  python: 'https://onecompiler.com/python',
  django: 'https://docs.djangoproject.com/en/stable/',
  postgres: 'https://onecompiler.com/postgresql',
  pythonDocs: 'https://docs.python.org/3/',
};

function getTopic(trackId, question) {
  if (!question) return null;
  const qId = question.id;
  const topicMap = trackId === 'python' ? ALL_PYTHON_TOPICS : ALL_DJANGO_TOPICS;
  return topicMap[qId] || null;
}

export function getQuestionChallenge(trackId, question) {
  const topic = getTopic(trackId, question);
  if (topic && topic.challenge) {
    return topic.challenge;
  }
  return null;
}

export function getQuestionScriptData(trackId, question) {
  const topic = getTopic(trackId, question);
  if (topic && topic.scriptData) {
    return topic.scriptData;
  }
  return null;
}

export function getQuestionDocSpecs(trackId, question) {
  const topic = getTopic(trackId, question);
  if (topic && topic.docSpecs) {
    return topic.docSpecs;
  }
  return null;
}
