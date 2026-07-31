import { ServiceWaitlistPage } from "~/components/ServiceWaitlistPage";

export const meta = () => [
  { title: "Night Nurse Waitlist — Homebit" },
  {
    name: "description",
    content:
      "Join Homebit's night nurse waitlist as a household or househelp and get early access.",
  },
];

const config = {
  serviceSlug: "night-nurse",
  serviceName: "Night Nurse",
  serviceOptions: [
    "Night Nurse",
    "Overnight Care",
    "Baby Sitter",
    "Early Childhood Care",
    "New Mothers Help",
    "Househelp",
    "Indoor Cleaning",
    "Home Deep Cleaning",
    "Laundry & Ironing",
    "Meal Preps",
    "Pet Care",
    "Elderly Care",
    "Special Needs People Care",
    "Post Party Cleaning",
    "Plumbing",
  ],
  profileCopy: {
    household: {
      heading: "Looking for night nurse services?",
      paragraph:
        "Join the night nurse waitlist to get early access to Homebit's trusted overnight newborn care professionals. We know how exhausting those early months can be and how important it is to get rest while knowing your newborn is in safe, capable hands. Homebit is building a safer, faster way for families to find dependable night nurses by combining real human vetting with smart matching. Every night nurse on our platform goes through identity checks, reference reviews, and skills screening, so you are not starting from scratch or guessing based on a few text messages. We focus on overnight newborn care that respects your baby, your routines, and your need for rest, whether you need full-night coverage, part-night support, or occasional overnight relief. You will be able to describe your night nurse needs, your baby's age and feeding schedule, preferred schedules, and any specific care requirements or sleep training preferences. As the waitlist moves forward, we will share updates, service availability, and onboarding timelines so you can plan with confidence. Homebit is not just a list of names; it is a night nurse experience built around trust, compassion, and reliability. If you want a single place to find night nurse services and additional household support without the stress of endless searching, this is the right place to start.",
      servicePrompt: "Would you need additional services?",
      concernPrompt: "Biggest concern",
    },
    househelp: {
      heading: "You offer night nurse services?",
      paragraph:
        "Join the night nurse waitlist to be among the first night nurse professionals households discover on Homebit. We are creating a trusted marketplace where night nurses can present their skills with confidence and be matched to families who value experienced, reliable overnight newborn care. If you have experience with overnight newborn care, infant feeding support, sleep training assistance, postpartum family support, or specialized newborn care, Homebit will help you highlight that expertise. Our onboarding focuses on verification, references, and service details so families can trust you from the first interaction, and so you do not have to keep proving yourself repeatedly for every inquiry. You will be able to list the services you offer, your preferred schedules, and the kind of night nurse projects you specialize in. As we open access, we will prioritize waitlisted professionals, share new family requests early, and provide guidance on how to stand out with clear profiles and professional communication. Homebit is more than a job board; it is a long-term platform for night nurses who want stable opportunities, fair treatment, and a respectful relationship with the families they serve. If you are ready to build consistent night nurse work with families who appreciate experience and reliability, the waitlist is the first step.",
      servicePrompt: "What other services can you offer?",
      concernPrompt: "What should families value most about your profile?",
    },
  },
  payloadKey: "night_nurse_waitlist",
  whatsappText: "Send me WhatsApp updates when night nurse onboarding opens.",
  shareText: "I just joined Homebit's night nurse waitlist. If you know a family looking for trusted overnight newborn care, share this with them.",
};

export default function NightNurseWaitlistPage() {
  return <ServiceWaitlistPage config={config} />;
}
