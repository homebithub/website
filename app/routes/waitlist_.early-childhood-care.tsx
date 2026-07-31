import { ServiceWaitlistPage } from "~/components/ServiceWaitlistPage";

export const meta = () => [
  { title: "Early Childhood Care Waitlist — Homebit" },
  {
    name: "description",
    content:
      "Join Homebit's early childhood care waitlist as a household or househelp and get early access.",
  },
];

const config = {
  serviceSlug: "early-childhood-care",
  serviceName: "Early Childhood Care",
  serviceOptions: [
    "Early Childhood Care",
    "Baby Sitter",
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
      heading: "Looking for early childhood care?",
      paragraph:
        "Join the early childhood care waitlist to get early access to Homebit's trusted childcare professionals. We know how hard it is to find someone who can provide nurturing, developmentally appropriate care for young children. Homebit is building a safer, faster way for families to find dependable early childhood caregivers by combining real human vetting with smart matching. Every caregiver on our platform goes through identity checks, reference reviews, and skills screening, so you are not starting from scratch or guessing based on a few text messages. We focus on early childhood care that supports your child's development, respects their individuality, and gives you peace of mind, whether you need full-time childcare, part-time support, or specialized early learning activities. You will be able to describe your childcare needs, your child's age and developmental stage, preferred schedules, and any specific educational or care requirements. As the waitlist moves forward, we will share updates, service availability, and onboarding timelines so you can plan with confidence. Homebit is not just a list of names; it is an early childhood experience built around trust, development, and reliability. If you want a single place to find early childhood care and additional household support without the stress of endless searching, this is the right place to start.",
      servicePrompt: "Would you need additional services?",
      concernPrompt: "Biggest concern",
    },
    househelp: {
      heading: "You offer early childhood care?",
      paragraph:
        "Join the early childhood care waitlist to be among the first early childhood professionals households discover on Homebit. We are creating a trusted marketplace where early childhood caregivers can present their skills with confidence and be matched to families who value quality developmental care. If you have experience with early childhood education, developmental activities, preschool preparation, toddler care, or specialized learning support, Homebit will help you highlight that expertise. Our onboarding focuses on verification, references, and service details so families can trust you from the first interaction, and so you do not have to keep proving yourself repeatedly for every inquiry. You will be able to list the services you offer, your preferred schedules, and the age groups and developmental areas you specialize in. As we open access, we will prioritize waitlisted professionals, share new family requests early, and provide guidance on how to stand out with clear profiles and professional communication. Homebit is more than a job board; it is a long-term platform for early childhood professionals who want stable opportunities, fair treatment, and a respectful relationship with the families they serve. If you are ready to build consistent early childhood care work with families who appreciate developmental expertise and trust, the waitlist is the first step.",
      servicePrompt: "What other services can you offer?",
      concernPrompt: "What should families value most about your profile?",
    },
  },
  payloadKey: "early_childhood_care_waitlist",
  whatsappText: "Send me WhatsApp updates when early childhood care onboarding opens.",
  shareText: "I just joined Homebit's early childhood care waitlist. If you know a family looking for trusted developmental childcare, share this with them.",
};

export default function EarlyChildhoodCareWaitlistPage() {
  return <ServiceWaitlistPage config={config} />;
}
