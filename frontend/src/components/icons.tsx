import {
  BriefcaseBusiness,
  CarFront,
  Dumbbell,
  Gift,
  HeartPulse,
  House,
  type LucideProps,
  Mailbox,
  PawPrint,
  PiggyBank,
  ReceiptText,
  ShoppingCart,
  Sparkles,
  Tag,
  Ticket,
  ToolCase,
  Utensils,
  Wallet,
} from "lucide-react";

const iconMap = {
  utensils: Utensils,
  "shopping-cart": ShoppingCart,
  "car-front": CarFront,
  ticket: Ticket,
  "tool-case": ToolCase,
  "piggy-bank": PiggyBank,
  "briefcase-business": BriefcaseBusiness,
  "heart-pulse": HeartPulse,
  house: House,
  wallet: Wallet,
  tag: Tag,
  "receipt-text": ReceiptText,
  mailbox: Mailbox,
  "paw-print": PawPrint,
  dumbbell: Dumbbell,
  gift: Gift,
  "book-open": Sparkles,
} as const;

export function CategoryIcon({ name, ...props }: LucideProps & { name?: string | null }) {
  const Icon = name && name in iconMap ? iconMap[name as keyof typeof iconMap] : Tag;
  return <Icon aria-hidden="true" {...props} />;
}
