import { ServiceWaitlistPage } from "~/components/ServiceWaitlistPage";

export const meta = () => [
  { title: "Baby Sitter Waitlist — Homebit" },
  {
    name: "description",
    content:
      "Join Homebit's baby sitter waitlist as a household or househelp and get early access.",
  },
];

const config = {
  serviceSlug: "baby-sitter",
  serviceName: "Baby Sitter",
  serviceOptions: [
    "Baby Sitter",
    "Early Childhood Care",
    "Househelp",
    "Indoor Cleaning",
    "Home Deep Cleaning",
    "Laundry & Ironing",
    "Meal Preps",
    "Pet Care",
    "Elderly Care",
    "Special Needs People Care",
    "Overnight Care",
    "Post Party Cleaning",
    "Plumbing",
  ],
  profileCopy: {
    household: {
      heading: "Looking for a baby sitter?",
      paragraph:
        "Join the baby sitter waitlist to get early access to Homebit's trusted childcare professionals. We know how hard it is to find someone you can trust with your children. Homebit is building a safer, faster way for families to find dependable baby sitters by combining real human vetting with smart matching. Every baby sitter on our platform goes through identity checks, reference reviews, and skills screening, so you are not starting from scratch or guessing based on a few text messages. We focus on childcare that respects your children, their routines, and your peace of mind, whether you need occasional babysitting, regular childcare, or specialized infant care. You will be able to describe your childcare needs, your children's ages, preferred schedules, and any specific care requirements or developmental considerations. As the waitlist moves forward, we will share updates, service availability, and onboarding timelines so you can plan with confidence. Homebit is not just a list of names; it is a childcare experience built around trust, safety, and reliability. If you want a single place to find baby sitters and additional household support without the stress of endless searching, this is the right place to start.",
      servicePrompt: "Would you need additional services?",
      concernPrompt: "Biggest concern",
    },
    househelp: {
      heading: "You offer baby sitting services?",
      paragraph:
        "Join the baby sitter waitlist to be among the first childcare professionals households discover on Homebit. We are creating a trusted marketplace where baby sitters can present their skills with confidence and be matched to families who value quality childcare. If you have experience with infant care, toddler supervision, developmental activities, after-school care, or specialized childcare support, Homebit will help you highlight that expertise. Our onboarding focuses on verification, references, and service details so families can trust you from the first interaction, and so you do not have to keep proving yourself repeatedly for every inquiry. You will be able to list the services you offer, your preferred schedules, and the age groups you specialize in caring for. As we open access, we will prioritize waitlisted professionals, share new family requests early, and provide guidance on how to stand out with clear profiles and professional communication. Homebit is more than a job board; it is a long-term platform for childcare professionals who want stable opportunities, fair treatment, and a respectful relationship with the families they serve. If you are ready to build consistent babysitting work with families who appreciate reliability and trust, the waitlist is the first step.",
      servicePrompt: "What other services can you offer?",
      concernPrompt: "What should families value most about your profile?",
    },
  },
  payloadKey: "baby_sitter_waitlist",
  whatsappText: "Send me WhatsApp updates when baby sitter onboarding opens.",
  shareText: "I just joined Homebit's baby sitter waitlist. If you know a family looking for trusted childcare services, share this with them.",
};

export default function BabySitterWaitlistPage() {
  return <ServiceWaitlistPage config={config} />;
}
