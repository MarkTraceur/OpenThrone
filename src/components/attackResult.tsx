import UserModel from "@/models/Users";
import toLocale from "@/utils/numberFormatting";
import { getLevelFromXP } from "@/utils/utilities";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";

const attackResults = ({ battle, viewerID }) => {
  const { attackerPlayer, defenderPlayer, winner, stats } = battle;
  const isViewerAttacker = viewerID === attackerPlayer.id
  const isViewerDefender = viewerID === defenderPlayer.id;
  const isPlayerWinner = winner === viewerID;
  const isAttackerWinner = winner === attackerPlayer.id;
  console.log(stats);
  const lines = [];
  const defenderRace = defenderPlayer?.race ?? 'ELF';

  const describeLosses = (losses) => {
    return Object.entries(losses).map(([key, value]) => {
      const [unitType, unitLevel] = key.split('-');
      return `${value} ${unitType} level ${unitLevel}`;
    }).join(', ');
  };

  const totalLosses = (losses: number): number => {
    if (losses)
      return Object.values(losses).reduce((acc, curr) => acc + curr, 0);
    else return 0;
  };

  const attackerTotalLosses = toLocale(totalLosses(stats.attacker_losses));
  const defenderTotalLosses = toLocale(totalLosses(stats.defender_losses));

  const summaryLines = []

  const countUnitsOfType = (units, type) => {
    return toLocale(units.filter(unit => unit.type === type)
      .reduce((acc, curr) => acc + curr.quantity, 0));
  }

  summaryLines.push(`Battle ID: ${battle.id}`);
  summaryLines.push(`${isViewerAttacker ? 'You' : attackerPlayer.display_name} attacked ${isViewerDefender ? 'You' : defenderPlayer.display_name}`);
  summaryLines.push(`${isViewerAttacker ? 'Your' : attackerPlayer.display_name + "'s"} ${countUnitsOfType(stats.startOfAttack.Attacker.units, 'OFFENSE')} soldiers did ${toLocale(new UserModel(stats.startOfAttack.Attacker).offense)} damage`);
  summaryLines.push(`${isViewerDefender ? 'Your' : defenderPlayer.display_name + "'s"} countered with ${toLocale(new UserModel(stats.startOfAttack.Defender).defense)} damage`);
  summaryLines.push(`${isPlayerWinner ? 'You' : isAttackerWinner ? attackerPlayer.display_name : defenderPlayer.display_name} won the battle`);
  if (typeof stats.xpEarned === 'object') {
    summaryLines.push(`${attackerPlayer.display_name} earned ${toLocale(stats.xpEarned.attacker)} XP`)
    summaryLines.push(`${defenderPlayer.display_name} earned ${toLocale(stats.xpEarned.defender)} XP`)
  } else {
    summaryLines.push(`${attackerPlayer.display_name} earned: ${toLocale(stats.xpEarned)} XP`);
  }
  summaryLines.push(`Gold Pillaged: ${isAttackerWinner ? toLocale(stats.pillagedGold.toLocaleString()) : 0}`);
  summaryLines.push(`Fort Damage Dealt by Attacker: ${stats.forthpAtStart - stats.forthpAtEnd}`);
  summaryLines.push(`Total Units Lost by Attacker: ${attackerTotalLosses}`);
  summaryLines.push(`Total Units Lost by Defender: ${defenderTotalLosses}`);

  const sentence = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 1,
        staggerChildren: 0.06,
        staggerDirection: -1,
      },
    },
    exit: { opacity: 0 },
  };

  const letter = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3,
      },
    },
  };

  return (
    <div>
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <h2 className="text-center mt-2">{attackerPlayer?.display_name}</h2>
          <h4 className="text-white">Level: {getLevelFromXP(stats.startOfAttack.Attacker.experience)}</h4>
          <center>
            <Image
              src={`${process.env.NEXT_PUBLIC_AWS_S3_ENDPOINT}/images/shields/${attackerPlayer?.race}_150x150.webp`}
              className="ml-2"
              width={150}
              height={150}
              alt="attacker avatar"
            />
          </center>
        </div>
        <div className="text-center">
          <h2 className="text-center mt-2">{defenderPlayer?.display_name}</h2>
          <h4 className="text-white">Level: {getLevelFromXP(stats.startOfAttack.Defender.experience)}</h4>
          <center>
            <Image
              src={`${process.env.NEXT_PUBLIC_AWS_S3_ENDPOINT}/images/shields/${defenderPlayer?.race}_150x150.webp`}
              className="ml-2"
              alt="defender avatar"
              width={150}
              height={150}
            />
          </center>
        </div>
      </div>
      <div style={{
        backgroundImage: 'url(/assets/images/scroll.webp)',
        paddingLeft: '70px',
        paddingRight: '70px',
        backgroundSize: '75% 100%',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        paddingTop: '30px',
        paddingBlockEnd: '30px',
      }}
        className='text-center pb-90px pt-10'>
        <p className="text-2xl text-black font-medieval font-bold"><b>Battle Log</b></p>
        <AnimatePresence>
          {summaryLines.map((line, i) => (
            <motion.p
              className="load-screen--message font-medieval font-semibold"
              variants={sentence}
              initial="hidden"
              animate="visible"
              exit="exit"
              key={`${i}-secondanimate`}
            >
              {line.split('').map((char, index) => (
                <motion.span key={`${char}-${index}-2`} variants={letter} className='text-lg mb-2 text-black'>
                  {char}
                </motion.span>
              ))}

            </motion.p>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default attackResults;