import Layout from '@/components/Layout';
import { Meta } from '@/layouts/Meta';

const Index = () => {
  // const router = useRouter();

  return (
    <Layout meta={<Meta title="MetaTitle2" description="Meta Description" />}>
      <div className="mx-auto w-3/4 py-2 md:col-span-9">
        <div className="advisor my-3 rounded-lg px-4 py-2 shadow-md">
          <div className="flex justify-center">
            <ul className="list-inside list-disc">
              <li>
                Choose between four unique races: Undead, Humans, Goblins, Elves
              </li>
              <li>
                Train citizens as workers, offensive or defensive soldiers, and
                spies
              </li>
              <li>Equip your army with weapons and armor</li>
              <li>
                Play with friends,{' '}
                <span className="line-through">create your own alliance</span>,
                and communicate via the in-game message system
              </li>
              <li>
                <span className="line-through">
                  Create a character profile with a custom avatar
                </span>
              </li>
              <li>
                Stay in contact with the game&apos;s developers via the
                DarkCurse Discord
              </li>
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
