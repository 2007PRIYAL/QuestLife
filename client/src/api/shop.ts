/**
 * IMPORTANT: the backend's database already has `shop_items` and
 * `inventory` tables (see migrations/001_initial_schema.sql), but there is
 * no route, controller, or service that reads or writes them. See
 * NOTES.md for the `GET /api/shop/items` and `POST /api/shop/purchase`
 * shapes this file expects once those exist.
 *
 * This returns local sample data so the Shop screen is fully built and
 * navigable, but purchases here are NOT persisted anywhere. Swap the
 * bodies of these two functions for real apiClient calls once the routes
 * exist.
 */
export interface ShopItem {
  id: string;
  name: string;
  description: string;
  price_coins: number;
  item_type: 'AVATAR' | 'TITLE' | 'THEME' | 'COSMETIC' | 'FRAME';
  asset_key: string;
  owned: boolean;
}

const SAMPLE_SHOP_ITEMS: ShopItem[] = [
  {
    id: 'shop-knight',
    name: 'Knight',
    description: 'The classic silver-plate adventurer look.',
    price_coins: 0,
    item_type: 'AVATAR',
    asset_key: 'avatar-knight',
    owned: true,
  },
  {
    id: 'shop-shadow',
    name: 'Shadow',
    description: 'A cloaked wanderer who moves unseen.',
    price_coins: 500,
    item_type: 'AVATAR',
    asset_key: 'avatar-shadow',
    owned: false,
  },
  {
    id: 'shop-mage',
    name: 'Mage',
    description: 'Arcane robes crackling with latent spellpower.',
    price_coins: 500,
    item_type: 'AVATAR',
    asset_key: 'avatar-mage',
    owned: false,
  },
  {
    id: 'shop-ranger',
    name: 'Ranger',
    description: 'Quick, quiet, and always stocked with arrows.',
    price_coins: 500,
    item_type: 'AVATAR',
    asset_key: 'avatar-ranger',
    owned: false,
  },
  {
    id: 'shop-samurai',
    name: 'Samurai',
    description: 'Disciplined blade-work, honed over years.',
    price_coins: 500,
    item_type: 'AVATAR',
    asset_key: 'avatar-samurai',
    owned: false,
  },
  {
    id: 'shop-dragon',
    name: 'Dragon',
    description: 'A legendary form reserved for high-level heroes.',
    price_coins: 1000,
    item_type: 'AVATAR',
    asset_key: 'avatar-dragon',
    owned: false,
  },
];

export const fetchShopItems = async (): Promise<ShopItem[]> => {
  return SAMPLE_SHOP_ITEMS;
};

export const purchaseShopItem = async (
  itemId: string,
): Promise<{ item: ShopItem; coins_spent: number }> => {
  const item = SAMPLE_SHOP_ITEMS.find((i) => i.id === itemId);
  if (!item) {
    throw new Error('Item not found');
  }
  item.owned = true;
  return { item, coins_spent: item.price_coins };
};
