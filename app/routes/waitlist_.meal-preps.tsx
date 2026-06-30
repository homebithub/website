import { ServiceWaitlistPage } from "~/components/ServiceWaitlistPage";

export const meta = () => [
  { title: "Meal Preps Waitlist — Homebit" },
  {
    name: "description",
    content:
      "Join Homebit's meal preps waitlist as a household or househelp and get early access.",
  },
];

const config = {
  serviceSlug: "meal-preps",
  serviceName: "Meal Preps",
  serviceOptions: [
    "Meal Preps",
    "Househelp",
    "Indoor Cleaning",
    "Home Deep Cleaning",
    "Laundry & Ironing",
    "Elderly Care",
    "Special Needs People Care",
    "Overnight Care",
    "Pet Care",
    "Baby Sitter",
    "Early Childhood Care",
    "Post Party Cleaning",
    "Plumbing",
  ],
  profileCopy: {
    household: {
      heading: "Looking for meal prep services?",
      paragraph:
        "Join the meal prep waitlist to get early access to Homebit's trusted cooking professionals. We know how hard it is to find someone you can trust to prepare nutritious meals for your family. Homebit is building a safer, faster way for families to find dependable cooks by combining real human vetting with smart matching. Every cook on our platform goes through identity checks, reference reviews, and skills screening, so you are not starting from scratch or guessing based on a few text messages. We focus on meal preparation that respects your dietary preferences, your family's needs, and your schedule, whether you need daily meal prep, weekly batch cooking, or specialized dietary meals. You will be able to describe your meal needs, the number of people, preferred cuisines, dietary restrictions, and any specific nutritional requirements. As the waitlist moves forward, we will share updates, service availability, and onboarding timelines so you can plan with confidence. Homebit is not just a list of names; it is a meal experience built around trust, quality, and reliability. If you want a single place to find meal prep services and additional household support without the stress of endless searching, this is the right place to start.",
      servicePrompt: "Would you need additional services?",
      concernPrompt: "Biggest concern",
    },
    househelp: {
      heading: "You offer meal prep services?",
      paragraph:
        "Join the meal prep waitlist to be among the first cooking professionals households discover on Homebit. We are creating a trusted marketplace where cooks can present their skills with confidence and be matched to families who value nutritious, home-cooked meals. If you have experience with meal prep, batch cooking, dietary restrictions, specialized cuisines, or family meal planning, Homebit will help you highlight that expertise. Our onboarding focuses on verification, references, and service details so families can trust you from the first interaction, and so you do not have to keep proving yourself repeatedly for every inquiry. You will be able to list the services you offer, your preferred schedules, and the kind of meal projects you specialize in. As we open access, we will prioritize waitlisted professionals, share new family requests early, and provide guidance on how to stand out with clear profiles and professional communication. Homebit is more than a job board; it is a long-term platform for cooks who want stable opportunities, fair treatment, and a respectful relationship with the families they serve. If you are ready to build consistent meal prep work with families who appreciate quality and reliability, the waitlist is the first step.",
      servicePrompt: "What other services can you offer?",
      concernPrompt: "What should families value most about your profile?",
    },
  },
  payloadKey: "meal_preps_waitlist",
  whatsappText: "Send me WhatsApp updates when meal preps onboarding opens.",
  shareText: "I just joined Homebit's meal preps waitlist. If you know a family looking for trusted cooking services, share this with them.",
};

export default function MealPrepsWaitlistPage() {
  return <ServiceWaitlistPage config={config} />;
}
