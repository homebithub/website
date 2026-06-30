import { ServiceWaitlistPage } from "~/components/ServiceWaitlistPage";

export const meta = () => [
  { title: "Plumbing Waitlist — Homebit" },
  {
    name: "description",
    content:
      "Join Homebit's plumbing waitlist as a household or househelp and get early access.",
  },
];

const config = {
  serviceSlug: "plumbing",
  serviceName: "Plumbing",
  serviceOptions: [
    "Plumbing",
    "Househelp",
    "Indoor Cleaning",
    "Home Deep Cleaning",
    "Laundry & Ironing",
    "Meal Preps",
    "Pet Care",
    "Elderly Care",
    "Special Needs People Care",
    "Overnight Care",
    "Baby Sitter",
    "Early Childhood Care",
    "Post Party Cleaning",
  ],
  profileCopy: {
    household: {
      heading: "Looking for plumbing services?",
      paragraph:
        "Join the plumbing waitlist to get early access to Homebit's trusted plumbing professionals. We know how stressful plumbing emergencies and repairs can be. Homebit is building a safer, faster way for families to find dependable plumbers by combining real human vetting with smart matching. Every plumber on our platform goes through identity checks, reference reviews, and skills screening, so you are not starting from scratch or guessing based on a few text messages. We focus on plumbing work that respects your home, solves your problems efficiently, and gives you peace of mind, whether you need emergency repairs, routine maintenance, installation work, or specialized plumbing services. You will be able to describe your plumbing needs, the urgency of your situation, preferred schedules, and any specific requirements or concerns. As the waitlist moves forward, we will share updates, service availability, and onboarding timelines so you can plan with confidence. Homebit is not just a list of names; it is a plumbing experience built around trust, quality, and reliability. If you want a single place to find plumbing services and additional household support without the stress of endless searching, this is the right place to start.",
      servicePrompt: "Would you need additional services?",
      concernPrompt: "Biggest concern",
    },
    househelp: {
      heading: "You offer plumbing services?",
      paragraph:
        "Join the plumbing waitlist to be among the first plumbing professionals households discover on Homebit. We are creating a trusted marketplace where plumbers can present their skills with confidence and be matched to families who value quality plumbing work. If you have experience with residential plumbing, emergency repairs, installation work, maintenance services, or specialized plumbing solutions, Homebit will help you highlight that expertise. Our onboarding focuses on verification, references, and service details so families can trust you from the first interaction, and so you do not have to keep proving yourself repeatedly for every inquiry. You will be able to list the services you offer, your preferred schedules, and the kind of plumbing projects you specialize in. As we open access, we will prioritize waitlisted professionals, share new family requests early, and provide guidance on how to stand out with clear profiles and professional communication. Homebit is more than a job board; it is a long-term platform for plumbers who want stable opportunities, fair treatment, and a respectful relationship with the families they serve. If you are ready to build consistent plumbing work with families who appreciate quality and reliability, the waitlist is the first step.",
      servicePrompt: "What other services can you offer?",
      concernPrompt: "What should families value most about your profile?",
    },
  },
  payloadKey: "plumbing_waitlist",
  whatsappText: "Send me WhatsApp updates when plumbing onboarding opens.",
  shareText: "I just joined Homebit's plumbing waitlist. If you know a family looking for trusted plumbing services, share this with them.",
};

export default function PlumbingWaitlistPage() {
  return <ServiceWaitlistPage config={config} />;
}
