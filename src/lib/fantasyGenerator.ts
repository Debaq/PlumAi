import i18n from '@/i18n';
import data from '@/data/fantasyGenerator.json';

type Lang = 'en' | 'es';

function getLang(): Lang {
  const lang = i18n.language;
  return lang === 'es' ? 'es' : 'en';
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export interface RandomCharacterData {
  name: string;
  role: 'protagonist' | 'antagonist' | 'secondary' | 'supporting';
  physicalDescription: string;
  personality: string;
  history: string;
  notes: string;
}

export interface RandomLocationData {
  name: string;
  type: string;
  description: string;
  significance: string;
  notes: string;
}

export function generateRandomCharacter(): RandomCharacterData {
  const lang = getLang();
  const c = data[lang].character;

  const physicalDescription = [
    pickRandom(c.physicalDescription.build),
    pickRandom(c.physicalDescription.face),
    pickRandom(c.physicalDescription.hair),
    pickRandom(c.physicalDescription.distinctive),
  ].join(' ');

  const personality = [
    pickRandom(c.personality.core),
    pickRandom(c.personality.quirk),
    pickRandom(c.personality.flaw),
  ].join(' ');

  const history = [
    pickRandom(c.history.origin),
    pickRandom(c.history.turningPoint),
    pickRandom(c.history.motivation),
  ].join(' ');

  return {
    name: pickRandom(c.names),
    role: pickRandom(c.roles) as RandomCharacterData['role'],
    physicalDescription,
    personality,
    history,
    notes: pickRandom(c.notes),
  };
}

export function generateRandomLocation(): RandomLocationData {
  const lang = getLang();
  const l = data[lang].location;

  const description = [
    pickRandom(l.description.atmosphere),
    pickRandom(l.description.feature),
    pickRandom(l.description.detail),
  ].join(' ');

  const significance = [
    pickRandom(l.significance.narrative),
    pickRandom(l.significance.function),
  ].join(' ');

  return {
    name: pickRandom(l.names),
    type: pickRandom(l.types),
    description,
    significance,
    notes: pickRandom(l.notes),
  };
}
