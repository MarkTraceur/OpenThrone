'use server';

import {
  getUserById,
  updateUserUnits,
  createAttackLog,
  updateUser,
  createBankHistory,
  canAttack,
} from '@/services/attack.service';
import { Fortifications, UnitTypes, ItemTypes } from '@/constants';
import prisma from '@/lib/prisma';
import BattleResult from '@/models/BattleResult';
import BattleSimulationResult from '@/models/BattleSimulationResult';
import UserModel from '@/models/Users';
import type { BattleUnits, ItemType, Item, PlayerUnit, UnitType } from '@/types/typings';
import mtRand from '@/utils/mtrand';
import { calculateLoot, simulateBattle  } from '@/utils/attackFunctions';
import { SpyUserModel } from '@/models/SpyUser';
import { stringifyObj } from '@/utils/numberFormatting';
import { AssassinationResult, IntelResult } from '@/utils/spyFunctions';


export function simulateIntel(
  attacker: UserModel,
  defender: UserModel,
  spies: number
): any {
  spies = Math.max(1, Math.min(spies, 10));
  
  const fortification = Fortifications.find((fort) => fort.level === defender.fortLevel);
  if (!fortification) {
    return { status: 'failed', message: 'Fortification not found', defender: defender.fortLevel };
  }
  let { fortHitpoints } = defender;
  console.log('Spy', attacker.spy, 'Sentry', defender.sentry);
  const isSuccessful = attacker.spy > defender.sentry;
  const defenderSpyUnit = new SpyUserModel(defender, spies * 10)

  const result = new IntelResult(attacker, defender, spies);
  result.success = isSuccessful;
  result.spiesLost = isSuccessful ? 0 : spies;
  
  if (isSuccessful) {
    // Proceed with gathering intelligence
    const deathRiskFactor = Math.max(0, 1 - (attacker.spy / defender.sentry));
    let spiesLost = 0;
    for (let i = 0; i < spies; i++) {
      if (Math.random() < deathRiskFactor) {
        spiesLost++;
      }
    }
    const intelPercentage = Math.min((spies-spiesLost) * 10, 100);
    const intelKeys = Object.keys(new SpyUserModel(defender, (spies - spiesLost) * 10));
    const selectedKeysCount = Math.ceil(intelKeys.length * intelPercentage / 100);
    const randomizedKeys = intelKeys.sort(() => 0.5 - Math.random()).slice(0, selectedKeysCount);
    console.log('Random Keys:', randomizedKeys, 'Intel Percentage:', intelPercentage, 'Intel Keys:', intelKeys)

    result.intelligenceGathered = randomizedKeys.reduce((partialIntel, key) => {
      const initPartialIntel = partialIntel ?? {
        units: null,
        items: null,
        fortLevel: null,
        fortHitpoints: null,
        goldInBank: null,
      };

      console.log(defender)

      if (key === 'units' || key === 'items') {
        const totalTypes = defender[key].length;
        const typesToInclude = Math.ceil(totalTypes * intelPercentage / 100);
        initPartialIntel[key] = defender[key].sort(() => 0.5 - Math.random()).slice(0, typesToInclude);
      } else {
        initPartialIntel[key] = defender[key];
      }
      return initPartialIntel;
    }, result.intelligenceGathered);
  }
  return result;
}
    
function simulateAssassination(
  attacker: UserModel,
  defender: UserModel,
  spies: number,
  unit: string
) {
  const isSuccessful = attacker.spy > defender.sentry;

  const result = new AssassinationResult(attacker, defender, spies, unit);
  result.success = isSuccessful;
  result.spiesLost = isSuccessful ? 0 : spies;

  if (isSuccessful) {

    const deathRiskFactor = Math.max(0, 1 - (attacker.spy / defender.sentry));
    
    let spiesLost = 0;
    for (let i = 0; i < spies; i++) {
      if (Math.random() < deathRiskFactor) {
        spiesLost++;
      }
    }
    let casualties = 0;
    let defenderUnitCount = () => {
      if (unit === 'OFFENSE') {
        return defender.unitTotals.offense;
      }
      if (unit === 'DEFENSE') {
        return defender.unitTotals.defense;
      }
      if (unit === 'CITIZEN/WORKERS') {
        return defender.unitTotals.citizens + defender.unitTotals.workers;
      }
      return 0;
    }

    // TODO: right now we're maxing at 10 casualities (2*#ofSpies), but we can increase this depending on some other params.
    for (let i = 0; i < Math.min(defenderUnitCount(), spies * 2); i++) {
      if (Math.random() < deathRiskFactor) {
        casualties++;
      }
    }
    result.unitsKilled = casualties;
    if (casualties > 0) {
      let defenderUnitType;
      if (unit !== 'CITIZEN/WORKERS') {
        defenderUnitType = defender.units.find((u) => u.type === unit && u.level === 1);
      } else {
        defenderUnitType = defender.units.find((u) => (u.type === 'WORKER' || u.type === 'CITIZEN') && u.level === 1);
      }
        if (defenderUnitType) {
          defenderUnitType.quantity -= casualties;
        }
    }
    result.spiesLost = spiesLost;
  }
  return result;
}

function simulateInfiltration() {
  return {};
}

export async function spyHandler(attackerId: number, defenderId: number, spies: number, type: string, unit?: string) { 
  const attackerUser = await getUserById(attackerId);
  const defenderUser = await getUserById(defenderId);
  const attacker = new UserModel(attackerUser);
  const defender = new UserModel(defenderUser);
  if (!attacker || !defender) {
    return { status: 'failed', message: 'User not found' };
  }
  if (attacker.unitTotals.spies < spies) {
    return { status: 'failed', message: 'Insufficient spies' };
  }

  let spyResults: AssassinationResult | IntelResult;
  if (attacker.spy === 0) {
    return { status: 'failed', message: 'Insufficient Spy Offense' };
  }
  const Winner = attacker.spy > defender.sentry ? attacker : defender;
  let spyLevel = 1;
  if (type === 'INTEL') {
    spyResults = simulateIntel(attacker, defender, spies);
    
  } else if (type === 'ASSASSINATE') {
    spyResults = simulateAssassination(attacker, defender, spies, unit);

    spyLevel = 2;
    await updateUserUnits(defenderId,
      { units: defender.units },
    );
    console.log('done update');
    console.log(defender.unitTotals);
    //return spyResults;
  } else {
    spyResults = simulateInfiltration();
  }

  /*if (spyResults.spiesLost > 0) {
    attacker.units.find((u) => u.type === 'SPY' && u.level === spyLevel).quantity -= spyResults.spiesLost;
  }*/
  

  //AttackPlayer.spies -= spies;
  //AttackPlayer.experience += spyResults.experienceResult.Experience.Attacker;
  //AttackPlayer.gold += spyResults.goldStolen;
  //AttackPlayer.units = spyResults.units;

  /*await prisma.users.update({
    where: { id: attackerId },
    data: {
      gold: AttackPlayer.gold,
      experience: AttackPlayer.experience,
      units: AttackPlayer.units,
    },
  });*/

  const attack_log = await createAttackLog({
      attacker_id: attackerId,
      defender_id: defenderId,
      timestamp: new Date().toISOString(),
      winner: Winner.id,
      type: type,
      stats: {spyResults},
  });

  return {
    status: 'success',
    result: spyResults,
    attack_log: attack_log.id,
    //attacker: attacker,
    //defender: defender,
    extra_variables: {
      spies,
      spyResults,
    },
  };
}

export async function attackHandler(
  attackerId: number,
  defenderId: number,
  attack_turns: number
) {
  const attackerUser = await getUserById(attackerId);
  const defenderUser = await getUserById(defenderId);
  const attacker = new UserModel(attackerUser);
  const defender = new UserModel(defenderUser);
  if (!attacker || !defender) {
    return { status: 'failed', message: 'User not found' };
  }
  if (attacker.attackTurns < attack_turns) {
    return { status: 'failed', message: 'Insufficient attack turns' };
  }

  const AttackPlayer = new UserModel(attackerUser);
  const DefensePlayer = new UserModel(defenderUser);

  if (AttackPlayer.offense <= 0) {
    return {
      status: 'failed',
      message: 'Attack unsuccessful due to negligible offense.',
    };
  }

  if (AttackPlayer.level > DefensePlayer.level + 5 || AttackPlayer.level < DefensePlayer.level - 5) {
    return {
      status: 'failed',
      message: 'You can only attack within 5 levels of your own level.',
    }
  }

  if (await canAttack(AttackPlayer, DefensePlayer) === false) {
    return {
      status: 'failed',
      message: 'You have attacked this player too many times in the last 24 hours.',
    }
  }

  const startOfAttack = {
    Attacker: JSON.parse(JSON.stringify(stringifyObj(AttackPlayer))),
    Defender: JSON.parse(JSON.stringify(stringifyObj(DefensePlayer))),
  };

  const battleResults = simulateBattle(
    AttackPlayer,
    DefensePlayer,
    attack_turns
  );

  DefensePlayer.fortHitpoints = battleResults.fortHitpoints;
  
  const isAttackerWinner = battleResults.experienceResult.Result === 'Win';

  AttackPlayer.experience += battleResults.experienceResult.Experience.Attacker;
  DefensePlayer.experience += battleResults.experienceResult.Experience.Defender;
  try {
    const attack_log = await prisma.$transaction(async (prisma) => {
      if (isAttackerWinner) {
        DefensePlayer.gold = BigInt(DefensePlayer.gold) - battleResults.pillagedGold;
        AttackPlayer.gold = BigInt(AttackPlayer.gold) + battleResults.pillagedGold;

        await createBankHistory({
          gold_amount: battleResults.pillagedGold,
          from_user_id: defenderId,
          from_user_account_type: 'HAND',
          to_user_id: attackerId,
          to_user_account_type: 'HAND',
          date_time: new Date().toISOString(),
          history_type: 'WAR_SPOILS',
        });
      }

      const attack_log = await createAttackLog({
        attacker_id: attackerId,
        defender_id: defenderId,
        timestamp: new Date().toISOString(),
        winner: isAttackerWinner ? attackerId : defenderId,
        stats: {
          startOfAttack,
          endTurns: AttackPlayer.attackTurns,
          offensePointsAtEnd: AttackPlayer.offense,
          defensePointsAtEnd: DefensePlayer.defense,
          pillagedGold: isAttackerWinner ? battleResults.pillagedGold : BigInt(0),
          forthpAtStart: startOfAttack.Defender.fortHitpoints,
          forthpAtEnd: Math.max(DefensePlayer.fortHitpoints, 0),
          xpEarned: {
            attacker: Math.ceil(battleResults.experienceResult.Experience.Attacker),
            defender: Math.ceil(battleResults.experienceResult.Experience.Defender),
          },
          turns: attack_turns,
          attacker_units: AttackPlayer.units,
          defender_units: DefensePlayer.units,
          attacker_losses: battleResults.Losses.Attacker,
          defender_losses: battleResults.Losses.Defender,
        },
      });

      await updateUser(attackerId, {
        gold: AttackPlayer.gold,
        attack_turns: AttackPlayer.attackTurns - attack_turns,
        experience: Math.ceil(AttackPlayer.experience),
        units: AttackPlayer.units,
      });

      await updateUser(defenderId, {
        gold: DefensePlayer.gold,
        fort_hitpoints: Math.max(DefensePlayer.fortHitpoints, 0),
        units: DefensePlayer.units,
        experience: Math.ceil(DefensePlayer.experience),
      });

      return attack_log;
    });

    return {
      status: 'success',
      result: isAttackerWinner,
      attack_log: attack_log.id,
      extra_variables: stringifyObj({
        fortDmgTotal: startOfAttack.Defender.fortHitpoints - Math.max(DefensePlayer.fortHitpoints, 0),
        BattleResults: battleResults,
      }),
    };
  } catch (error) {
    console.error('Transaction failed: ', error);
    return { status: 'failed', message: 'Transaction failed.' };
  }
}


