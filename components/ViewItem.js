'use client';
import { useEffect } from 'react';
import { track } from '@/lib/analytics';
export default function ViewItem({ sku, name, price }) {
  useEffect(() => { track('view_item', { value: price, items: [{ item_id: sku, item_name: name, price }] }); }, [sku, name, price]);
  return null;
}
