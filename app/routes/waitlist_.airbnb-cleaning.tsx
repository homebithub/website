import { ServiceWaitlistPage } from "~/components/ServiceWaitlistPage";

export const meta = () => [
  { title: "Airbnb Cleaning Waitlist — Homebit" },
  {
    name: "description",
    content:
      "Join Homebit's Airbnb cleaning waitlist as a household or service provider and get early access.",
  },
];

const config = {
  serviceSlug: "airbnb-cleaning",
  serviceName: "Airbnb Cleaning",
  serviceOptions: [
    "Airbnb Cleaning",
    "Home Deep Cleaning",
    "Indoor Cleaning",
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
      heading: "Looking for Airbnb cleaning services?",
      paragraph:
        "Join the Airbnb cleaning waitlist to get early access to Homebit's trusted short-stay cleaning professionals. We know how critical turnover cleaning is for maintaining your property's reputation and guest satisfaction. Homebit is building a safer, faster way for hosts to find dependable Airbnb cleaners by combining real human vetting with smart matching. Every Airbnb cleaner on our platform goes through identity checks, reference reviews, and skills screening, so you are not starting from scratch or guessing based on a few text messages. We focus on turnover cleaning that respects your property, your guests, and your schedule, whether you need same-day turnovers, regular cleaning between bookings, or specialized short-stay property care. You will be able to describe your Airbnb cleaning needs, the size and type of your property, your booking schedule, and any specific requirements or guest expectations. As the waitlist moves forward, we will share updates, service availability, and onboarding timelines so you can plan with confidence. Homebit is not just a list of names; it is an Airbnb cleaning experience built around trust, quality, and reliability. If you want a single place to find Airbnb cleaning and additional property services without the stress of endless searching, this is the right place to start.",
      servicePrompt: "Would you need additional services?",
      concernPrompt: "Biggest concern",
    },
    service_provider: {
      heading: "You offer Airbnb cleaning services?",
      paragraph:
        "Join the Airbnb cleaning waitlist to be among the first Airbnb cleaning professionals hosts discover on Homebit. We are creating a trusted marketplace where Airbnb cleaners can present their skills with confidence and be matched to hosts who value reliable, thorough turnover cleaning. If you have experience with Airbnb cleaning, short-stay property turnover, guest-ready cleaning, time-sensitive cleaning, or hospitality-focused service, Homebit will help you highlight that expertise. Our onboarding focuses on verification, references, and service details so hosts can trust you from the first interaction, and so you do not have to keep proving yourself repeatedly for every inquiry. You will be able to list the services you offer, your preferred schedules, and the kind of Airbnb cleaning projects you specialize in. As we open access, we will prioritize waitlisted professionals, share new host requests early, and provide guidance on how to stand out with clear profiles and professional communication. Homebit is more than a job board; it is a long-term platform for Airbnb cleaners who want stable opportunities, fair treatment, and a respectful relationship with the hosts they serve. If you are ready to build consistent Airbnb cleaning work with hosts who appreciate quality and reliability, the waitlist is the first step.",
      servicePrompt: "What other services can you offer?",
      concernPrompt: "What should hosts value most about your profile?",
    },
  },
  payloadKey: "airbnb_cleaning_waitlist",
  whatsappText: "Send me WhatsApp updates when Airbnb cleaning onboarding opens.",
  shareText: "I just joined Homebit's Airbnb cleaning waitlist. If you know a host looking for trusted turnover cleaning services, share this with them.",
};

export default function AirbnbCleaningWaitlistPage() {
  return <ServiceWaitlistPage config={config} />;
}
