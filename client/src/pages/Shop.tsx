import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Check, Gift } from 'lucide-react';
import { TopBar } from '@/components/TopBar';
import { BottomNav } from '@/components/BottomNav';
import { PixelPanel } from '@/components/PixelPanel';
import { PixelButton } from '@/components/PixelButton';
import { LoadingScreen } from '@/components/LoadingScreen';
import { ErrorBanner } from '@/components/ErrorBanner';
import { fetchProfile } from '@/api/profile';
import { fetchShopItems, purchaseShopItem } from '@/api/shop';
import type { ShopItem } from '@/api/shop';
import { getApiErrorMessage } from '@/api/client';
import type { Profile } from '@/types';

type Category = 'AVATAR' | 'BOOSTS' | 'ITEMS' | 'MYSTERY';

const CATEGORIES: { key: Category; label: string }[] = [
  { key: 'AVATAR', label: 'Avatars' },
  { key: 'BOOSTS', label: 'Boosts' },
  { key: 'ITEMS', label: 'Items' },
  { key: 'MYSTERY', label: 'Mystery' },
];

export const Shop = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [items, setItems] = useState<ShopItem[]>([]);
  const [category, setCategory] = useState<Category>('AVATAR');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [purchasingId, setPurchasingId] = useState<string | null>(null);

  const load = async () => {
    try {
      const [profileData, itemsData] = await Promise.all([fetchProfile(), fetchShopItems()]);
      setProfile(profileData);
      setItems(itemsData);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not load the shop.'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handlePurchase = async (item: ShopItem) => {
    if (!profile) return;
    if (profile.coins < item.price_coins) {
      setError(`Not enough coins for ${item.name}. You need ${item.price_coins - profile.coins} more.`);
      return;
    }
    setPurchasingId(item.id);
    setError('');
    try {
      await purchaseShopItem(item.id);
      setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, owned: true } : i)));
      // Coin balance lives on the server profile, which this demo shop
      // can't actually deduct from (see NOTES.md) — reflect it locally
      // only so the UI stays honest about what changed.
      setProfile((prev) => (prev ? { ...prev, coins: prev.coins - item.price_coins } : prev));
    } catch (err) {
      setError(getApiErrorMessage(err, 'Purchase failed.'));
    } finally {
      setPurchasingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="app-shell">
        <LoadingScreen label="Stocking the shelves..." />
      </div>
    );
  }

  return (
    <div className="app-shell">
      {profile && <TopBar profile={profile} />}

      <div className="px-4 pt-4 pb-2">
        <h1 className="font-pixel text-[14px] text-gold text-shadow-pixel">Shop</h1>
        <p className="text-xs text-[#8CA6C4] mt-1">Spend your coins. Unlock your style.</p>
      </div>

      <div className="flex gap-2 px-4 pb-3 overflow-x-auto">
        {CATEGORIES.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setCategory(key)}
            className={[
              'font-pixel text-[8px] px-3 py-2 rounded-pixel border-2 border-black whitespace-nowrap',
              category === key ? 'bg-gold text-[#3A2400]' : 'bg-[#0E1B2E] text-[#8CA6C4]',
            ].join(' ')}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex-1 px-4 pb-4 flex flex-col gap-3 overflow-y-auto">
        {error && <ErrorBanner message={error} />}

        {category === 'AVATAR' && (
          <div className="grid grid-cols-3 gap-3">
            {items.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -3, scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <PixelPanel
                  tone={item.owned ? 'gold' : 'blue'}
                  className="p-3 flex flex-col items-center gap-1.5"
                >
                  <div className="w-full aspect-square rounded-pixel bg-[#0E1B2E] border border-black flex items-center justify-center text-2xl relative">
                    🧑
                    {!item.owned && (
                      <span className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <Lock size={16} className="text-[#8CA6C4]" aria-hidden="true" />
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-white font-semibold truncate w-full text-center">{item.name}</p>
                  {item.owned ? (
                    <span className="flex items-center gap-1 text-[10px] font-pixel text-green">
                      <Check size={12} aria-hidden="true" /> Owned
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handlePurchase(item)}
                      disabled={purchasingId === item.id}
                      className="text-[10px] font-pixel text-gold"
                    >
                      {purchasingId === item.id ? '...' : `${item.price_coins}`}
                    </button>
                  )}
                </PixelPanel>
              </motion.div>
            ))}
          </div>
        )}

        {category !== 'AVATAR' && category !== 'MYSTERY' && (
          <p className="text-center text-sm text-[#5C7A9E] py-10">
            No {CATEGORIES.find((c) => c.key === category)?.label.toLowerCase()} available yet.
          </p>
        )}

        {category === 'MYSTERY' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <PixelPanel tone="gold" className="p-5 flex items-center gap-4">
              <div className="w-16 h-16 rounded-pixel bg-[#0E1B2E] border-2 border-black flex items-center justify-center text-3xl shrink-0">
                <Gift className="text-gold" aria-hidden="true" />
              </div>
              <div className="flex-1">
                <h3 className="font-pixel text-[11px] text-gold mb-1">Mystery Box</h3>
                <p className="text-xs text-[#8CA6C4] mb-3">Get a random reward!</p>
                <PixelButton
                  variant="gold"
                  fullWidth={false}
                  className="text-[9px] py-2.5 px-4"
                  onClick={() =>
                    setError('Mystery boxes need a backend endpoint to roll and grant a reward — not implemented yet.')
                  }
                >
                  300 Coins — Buy
                </PixelButton>
              </div>
            </PixelPanel>
          </motion.div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};
