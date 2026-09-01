import { ServiceWaitlistPage } from "~/components/ServiceWaitlistPage";

export const meta = () => [
  { title: "New Mothers Help Waitlist — Homebit" },
  {
    name: "description",
    content:
      "Join Homebit's new mothers help waitlist as a household or service provider and get early access.",
  },
];

const config = {
  serviceSlug: "new-mothers-help",
  serviceName: "New Mothers Help",
  serviceOptions: [
    "New Mothers Help",
    "Baby Sitter",
    "Early Childhood Care",
    "Service provider",
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
      heading: "Looking for new mothers help?",
      paragraph:
        "Join the new mothers help waitlist to get early access to Homebit's trusted postpartum care professionals. We know how challenging the postpartum period can be and how important it is to have gentle, reliable support during this time. Homebit is building a safer, faster way for families to find dependable postpartum caregivers by combining real human vetting with smart matching. Every postpartum caregiver on our platform goes through identity checks, reference reviews, and skills screening, so you are not starting from scratch or guessing based on a few text messages. We focus on postpartum care that respects your family, your recovery, and your newborn, whether you need help with household tasks, infant care support, or gentle assistance during your adjustment period. You will be able to describe your postpartum care needs, your family situation, preferred schedules, and any specific requirements or support preferences. As the waitlist moves forward, we will share updates, service availability, and onboarding timelines so you can plan with confidence. Homebit is not just a list of names; it is a postpartum care experience built around trust, compassion, and reliability. If you want a single place to find new mothers help and additional household support without the stress of endless searching, this is the right place to start.",
      servicePrompt: "Would you need additional services?",
      concernPrompt: "Biggest concern",
    },
    service_provider: {
      heading: "You offer new mothers help?",
      paragraph:
        "Join the new mothers help waitlist to be among the first postpartum care professionals households discover on Homebit. We are creating a trusted marketplace where postpartum caregivers can present their skills with confidence and be matched to families who value gentle, experienced support during the postpartum period. If you have experience with postpartum care, infant support, household assistance for new mothers, newborn care, or family adjustment support, Homebit will help you highlight that expertise. Our onboarding focuses on verification, references, and service details so families can trust you from the first interaction, and so you do not have to keep proving yourself repeatedly for every inquiry. You will be able to list the services you offer, your preferred schedules, and the kind of postpartum care projects you specialize in. As we open access, we will prioritize waitlisted professionals, share new family requests early, and provide guidance on how to stand out with clear profiles and professional communication. Homebit is more than a job board; it is a long-term platform for postpartum caregivers who want stable opportunities, fair treatment, and a respectful relationship with the families they serve. If you are ready to build consistent postpartum care work with families who appreciate compassion and reliability, the waitlist is the first step.",
      servicePrompt: "What other services can you offer?",
      concernPrompt: "What should families value most about your profile?",
    },
  },
  payloadKey: "new_mothers_help_waitlist",
  whatsappText: "Send me WhatsApp updates when new mothers help onboarding opens.",
  shareText: "I just joined Homebit's new mothers help waitlist. If you know a family looking for trusted postpartum support, share this with them.",
};

export default function NewMothersHelpWaitlistPage() {
  return <ServiceWaitlistPage config={config} />;
}
