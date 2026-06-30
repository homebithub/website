import { ServiceWaitlistPage } from "~/components/ServiceWaitlistPage";

export const meta = () => [
  { title: "Deep Cleaning Waitlist — Homebit" },
  {
    name: "description",
    content:
      "Join Homebit's deep cleaning waitlist as a household or househelp and get early access.",
  },
];

const config = {
  serviceSlug: "deep-cleaning",
  serviceName: "Deep Cleaning",
  serviceOptions: [
    "Home Deep Cleaning",
    "Indoor Cleaning",
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
      heading: "Looking for deep cleaning services?",
      paragraph:
        "Join the deep cleaning waitlist to get early access to Homebit's trusted deep cleaning professionals. We know how hard it is to find someone who can thoroughly clean your home from top to bottom. Homebit is building a safer, faster way for families to find dependable deep cleaners by combining real human vetting with smart matching. Every cleaner on our platform goes through identity checks, reference reviews, and skills screening, so you are not starting from scratch or guessing based on a few text messages. We focus on deep cleaning that transforms your living space, whether you need move-out cleaning, spring cleaning, post-renovation cleanup, or periodic deep cleans for maintenance. You will be able to describe your deep cleaning needs, the size and type of your home, preferred schedules, and any specific areas that need special attention. As the waitlist moves forward, we will share updates, service availability, and onboarding timelines so you can plan with confidence. Homebit is not just a list of names; it is a cleaning experience built around trust, thoroughness, and reliability. If you want a single place to find deep cleaning and additional household services without the stress of endless searching, this is the right place to start.",
      servicePrompt: "Would you need additional services?",
      concernPrompt: "Biggest concern",
    },
    househelp: {
      heading: "You offer deep cleaning services?",
      paragraph:
        "Join the deep cleaning waitlist to be among the first deep cleaning professionals households discover on Homebit. We are creating a trusted marketplace where cleaners can present their skills with confidence and be matched to families who value thorough, high-quality cleaning. If you have experience with deep cleaning, move-out cleaning, post-renovation cleanup, specialized surface restoration, or comprehensive home sanitization, Homebit will help you highlight that expertise. Our onboarding focuses on verification, references, and service details so families can trust you from the first interaction, and so you do not have to keep proving yourself repeatedly for every inquiry. You will be able to list the services you offer, your preferred schedules, and the kind of cleaning projects you specialize in. As we open access, we will prioritize waitlisted professionals, share new family requests early, and provide guidance on how to stand out with clear profiles and professional communication. Homebit is more than a job board; it is a long-term platform for cleaners who want stable opportunities, fair treatment, and a respectful relationship with the families they serve. If you are ready to build consistent deep cleaning work with families who appreciate thoroughness and quality, the waitlist is the first step.",
      servicePrompt: "What other services can you offer?",
      concernPrompt: "What should families value most about your profile?",
    },
  },
  payloadKey: "deep_cleaning_waitlist",
  whatsappText: "Send me WhatsApp updates when deep cleaning onboarding opens.",
  shareText: "I just joined Homebit's deep cleaning waitlist. If you know a family looking for trusted deep cleaning services, share this with them.",
};

export default function DeepCleaningWaitlistPage() {
  return <ServiceWaitlistPage config={config} />;
}
