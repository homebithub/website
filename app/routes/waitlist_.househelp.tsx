import { ServiceWaitlistPage } from "~/components/ServiceWaitlistPage";

export const meta = () => [
  { title: "Househelp Waitlist — Homebit" },
  {
    name: "description",
    content:
      "Join Homebit's househelp waitlist as a household or househelp and get early access.",
  },
];

const config = {
  serviceSlug: "househelp",
  serviceName: "Househelp",
  serviceOptions: [
    "Househelp",
    "Elderly Care",
    "Special Needs People Care",
    "Overnight Care",
    "Indoor Cleaning",
    "Home Deep Cleaning",
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
      heading: "Looking for a trusted househelp?",
      paragraph:
        "Join the househelp waitlist to get early access to Homebit's trusted household professionals. We know how hard it is to find someone you can trust in your home with your family and belongings. Homebit is building a safer, faster way for families to find dependable househelp by combining real human vetting with smart matching. Every househelp on our platform goes through identity checks, reference reviews, and skills screening, so you are not starting from scratch or guessing based on a few text messages. We focus on care that respects your home, your family, and your routines, whether you need daily housekeeping, cooking, childcare support, or comprehensive household management. You will be able to describe your household needs, the kind of personality that works best for your home, preferred schedules, and any specific requirements or cultural considerations. As the waitlist moves forward, we will share updates, service availability, and onboarding timelines so you can plan with confidence. Homebit is not just a list of names; it is a household experience built around trust, safety, and reliability. If you want a single place to find househelp and additional support services without the stress of endless searching, this is the right place to start.",
      servicePrompt: "Would you need additional services?",
      concernPrompt: "Biggest concern",
    },
    househelp: {
      heading: "You offer househelp services?",
      paragraph:
        "Join the househelp waitlist to be among the first household professionals families discover on Homebit. We are creating a trusted marketplace where househelps can present their skills with confidence and be matched to families who value quality household support. If you have experience with housekeeping, cooking, childcare, elder care, or comprehensive household management, Homebit will help you highlight that expertise. Our onboarding focuses on verification, references, and service details so families can trust you from the first interaction, and so you do not have to keep proving yourself repeatedly for every inquiry. You will be able to list the services you offer, your preferred schedules, and the kind of household environments you work best in. As we open access, we will prioritize waitlisted professionals, share new family requests early, and provide guidance on how to stand out with clear profiles and professional communication. Homebit is more than a job board; it is a long-term platform for househelps who want stable opportunities, fair treatment, and a respectful relationship with the families they serve. If you are ready to build consistent househelp work with families who appreciate reliability and professionalism, the waitlist is the first step.",
      servicePrompt: "What other services can you offer?",
      concernPrompt: "What should families value most about your profile?",
    },
  },
  payloadKey: "househelp_waitlist",
  whatsappText: "Send me WhatsApp updates when househelp onboarding opens.",
  shareText: "I just joined Homebit's househelp waitlist. If you know a family looking for trusted household support, share this with them.",
};

export default function HousehelpWaitlistPage() {
  return <ServiceWaitlistPage config={config} />;
}
