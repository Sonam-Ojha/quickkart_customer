import { useState } from 'react'

const CAT_EMOJI: Record<string, string> = {
  'Atta': '🌾', 'Besan': '🟡', 'Maida': '⚪', 'Rice': '🍚',
  'Sooji & Rava': '🥣', 'Dals & Pulses': '🫘',
  'Milk': '🥛', 'Paneer': '🧀', 'Curd & Yogurt': '🫙',
  'Butter & Cream': '🧈', 'Eggs': '🥚', 'Cheese': '🧀',
  'Fresh Fruits': '🍎', 'Fresh Vegetables': '🥦',
  'Leafy Greens': '🥬', 'Exotic Veggies': '🫑',
  'Chips & Crisps': '🥔', 'Biscuits': '🍪', 'Namkeen': '🫘',
  'Chocolates': '🍫', 'Dry Fruits': '🥜',
  'Cold Drinks': '🥤', 'Juices': '🧃', 'Tea & Coffee': '☕',
  'Energy Drinks': '⚡', 'Water & Soda': '💧',
  'Shampoo & Hair Care': '🧴', 'Soap & Bodywash': '🧼',
  'Oral Care': '🦷', 'Skin Care': '✨', 'Feminine Care': '🌸',
  'Detergents': '🫧', 'Dishwash': '🍽️', 'Toilet Cleaners': '🚽',
  'Fresheners & Repel': '🌿', 'Noodles & Pasta': '🍜',
  'Ready to Eat': '🍱', 'Frozen Snacks': '❄️', 'Soups': '🥣',
  'Whole Spices': '🌶️', 'Blended Masala': '🫙',
  'Salt & Sugar': '🧂', 'Condiments': '🍯',
  'Baby Food': '🍼', 'Diapers & Wipes': '🧷', 'Baby Skin Care': '🧴',
  'Breads & Buns': '🍞', 'Cakes & Muffins': '🧁', 'Rusk & Toast': '🍞',
  'Cooking Oils': '🫙', 'Ghee': '🧈', 'Mustard Oil': '🌻',
}

const CAT_BG: Record<string, string> = {
  'Milk': '#FEF9C3', 'Eggs': '#FEF9C3', 'Paneer': '#FEF9C3', 'Butter & Cream': '#FEF9C3', 'Cheese': '#FEF9C3', 'Curd & Yogurt': '#FEF9C3',
  'Fresh Fruits': '#DCFCE7', 'Fresh Vegetables': '#DCFCE7', 'Leafy Greens': '#DCFCE7', 'Exotic Veggies': '#DCFCE7',
  'Cold Drinks': '#DBEAFE', 'Juices': '#DBEAFE', 'Energy Drinks': '#DBEAFE', 'Water & Soda': '#DBEAFE',
  'Chocolates': '#FEE2E2', 'Chips & Crisps': '#FEE2E2', 'Biscuits': '#FEF3C7', 'Namkeen': '#FEF3C7', 'Dry Fruits': '#FEF3C7',
  'Tea & Coffee': '#FEF3C7',
  'Breads & Buns': '#FEF3C7', 'Cakes & Muffins': '#FEF3C7', 'Rusk & Toast': '#FEF3C7',
  'Shampoo & Hair Care': '#FCE7F3', 'Soap & Bodywash': '#FCE7F3', 'Oral Care': '#FCE7F3', 'Skin Care': '#FCE7F3', 'Feminine Care': '#FCE7F3',
}

interface Props {
  src: string
  alt: string
  category?: string
  className?: string
  imgClassName?: string
  emojiSize?: string
  onClick?: () => void
}

export default function ProductImage({ src, alt, category = '', className = '', imgClassName = '', emojiSize = 'text-4xl', onClick }: Props) {
  const [failed, setFailed] = useState(false)
  const emoji = CAT_EMOJI[category] ?? '🛍️'
  const bg    = CAT_BG[category] ?? '#F5F5F4'
  const showImg = src && !failed

  return (
    <div
      className={`flex items-center justify-center overflow-hidden ${className}`}
      style={{ background: showImg ? undefined : bg }}
      onClick={onClick}
    >
      {showImg ? (
        <img
          src={src}
          alt={alt}
          className={`w-full h-full object-contain ${imgClassName}`}
          loading="lazy"
          onError={() => setFailed(true)}
        />
      ) : (
        <span className={`${emojiSize} leading-none select-none`}>{emoji}</span>
      )}
    </div>
  )
}
