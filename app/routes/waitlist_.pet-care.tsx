import { ServiceWaitlistPage } from "~/components/ServiceWaitlistPage";

export const meta = () => [
  { title: "Pet Care Waitlist — Homebit" },
  {
    name: "description",
    content:
      "Join Homebit's pet care waitlist as a household or househelp and get early access.",
  },
];

const config = {
  serviceSlug: "pet-care",
  serviceName: "Pet Care",
  serviceOptions: [
    "Pet Care",
    "Househelp",
    "Indoor Cleaning",
    "Home Deep Cleaning",
    "Laundry & Ironing",
    "Meal Preps",
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
      heading: "Looking for pet care services?",
      paragraph:
        "Join the pet care waitlist to get early access to Homebit's trusted pet care professionals. We know how hard it is to find someone you can trust with your beloved pets. Homebit is building a safer, faster way for families to find dependable pet caregivers by combining real human vetting with smart matching. Every pet caregiver on our platform goes through identity checks, reference reviews, and skills screening, so you are not starting from scratch or guessing based on a few text messages. We focus on pet care that respects your animals, their routines, and their needs, whether you need daily pet sitting, dog walking, feeding services, or overnight pet care. You will be able to describe your pet care needs, the types and number of pets, preferred schedules, and any specific care instructions or behavioral considerations. As the waitlist moves forward, we will share updates, service availability, and onboarding timelines so you can plan with confidence. Homebit is not just a list of names; it is a pet care experience built around trust, compassion, and reliability. If you want a single place to find pet care services and additional household support without the stress of endless searching, this is the right place to start.",
      servicePrompt: "Would you need additional services?",
      concernPrompt: "Biggest concern",
    },
    househelp: {
      heading: "You offer pet care services?",
      paragraph:
        "Join the pet care waitlist to be among the first pet care professionals households discover on Homebit. We are creating a trusted marketplace where pet caregivers can present their skills with confidence and be matched to families who value compassionate animal care. If you have experience with pet sitting, dog walking, feeding, grooming assistance, or specialized care for different animals, Homebit will help you highlight that expertise. Our onboarding focuses on verification, references, and service details so families can trust you from the first interaction, and so you do not have to keep proving yourself repeatedly for every inquiry. You will be able to list the services you offer, your preferred schedules, and the kind of animals you specialize in caring for. As we open access, we will prioritize waitlisted professionals, share new family requests early, and provide guidance on how to stand out with clear profiles and professional communication. Homebit is more than a job board; it is a long-term platform for pet caregivers who want stable opportunities, fair treatment, and a respectful relationship with the families they serve. If you are ready to build consistent pet care work with families who appreciate compassion and reliability, the waitlist is the first step.",
      servicePrompt: "What other services can you offer?",
      concernPrompt: "What should families value most about your profile?",
    },
  },
  payloadKey: "pet_care_waitlist",
  whatsappText: "Send me WhatsApp updates when pet care onboarding opens.",
  shareText: "I just joined Homebit's pet care waitlist. If you know a family looking for trusted pet care services, share this with them.",
};

export default function PetCareWaitlistPage() {
  return <ServiceWaitlistPage config={config} />;
}
