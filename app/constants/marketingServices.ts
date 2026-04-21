import type { ComponentType, SVGProps } from "react";
import {
  BoltIcon,
  BuildingOffice2Icon,
  CakeIcon,
  HeartIcon,
  HomeModernIcon,
  KeyIcon,
  MoonIcon,
  PuzzlePieceIcon,
  ShieldCheckIcon,
  SparklesIcon,
  SunIcon,
  TruckIcon,
} from "@heroicons/react/24/outline";

export type MarketingServiceIcon = ComponentType<SVGProps<SVGSVGElement>>;

export interface MarketingService {
  name: string;
  description: string;
  icon: MarketingServiceIcon;
  comingSoon?: boolean;
}

export const MARKETING_SERVICES: MarketingService[] = [
  {
    name: "Indoor Cleaning",
    description: "Trusted home cleaners for the everyday indoor work households rely on.",
    icon: HomeModernIcon,
  },
  {
    name: "Outdoor Cleaning",
    description: "Outdoor tidy-ups for compounds, balconies, terraces, and shared exterior spaces.",
    icon: SunIcon,
    comingSoon: true,
  },
  {
    name: "Office Cleaning",
    description: "Professional cleaning support for offices, studios, and small workspaces.",
    icon: BuildingOffice2Icon,
    comingSoon: true,
  },
  {
    name: "Moving Cleaning",
    description: "Move-in and move-out cleaning to help you reset a space quickly.",
    icon: TruckIcon,
    comingSoon: true,
  },
  {
    name: "Laundry and Ironing",
    description: "Laundry help that keeps clothes washed, pressed, folded, and ready to wear.",
    icon: SparklesIcon,
  },
  {
    name: "New Mothers Help",
    description: "Gentle home support for mothers adjusting to life with a newborn.",
    icon: HeartIcon,
    comingSoon: true,
  },
  {
    name: "Airbnb Cleaning",
    description: "Turnover cleaning to keep short-stay homes fresh between guest bookings.",
    icon: KeyIcon,
    comingSoon: true,
  },
  {
    name: "Elder Care",
    description: "Dependable care support for older adults who need extra attention at home.",
    icon: ShieldCheckIcon,
  },
  {
    name: "Express Cleaning",
    description: "Fast-response cleaning for urgent messes and same-day home refreshes.",
    icon: BoltIcon,
    comingSoon: true,
  },
  {
    name: "Special Needs Children Care",
    description: "Support for families seeking caregivers experienced with special needs children.",
    icon: PuzzlePieceIcon,
  },
  {
    name: "Post Party Clean Up",
    description: "After-event cleanup so your home gets back to normal without the extra stress.",
    icon: CakeIcon,
    comingSoon: true,
  },
  {
    name: "Night Nurse",
    description: "Overnight newborn support for families who need care through the night.",
    icon: MoonIcon,
    comingSoon: true,
  },
];
