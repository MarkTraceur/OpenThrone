import type { Unit } from '@/types/typings';

export const UnitTypes: Unit[] = [
  {
    name: 'Citizen',
    type: 'CITIZEN',
    level: 1,
    bonus: 0,
    cost: 0,
    fortLevel: 1,
    hp: 10,
  },
  {
    name: 'Worker',
    type: 'WORKER',
    level: 1,
    bonus: 65,
    cost: 2000,
    fortLevel: 1,
    hp: 20,
  },
  {
    name: 'Soldier',
    type: 'OFFENSE',
    level: 1,
    bonus: 3,
    cost: 1500,
    fortLevel: 1,
    hp: 10,
  },
  {
    name: 'Knight',
    type: 'OFFENSE',
    level: 2,
    bonus: 20,
    cost: 10000,
    fortLevel: 4,
    hp: 20,
  },
  {
    name: 'Berserker',
    type: 'OFFENSE',
    level: 3,
    bonus: 50,
    cost: 25000,
    fortLevel: 7,
    hp: 30,
  },
  {
    name: 'Guard',
    type: 'DEFENSE',
    level: 1,
    bonus: 3,
    cost: 1500,
    fortLevel: 1,
    hp: 10,
  },
  {
    name: 'Archer',
    type: 'DEFENSE',
    level: 2,
    bonus: 20,
    cost: 10000,
    fortLevel: 4,
    hp: 20,
  },
  {
    name: 'Royal Guard',
    type: 'DEFENSE',
    level: 3,
    bonus: 50,
    cost: 25000,
    fortLevel: 7,
    hp: 30,
  },
  {
    name: 'Spy',
    type: 'SPY',
    level: 1,
    bonus: 3,
    cost: 1500,
    fortLevel: 1,
    hp: 10,
  },
  {
    name: 'Infiltrator',
    type: 'SPY',
    level: 2,
    bonus: 20,
    cost: 10000,
    fortLevel: 8,
    hp: 20,
  },
  {
    name: 'Assassin',
    type: 'SPY',
    level: 3,
    bonus: 50,
    cost: 25000,
    fortLevel: 12,
    hp: 30,
  },
  {
    name: 'Sentry',
    type: 'SENTRY',
    level: 1,
    bonus: 3,
    cost: 1500,
    fortLevel: 1,
    hp: 10,
  },
  {
    name: 'Sentinel',
    type: 'SENTRY',
    level: 2,
    bonus: 20,
    cost: 10000,
    fortLevel: 8,
    hp: 20,
  },
  {
    name: 'Inquisitor',
    type: 'SENTRY',
    level: 3,
    bonus: 50,
    cost: 25000,
    fortLevel: 12,
    hp: 30,
  },
];
