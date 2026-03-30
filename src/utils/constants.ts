import { ServicePlan, SupportOption, FAQItem } from '../types';

export const SERVICE_PLANS: ServicePlan[] = [
  {
    id: 'filter-replacement',
    name: 'Filter Replacement',
    description: 'Replace your water filter cartridge',
    icon: 'swap-horizontal-outline',
  },
  {
    id: 'amc',
    name: 'Annual Maintenance',
    description: 'Full system inspection & cleaning',
    icon: 'construct-outline',
  },
  {
    id: 'tds-check',
    name: 'TDS Testing',
    description: 'On-site water quality analysis',
    icon: 'analytics-outline',
  },
  {
    id: 'upgrade',
    name: 'System Upgrade',
    description: 'Upgrade to a higher capacity unit',
    icon: 'arrow-up-circle-outline',
  },
];

export const SUPPORT_OPTIONS: SupportOption[] = [
  {
    id: 'call',
    label: 'Call Us',
    detail: '1800-XXX-XXXX',
    icon: 'call-outline',
    action: 'tel:1800XXXXXXX',
    color: '#0057A8',
  },
  {
    id: 'chat',
    label: 'Live Chat',
    detail: 'Available 9am–6pm',
    icon: 'chatbubble-ellipses-outline',
    action: 'chat',
    color: '#2E9E5B',
  },
  {
    id: 'email',
    label: 'Email',
    detail: 'support@vguard.in',
    icon: 'mail-outline',
    action: 'mailto:support@vguard.in',
    color: '#E6A817',
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    detail: 'Quick response',
    icon: 'logo-whatsapp',
    action: 'whatsapp',
    color: '#25D366',
  },
];

export const FAQ_ITEMS: FAQItem[] = [
  {
    id: 'faq-1',
    question: 'How often should I replace my filter?',
    answer:
      'Filter replacement is recommended every 6–12 months depending on your water usage and TDS levels. The app will notify you when it's time.',
  },
  {
    id: 'faq-2',
    question: 'What is a good TDS level for drinking water?',
    answer:
      'The ideal TDS for drinking water is between 50–150 ppm. Levels above 500 ppm are generally considered unsuitable for drinking.',
  },
  {
    id: 'faq-3',
    question: 'How do I know if my water is hard?',
    answer:
      'Signs of hard water include scale buildup on taps/appliances, soap scum, and dull laundry. Our app measures your TDS and classifies hardness automatically.',
  },
  {
    id: 'faq-4',
    question: 'Is the trial program free?',
    answer:
      'Yes! The V-Guard Exclusive Hard Water Protection Trial is complimentary for registered members during the trial period.',
  },
];
