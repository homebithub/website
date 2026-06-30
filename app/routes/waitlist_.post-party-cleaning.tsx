import { ServiceWaitlistPage } from "~/components/ServiceWaitlistPage";

export const meta = () => [
  { title: "Post Party Cleaning Waitlist — Homebit" },
  {
    name: "description",
    content:
      "Join Homebit's post party cleaning waitlist as a household or househelp and get early access.",
  },
];

const config = {
  serviceSlug: "post-party-cleaning",
  serviceName: "Post Party Cleaning",
  serviceOptions: [
    "Post Party Cleaning",
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
    "Plumbing",
  ],
  profileCopy: {
    household: {
      heading: "Looking for post party cleaning?",
      paragraph:
        "Join the post party cleaning waitlist to get early access to Homebit's trusted cleaning professionals. We know how exhausting it is to clean up after hosting events and gatherings. Homebit is building a safer, faster way for families to find dependable post-party cleaners by combining real human vetting with smart matching. Every cleaner on our platform goes through identity checks, reference reviews, and skills screening, so you are not starting from scratch or guessing based on a few text messages. We focus on post-party cleaning that restores your home to its original state, whether you need cleanup after dinner parties, birthday celebrations, holiday gatherings, or large events. You will be able to describe your cleaning needs, the size of your event, the type of cleanup required, and any specific areas that need attention. As the waitlist moves forward, we will share updates, service availability, and onboarding timelines so you can plan with confidence. Homebit is not just a list of names; it is a cleaning experience built around trust, thoroughness, and reliability. If you want a single place to find post-party cleaning and additional household services without the stress of endless searching, this is the right place to start.",
      servicePrompt: "Would you need additional services?",
      concernPrompt: "Biggest concern",
    },
    househelp: {
      heading: "You offer post party cleaning services?",
      paragraph:
        "Join the post party cleaning waitlist to be among the first cleaning professionals households discover on Homebit. We are creating a trusted marketplace where cleaners can present their skills with confidence and be matched to families who value thorough event cleanup. If you have experience with post-party cleaning, event cleanup, deep cleaning after gatherings, waste management, or specialized restoration services, Homebit will help you highlight that expertise. Our onboarding focuses on verification, references, and service details so families can trust you from the first interaction, and so you do not have to keep proving yourself repeatedly for every inquiry. You will be able to list the services you offer, your preferred schedules, and the kind of event cleanup projects you specialize in. As we open access, we will prioritize waitlisted professionals, share new family requests early, and provide guidance on how to stand out with clear profiles and professional communication. Homebit is more than a job board; it is a long-term platform for cleaners who want stable opportunities, fair treatment, and a respectful relationship with the families they serve. If you are ready to build consistent post-party cleaning work with families who appreciate thoroughness and reliability, the waitlist is the first step.",
      servicePrompt: "What other services can you offer?",
      concernPrompt: "What should families value most about your profile?",
    },
  },
  payloadKey: "post_party_cleaning_waitlist",
  whatsappText: "Send me WhatsApp updates when post party cleaning onboarding opens.",
  shareText: "I just joined Homebit's post party cleaning waitlist. If you know a family looking for trusted event cleanup services, share this with them.",
};

export default function PostPartyCleaningWaitlistPage() {
  return <ServiceWaitlistPage config={config} />;
}
