import { ServiceWaitlistPage } from "~/components/ServiceWaitlistPage";

export const meta = () => [
  { title: "Overnight Care Waitlist — Homebit" },
  {
    name: "description",
    content:
      "Join Homebit's overnight care waitlist as a household or househelp and get early access.",
  },
];

const config = {
  serviceSlug: "overnight-care",
  serviceName: "Overnight Care",
  serviceOptions: [
    "Overnight Care",
    "Elderly Care",
    "Special Needs People Care",
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
      heading: "Need overnight care support?",
      paragraph:
        "Join the overnight care waitlist to get early access to Homebit's trusted overnight caregivers and househelps. We know how challenging it is to find someone you can trust to stay overnight with your loved ones. Homebit is building a safer, faster way for families to find dependable overnight care by combining real human vetting with smart matching. Every caregiver and househelp on our platform goes through identity checks, reference reviews, and skills screening, so you are not starting from scratch or guessing based on a few text messages. We focus on care that respects dignity, safety, and peace of mind, whether you need overnight supervision for elders, children, or family members with special needs. You will be able to describe your overnight care requirements, the kind of personality that works best for your home, preferred schedules, and any specific nighttime routines or monitoring needs. As the waitlist moves forward, we will share updates, service availability, and onboarding timelines so you can plan with confidence. Homebit is not just a list of names; it is a care experience built around trust, safety, and reliability. If you want a single place to find overnight care and additional support services without the stress of endless searching, this is the right place to start.",
      servicePrompt: "Would you need additional services?",
      concernPrompt: "Biggest concern",
    },
    househelp: {
      heading: "You offer overnight care?",
      paragraph:
        "Join the overnight care waitlist to be among the first care professionals households discover on Homebit. We are creating a trusted marketplace where caregivers and househelps can present their skills with confidence and be matched to families who value quality care. If you have experience with overnight supervision, nighttime monitoring, elder care, child care, or supporting family members who need round-the-clock attention, Homebit will help you highlight that expertise. Our onboarding focuses on verification, references, and service details so families can trust you from the first interaction, and so you do not have to keep proving yourself repeatedly for every inquiry. You will be able to list the services you offer, your preferred schedules, and the kind of care environments you work best in. As we open access, we will prioritize waitlisted professionals, share new family requests early, and provide guidance on how to stand out with clear profiles and professional communication. Homebit is more than a job board; it is a long-term platform for caregivers who want stable opportunities, fair treatment, and a respectful relationship with the families they serve. If you are ready to build consistent overnight care work with families who appreciate reliability and trust, the waitlist is the first step.",
      servicePrompt: "What other services can you offer?",
      concernPrompt: "What should families value most about your profile?",
    },
  },
  payloadKey: "overnight_care_waitlist",
  whatsappText: "Send me WhatsApp updates when overnight care onboarding opens.",
  shareText: "I just joined Homebit's overnight care waitlist. If you know a family looking for trusted overnight support, share this with them.",
};

export default function OvernightCareWaitlistPage() {
  return <ServiceWaitlistPage config={config} />;
}
