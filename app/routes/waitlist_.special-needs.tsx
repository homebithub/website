import { ServiceWaitlistPage } from "~/components/ServiceWaitlistPage";

export const meta = () => [
  { title: "Special Needs Care Waitlist — Homebit" },
  {
    name: "description",
    content:
      "Join Homebit's special needs care waitlist as a household or househelp and get early access.",
  },
];

const config = {
  serviceSlug: "special-needs",
  serviceName: "Special Needs Care",
  serviceOptions: [
    "Special Needs People Care",
    "Elderly Care",
    "Overnight Care",
    "Househelp",
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
      heading: "Looking for special needs care support?",
      paragraph:
        "Join the special needs care waitlist to get early access to Homebit's trusted caregivers and support professionals. We understand that caring for someone with special needs requires patience, training, and genuine compassion. Homebit is building a safer, faster way for families to find dependable care for loved ones with special needs by combining real human vetting with smart matching. Every caregiver and househelp on our platform goes through identity checks, reference reviews, and skills screening, so you are not starting from scratch or guessing based on a few text messages. We focus on care that respects dignity, individual needs, and family routines, whether you need daily support, respite care, or assistance with specific therapies or activities. You will be able to describe your loved one's needs, the kind of personality that works best, preferred schedules, and any medical or behavioral considerations. As the waitlist moves forward, we will share updates, service availability, and onboarding timelines so you can plan with confidence. Homebit is not just a list of names; it is a care experience built around trust, safety, and reliability. If you want a single place to find special needs care and additional support services without the stress of endless searching, this is the right place to start.",
      servicePrompt: "Would you need additional services?",
      concernPrompt: "Biggest concern",
    },
    househelp: {
      heading: "You offer special needs care?",
      paragraph:
        "Join the special needs care waitlist to be among the first care professionals households discover on Homebit. We are creating a trusted marketplace where caregivers and househelps can present their skills with confidence and be matched to families who value quality care. If you have experience with special needs support, behavioral assistance, therapy accompaniment, sensory-friendly care, or routines that help individuals with special needs thrive, Homebit will help you highlight that expertise. Our onboarding focuses on verification, references, and service details so families can trust you from the first interaction, and so you do not have to keep proving yourself repeatedly for every inquiry. You will be able to list the services you offer, your preferred schedules, and the kind of care environments you work best in. As we open access, we will prioritize waitlisted professionals, share new family requests early, and provide guidance on how to stand out with clear profiles and professional communication. Homebit is more than a job board; it is a long-term platform for caregivers who want stable opportunities, fair treatment, and a respectful relationship with the families they serve. If you are ready to build consistent special needs care work with families who appreciate patience and expertise, the waitlist is the first step.",
      servicePrompt: "What other services can you offer?",
      concernPrompt: "What should families value most about your profile?",
    },
  },
  payloadKey: "special_needs_waitlist",
  whatsappText: "Send me WhatsApp updates when special needs care onboarding opens.",
  shareText: "I just joined Homebit's special needs care waitlist. If you know a family looking for trusted special needs support, share this with them.",
};

export default function SpecialNeedsWaitlistPage() {
  return <ServiceWaitlistPage config={config} />;
}
