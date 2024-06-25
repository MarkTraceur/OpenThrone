import BattleUpgradesSection from '@/components/battle-upgrade';
import { ArmoryUpgrades, BattleUpgrades, OffenseiveUpgrades } from '@/constants';
import { useUser } from '@/context/users';
import { UnitProps } from '@/types/typings';
import toLocale from '@/utils/numberFormatting';
import Alert from '@/components/alert';
import { useEffect, useState } from 'react';

const useItems = (user) => {
  const [items, setItems] = useState({ OFFENSE: [], DEFENSE: [], SPY: [], SENTRY: [] });

  useEffect(() => {
    if (user) {
      const itemMap = (item, itemType) =>
        itemMapFunction(item, itemType, user, user.offensiveLevel);
      setItems({
        OFFENSE: BattleUpgrades.filter((i) => i.type === 'OFFENSE').map((i) =>
          itemMap(i, 'OFFENSE'),
        ),
        DEFENSE: BattleUpgrades.filter((i) => i.type === 'DEFENSE').map((i) =>
          itemMap(i, 'DEFENSE'),
        ),
        SPY: BattleUpgrades.filter((i) => i.type === 'SPY').map((i) =>
          itemMap(i, 'SPY'),
        ),
        SENTRY: BattleUpgrades.filter((i) => i.type === 'SENTRY').map((i) =>
          itemMap(i, 'SENTRY'),
        ),
      });
    }
  }, [user]);
  return items;
};

const itemMapFunction = (item, itemType, user, siegeLevel) => {
  return {
    id: `${itemType}_${item.level}`,
    name: item.name,
    bonus: item.bonus,
    ownedItems:
      user?.battle_upgrades.find(
        (i) =>
          i.type === item.type &&
          i.level === item.level 
      )?.quantity || 0,
    cost: toLocale(
      item.cost - (user?.priceBonus / 100) * item.cost,
      user?.locale,
    ),
    enabled: item.SiegeUpgradeLevel <= siegeLevel,
    level: item.level,
    type: item.type,
    SiegeUpgradeLevel: item.SiegeUpgradeLevel,
    unitsCovered: item.unitsCovered,
    minUnitLevel: item.minUnitLevel,
    SiegeUpgrade: OffenseiveUpgrades.find((f) => f.level === item.SiegeUpgradeLevel)?.name,
  };
};

const Upgrades = (props) => {
  const { user } = useUser();
  return (
    <div className="mainArea pb-10">
      <h2 className="page-title">Upgrades</h2>
      <div className="my-5 flex justify-between">
        <Alert />
      </div>
      <div className="my-5 flex justify-around">
        <p className="mb-0">
          Gold On Hand: <span>{toLocale(user?.gold)}</span>
        </p>
        <p className="mb-0">
          Banked Gold: <span>{toLocale(user?.goldInBank)}</span>
        </p>
      </div>
      <br />
      Only Level 2 and higher units can use battle upgrades.
      <div className="mb-4 flex flex-col justify-around">
        <BattleUpgradesSection heading='Offense' type='OFFENSE' items={useItems(user).OFFENSE} />

        <BattleUpgradesSection heading='Defense' type='DEFENSE' items={useItems(user).DEFENSE} />
      </div>
    </div>
  );
};

export default Upgrades;
