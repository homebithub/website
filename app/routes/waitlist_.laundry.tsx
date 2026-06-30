import { ServiceWaitlistPage } from "~/components/ServiceWaitlistPage";

export const meta = () => [
  { title: "Laundry & Ironing Waitlist — Homebit" },
  {
    name: "description",
    content:
      "Join Homebit's laundry & ironing waitlist as a household or househelp and get early access.",
  },
];

const config = {
  serviceSlug: "laundry",
  serviceName: "Laundry & Ironing",
  serviceOptions: [
    "Laundry & Ironing",
    "Househelp",
    "Indoor Cleaning",
    "Home Deep Cleaning",
    "Elderly Care",
    "Special Needs People Care",
    "Overnight Care",
    "Meal Preps",
    "Pet Care",
    "Baby Sitter",
    "Early Childhood Care",
    "Post Party Cleaning",
    "Plumbing",
  ],
  profileCopy: {
    household: {
      heading: "Looking for laundry & ironing services?",
      paragraph:
        "Join the laundry & ironing waitlist to get early access to Homebit's trusted laundry professionals. We know how hard it is to find someone you can trust with your clothes and linens. Homebit is building a safer, faster way for families to find dependable laundry help by combining real human vetting with smart matching. Every laundry professional on our platform goes through identity checks, reference reviews, and skills screening, so you are not starting from scratch or guessing based on a few text messages. We focus on laundry care that respects your fabrics, your preferences, and your schedule, whether you need regular wash-and-fold, ironing services, or specialized care for delicate items. You will be able to describe your laundry needs, the volume and types of items, preferred schedules, and any specific care instructions or eco-friendly preferences. As the waitlist moves forward, we will share updates, service availability, and onboarding timelines so you can plan with confidence. Homebit is not just a list of names; it is a laundry experience built around trust, quality, and reliability. If you want a single place to find laundry services and additional household support without the stress of endless searching, this is the right place to start.",
      servicePrompt: "Would you need additional services?",
      concernPrompt: "Biggest concern",
    },
    househelp: {
      heading: "You offer laundry & ironing services?",
      paragraph:
        "Join the laundry & ironing waitlist to be among the first laundry professionals households discover on Homebit. We are creating a trusted marketplace where laundry professionals can present their skills with confidence and be matched to families who value quality garment care. If you have experience with wash-and-fold services, ironing, fabric care, stain treatment, or specialized garment handling, Homebit will help you highlight that expertise. Our onboarding focuses on verification, references, and service details so families can trust you from the first interaction, and so you do not have to keep proving yourself repeatedly for every inquiry. You will be able to list the services you offer, your preferred schedules, and the kind of laundry projects you specialize in. As we open access, we will prioritize waitlisted professionals, share new family requests early, and provide guidance on how to stand out with clear profiles and professional communication. Homebit is more than a job board; it is a long-term platform for laundry professionals who want stable opportunities, fair treatment, and a respectful relationship with the families they serve. If you are ready to build consistent laundry work with families who appreciate quality and reliability, the waitlist is the first step.",
      servicePrompt: "What other services can you offer?",
      concernPrompt: "What should families value most about your profile?",
    },
  },
  payloadKey: "laundry_waitlist",
  whatsappText: "Send me WhatsApp updates when laundry & ironing onboarding opens.",
  shareText: "I just joined Homebit's laundry & ironing waitlist. If you know a family looking for trusted laundry services, share this with them.",
};

export default function LaundryWaitlistPage() {
  return <ServiceWaitlistPage config={config} />;
}
