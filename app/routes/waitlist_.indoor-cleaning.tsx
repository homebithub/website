import { ServiceWaitlistPage } from "~/components/ServiceWaitlistPage";

export const meta = () => [
  { title: "Indoor Cleaning Waitlist — Homebit" },
  {
    name: "description",
    content:
      "Join Homebit's indoor cleaning waitlist as a household or househelp and get early access.",
  },
];

const config = {
  serviceSlug: "indoor-cleaning",
  serviceName: "Indoor Cleaning",
  serviceOptions: [
    "Indoor Cleaning",
    "Home Deep Cleaning",
    "Househelp",
    "Elderly Care",
    "Special Needs People Care",
    "Overnight Care",
    "Laundry & Ironing",
    "Meal Preps",
    "Pet Care",
    "Baby Sitter",
    "Early Childhood Care",
    "Post Party Cleaning",
    "Plumbing",
  ],
  profileCopy: {
    household: {
      heading: "Looking for indoor cleaning services?",
      paragraph:
        "Join the indoor cleaning waitlist to get early access to Homebit's trusted cleaning professionals. We know how hard it is to find someone you can trust to clean your home thoroughly and consistently. Homebit is building a safer, faster way for families to find dependable indoor cleaners by combining real human vetting with smart matching. Every cleaner on our platform goes through identity checks, reference reviews, and skills screening, so you are not starting from scratch or guessing based on a few text messages. We focus on cleaning that respects your home, your belongings, and your preferences, whether you need regular maintenance, deep cleaning, or specialized care for specific areas. You will be able to describe your cleaning needs, the kind of service frequency that works best, preferred schedules, and any specific requirements or eco-friendly preferences. As the waitlist moves forward, we will share updates, service availability, and onboarding timelines so you can plan with confidence. Homebit is not just a list of names; it is a cleaning experience built around trust, quality, and reliability. If you want a single place to find indoor cleaning and additional household services without the stress of endless searching, this is the right place to start.",
      servicePrompt: "Would you need additional services?",
      concernPrompt: "Biggest concern",
    },
    househelp: {
      heading: "You offer indoor cleaning services?",
      paragraph:
        "Join the indoor cleaning waitlist to be among the first cleaning professionals households discover on Homebit. We are creating a trusted marketplace where cleaners can present their skills with confidence and be matched to families who value quality cleaning. If you have experience with residential cleaning, deep cleaning, specialized surface care, or comprehensive household maintenance, Homebit will help you highlight that expertise. Our onboarding focuses on verification, references, and service details so families can trust you from the first interaction, and so you do not have to keep proving yourself repeatedly for every inquiry. You will be able to list the services you offer, your preferred schedules, and the kind of cleaning environments you work best in. As we open access, we will prioritize waitlisted professionals, share new family requests early, and provide guidance on how to stand out with clear profiles and professional communication. Homebit is more than a job board; it is a long-term platform for cleaners who want stable opportunities, fair treatment, and a respectful relationship with the families they serve. If you are ready to build consistent cleaning work with families who appreciate quality and reliability, the waitlist is the first step.",
      servicePrompt: "What other services can you offer?",
      concernPrompt: "What should families value most about your profile?",
    },
  },
  payloadKey: "indoor_cleaning_waitlist",
  whatsappText: "Send me WhatsApp updates when indoor cleaning onboarding opens.",
  shareText: "I just joined Homebit's indoor cleaning waitlist. If you know a family looking for trusted cleaning services, share this with them.",
};

export default function IndoorCleaningWaitlistPage() {
  return <ServiceWaitlistPage config={config} />;
}
