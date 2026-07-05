import { ServiceWaitlistPage } from "~/components/ServiceWaitlistPage";

export const meta = () => [
  { title: "Moving Cleaning Waitlist — Homebit" },
  {
    name: "description",
    content:
      "Join Homebit's moving cleaning waitlist as a household or househelp and get early access.",
  },
];

const config = {
  serviceSlug: "moving-cleaning",
  serviceName: "Moving Cleaning",
  serviceOptions: [
    "Moving Cleaning",
    "Home Deep Cleaning",
    "Indoor Cleaning",
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
      heading: "Looking for moving cleaning services?",
      paragraph:
        "Join the moving cleaning waitlist to get early access to Homebit's trusted moving cleaning professionals. We know how stressful moving can be and how important it is to leave your old space spotless or prepare your new home properly. Homebit is building a safer, faster way for families to find dependable moving cleaners by combining real human vetting with smart matching. Every moving cleaner on our platform goes through identity checks, reference reviews, and skills screening, so you are not starting from scratch or guessing based on a few text messages. We focus on moving cleaning that respects your property, your timeline, and your move-in/move-out requirements, whether you need move-out cleaning, move-in preparation, or both. You will be able to describe your moving cleaning needs, the size and type of your property, your move dates, and any specific requirements or landlord expectations. As the waitlist moves forward, we will share updates, service availability, and onboarding timelines so you can plan with confidence. Homebit is not just a list of names; it is a moving cleaning experience built around trust, thoroughness, and reliability. If you want a single place to find moving cleaning and additional household services without the stress of endless searching, this is the right place to start.",
      servicePrompt: "Would you need additional services?",
      concernPrompt: "Biggest concern",
    },
    househelp: {
      heading: "You offer moving cleaning services?",
      paragraph:
        "Join the moving cleaning waitlist to be among the first moving cleaning professionals households discover on Homebit. We are creating a trusted marketplace where moving cleaners can present their skills with confidence and be matched to families who value thorough move-in/move-out cleaning. If you have experience with move-out cleaning, move-in preparation, deep cleaning for property handover, specialized surface restoration, or time-sensitive cleaning projects, Homebit will help you highlight that expertise. Our onboarding focuses on verification, references, and service details so families can trust you from the first interaction, and so you do not have to keep proving yourself repeatedly for every inquiry. You will be able to list the services you offer, your preferred schedules, and the kind of moving cleaning projects you specialize in. As we open access, we will prioritize waitlisted professionals, share new family requests early, and provide guidance on how to stand out with clear profiles and professional communication. Homebit is more than a job board; it is a long-term platform for moving cleaners who want stable opportunities, fair treatment, and a respectful relationship with the families they serve. If you are ready to build consistent moving cleaning work with families who appreciate thoroughness and reliability, the waitlist is the first step.",
      servicePrompt: "What other services can you offer?",
      concernPrompt: "What should families value most about your profile?",
    },
  },
  payloadKey: "moving_cleaning_waitlist",
  whatsappText: "Send me WhatsApp updates when moving cleaning onboarding opens.",
  shareText: "I just joined Homebit's moving cleaning waitlist. If you know a family looking for trusted moving cleaning services, share this with them.",
};

export default function MovingCleaningWaitlistPage() {
  return <ServiceWaitlistPage config={config} />;
}
