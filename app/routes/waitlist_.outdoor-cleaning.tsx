import { ServiceWaitlistPage } from "~/components/ServiceWaitlistPage";

export const meta = () => [
  { title: "Outdoor Cleaning Waitlist — Homebit" },
  {
    name: "description",
    content:
      "Join Homebit's outdoor cleaning waitlist as a household or househelp and get early access.",
  },
];

const config = {
  serviceSlug: "outdoor-cleaning",
  serviceName: "Outdoor Cleaning",
  serviceOptions: [
    "Outdoor Cleaning",
    "Indoor Cleaning",
    "Home Deep Cleaning",
    "Househelp",
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
      heading: "Looking for outdoor cleaning services?",
      paragraph:
        "Join the outdoor cleaning waitlist to get early access to Homebit's trusted outdoor cleaning professionals. We know how hard it is to find someone who can maintain your outdoor spaces properly. Homebit is building a safer, faster way for families to find dependable outdoor cleaners by combining real human vetting with smart matching. Every outdoor cleaner on our platform goes through identity checks, reference reviews, and skills screening, so you are not starting from scratch or guessing based on a few text messages. We focus on outdoor cleaning that respects your property, your landscaping, and your schedule, whether you need compound maintenance, balcony cleaning, terrace upkeep, or exterior space tidying. You will be able to describe your outdoor cleaning needs, the size and type of your outdoor areas, preferred schedules, and any specific requirements or seasonal considerations. As the waitlist moves forward, we will share updates, service availability, and onboarding timelines so you can plan with confidence. Homebit is not just a list of names; it is an outdoor cleaning experience built around trust, quality, and reliability. If you want a single place to find outdoor cleaning and additional household services without the stress of endless searching, this is the right place to start.",
      servicePrompt: "Would you need additional services?",
      concernPrompt: "Biggest concern",
    },
    househelp: {
      heading: "You offer outdoor cleaning services?",
      paragraph:
        "Join the outdoor cleaning waitlist to be among the first outdoor cleaning professionals households discover on Homebit. We are creating a trusted marketplace where outdoor cleaners can present their skills with confidence and be matched to families who value quality exterior maintenance. If you have experience with compound cleaning, balcony maintenance, terrace upkeep, outdoor space tidying, or specialized exterior cleaning, Homebit will help you highlight that expertise. Our onboarding focuses on verification, references, and service details so families can trust you from the first interaction, and so you do not have to keep proving yourself repeatedly for every inquiry. You will be able to list the services you offer, your preferred schedules, and the kind of outdoor cleaning projects you specialize in. As we open access, we will prioritize waitlisted professionals, share new family requests early, and provide guidance on how to stand out with clear profiles and professional communication. Homebit is more than a job board; it is a long-term platform for outdoor cleaners who want stable opportunities, fair treatment, and a respectful relationship with the families they serve. If you are ready to build consistent outdoor cleaning work with families who appreciate quality and reliability, the waitlist is the first step.",
      servicePrompt: "What other services can you offer?",
      concernPrompt: "What should families value most about your profile?",
    },
  },
  payloadKey: "outdoor_cleaning_waitlist",
  whatsappText: "Send me WhatsApp updates when outdoor cleaning onboarding opens.",
  shareText: "I just joined Homebit's outdoor cleaning waitlist. If you know a family looking for trusted outdoor cleaning services, share this with them.",
};

export default function OutdoorCleaningWaitlistPage() {
  return <ServiceWaitlistPage config={config} />;
}
