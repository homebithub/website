import { ServiceWaitlistPage } from "~/components/ServiceWaitlistPage";

export const meta = () => [
  { title: "Office Cleaning Waitlist — Homebit" },
  {
    name: "description",
    content:
      "Join Homebit's office cleaning waitlist as a household or service provider and get early access.",
  },
];

const config = {
  serviceSlug: "office-cleaning",
  serviceName: "Office Cleaning",
  serviceOptions: [
    "Office Cleaning",
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
      heading: "Looking for office cleaning services?",
      paragraph:
        "Join the office cleaning waitlist to get early access to Homebit's trusted office cleaning professionals. We know how hard it is to find someone who can maintain your workspace professionally. Homebit is building a safer, faster way for businesses to find dependable office cleaners by combining real human vetting with smart matching. Every office cleaner on our platform goes through identity checks, reference reviews, and skills screening, so you are not starting from scratch or guessing based on a few text messages. We focus on office cleaning that respects your workspace, your equipment, and your schedule, whether you need daily cleaning, weekly maintenance, or specialized office care. You will be able to describe your office cleaning needs, the size and type of your workspace, preferred schedules, and any specific requirements or security considerations. As the waitlist moves forward, we will share updates, service availability, and onboarding timelines so you can plan with confidence. Homebit is not just a list of names; it is an office cleaning experience built around trust, quality, and reliability. If you want a single place to find office cleaning and additional professional services without the stress of endless searching, this is the right place to start.",
      servicePrompt: "Would you need additional services?",
      concernPrompt: "Biggest concern",
    },
    service_provider: {
      heading: "You offer office cleaning services?",
      paragraph:
        "Join the office cleaning waitlist to be among the first office cleaning professionals businesses discover on Homebit. We are creating a trusted marketplace where office cleaners can present their skills with confidence and be matched to businesses who value professional workspace maintenance. If you have experience with office cleaning, workspace maintenance, commercial cleaning, specialized equipment care, or professional service delivery, Homebit will help you highlight that expertise. Our onboarding focuses on verification, references, and service details so businesses can trust you from the first interaction, and so you do not have to keep proving yourself repeatedly for every inquiry. You will be able to list the services you offer, your preferred schedules, and the kind of office cleaning projects you specialize in. As we open access, we will prioritize waitlisted professionals, share new business requests early, and provide guidance on how to stand out with clear profiles and professional communication. Homebit is more than a job board; it is a long-term platform for office cleaners who want stable opportunities, fair treatment, and a respectful relationship with the businesses they serve. If you are ready to build consistent office cleaning work with businesses who appreciate quality and reliability, the waitlist is the first step.",
      servicePrompt: "What other services can you offer?",
      concernPrompt: "What should businesses value most about your profile?",
    },
  },
  payloadKey: "office_cleaning_waitlist",
  whatsappText: "Send me WhatsApp updates when office cleaning onboarding opens.",
  shareText: "I just joined Homebit's office cleaning waitlist. If you know a business looking for trusted office cleaning services, share this with them.",
};

export default function OfficeCleaningWaitlistPage() {
  return <ServiceWaitlistPage config={config} />;
}
