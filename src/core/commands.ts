import { getPhrase } from '../utils';
import type { CommandsType } from '../types';

export const commands: CommandsType = {
  start: { command: 'start', text: '', description: getPhrase('commandDescription')('start') },
  stop: { command: 'stop', text: '', description: getPhrase('commandDescription')('stop') },
  help: { command: 'help', text: '', description: getPhrase('commandDescription')('help') },
  cat: {
    command: 'cat',
    text: getPhrase('buttonLabel')('cat'),
    description: getPhrase('commandDescription')('cat'),
  },
  flags: {
    command: 'flag_connect',
    text: getPhrase('buttonLabel')('flags'),
    description: getPhrase('commandDescription')('flags'),
  },
  quote: {
    command: 'quote',
    text: getPhrase('buttonLabel')('quote'),
    description: getPhrase('commandDescription')('quote'),
  },
  advice: { command: 'advice', text: getPhrase('buttonLabel')('advice'), description: '' },
  location: {
    command: '',
    text: getPhrase('buttonLabel')('location'),
    description: getPhrase('commandDescription')('location'),
  },
};
