import { ServiceWaitlistPage } from "~/components/ServiceWaitlistPage";

export const meta = () => [
  { title: "Express Cleaning Waitlist — Homebit" },
  {
    name: "description",
    content:
      "Join Homebit's express cleaning waitlist as a household or service provider and get early access.",
  },
];

const config = {
  serviceSlug: "express-cleaning",
  serviceName: "Express Cleaning",
  serviceOptions: [
    "Express Cleaning",
    "Indoor Cleaning",
    "Home Deep Cleaning",
    "Service provider",
    "Laundry & Ironing",
    "Meal Preps",
    "Pet Care",
    "Elderly Care",
    "Special Needs People Care",
    "Overnight Care",
    "Baby Sitter",
    "Early Childhood Care",
    "Post Party Cleaning",
    "Plumbing",
  ],
  profileCopy: {
    household: {
      heading: "Looking for express cleaning services?",
      paragraph:
        "Join the express cleaning waitlist to get early access to Homebit's trusted express cleaning professionals. We know how urgent cleaning needs can be and how important it is to get help quickly when unexpected messes happen. Homebit is building a safer, faster way for families to find dependable express cleaners by combining real human vetting with smart matching. Every express cleaner on our platform goes through identity checks, reference reviews, and skills screening, so you are not starting from scratch or guessing based on a few text messages. We focus on express cleaning that respects your home, your urgency, and your needs, whether you need same-day cleaning, urgent mess cleanup, or quick home refreshes. You will be able to describe your express cleaning needs, the urgency of your situation, your preferred timing, and any specific requirements or areas of concern. As the waitlist moves forward, we will share updates, service availability, and onboarding timelines so you can plan with confidence. Homebit is not just a list of names; it is an express cleaning experience built around trust, speed, and reliability. If you want a single place to find express cleaning and additional household services without the stress of endless searching, this is the right place to start.",
      servicePrompt: "Would you need additional services?",
      concernPrompt: "Biggest concern",
    },
    service_provider: {
      heading: "You offer express cleaning services?",
      paragraph:
        "Join the express cleaning waitlist to be among the first express cleaning professionals households discover on Homebit. We are creating a trusted marketplace where express cleaners can present their skills with confidence and be matched to families who value fast, reliable cleaning when they need it most. If you have experience with same-day cleaning, urgent cleanup, quick refresh services, time-sensitive cleaning projects, or emergency cleaning support, Homebit will help you highlight that expertise. Our onboarding focuses on verification, references, and service details so families can trust you from the first interaction, and so you do not have to keep proving yourself repeatedly for every inquiry. You will be able to list the services you offer, your availability for urgent requests, and the kind of express cleaning projects you specialize in. As we open access, we will prioritize waitlisted professionals, share new family requests early, and provide guidance on how to stand out with clear profiles and professional communication. Homebit is more than a job board; it is a long-term platform for express cleaners who want stable opportunities, fair treatment, and a respectful relationship with the families they serve. If you are ready to build consistent express cleaning work with families who appreciate speed and reliability, the waitlist is the first step.",
      servicePrompt: "What other services can you offer?",
      concernPrompt: "What should families value most about your profile?",
    },
  },
  payloadKey: "express_cleaning_waitlist",
  whatsappText: "Send me WhatsApp updates when express cleaning onboarding opens.",
  shareText: "I just joined Homebit's express cleaning waitlist. If you know a family looking for trusted urgent cleaning services, share this with them.",
};

export default function ExpressCleaningWaitlistPage() {
  return <ServiceWaitlistPage config={config} />;
}
