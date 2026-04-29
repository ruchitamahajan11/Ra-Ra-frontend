// ─── Dummy Proposal Companies ─────────────────────────────────────────────────
// UI-only dummy data for the Proposals page. No backend integration.

export type ProposalStatus = 'pending' | 'accepted' | 'rejected';

export interface DummyProposalCompany {
  id: string;
  proposalNo: string;
  companyName: string;
  contactPerson: string;
  email: string;
  city: string;
  state: string;
  service: string;
  sentDate: string;
  status: ProposalStatus;
}

export const dummyProposalCompanies: DummyProposalCompany[] = [
  {
    id: 'dp-001',
    proposalNo: 'PRO/2026/001',
    companyName: 'Nexora Logistics Pvt. Ltd.',
    contactPerson: 'Rahul Sharma',
    email: 'rahul@nexoralogistics.com',
    city: 'Mumbai',
    state: 'Maharashtra',
    service: 'Corporate Advisory',
    sentDate: '2026-04-10',
    status: 'pending',
  },
  {
    id: 'dp-002',
    proposalNo: 'PRO/2026/002',
    companyName: 'Greenfield Infra Solutions',
    contactPerson: 'Priya Mehta',
    email: 'priya@greenfieldsinfra.com',
    city: 'Pune',
    state: 'Maharashtra',
    service: 'Agreements & Contracts',
    sentDate: '2026-04-12',
    status: 'pending',
  },
  {
    id: 'dp-003',
    proposalNo: 'PRO/2026/003',
    companyName: 'Skyline Transport Solutions',
    contactPerson: 'Amit Verma',
    email: 'amit@skylinetransport.com',
    city: 'Delhi',
    state: 'Delhi',
    service: 'Dispute Resolution',
    sentDate: '2026-04-14',
    status: 'pending',
  },
  {
    id: 'dp-004',
    proposalNo: 'PRO/2026/004',
    companyName: 'Brightwave Technologies Ltd.',
    contactPerson: 'Sneha Kulkarni',
    email: 'sneha@brightwavetech.com',
    city: 'Bengaluru',
    state: 'Karnataka',
    service: 'Corporate Advisory',
    sentDate: '2026-04-16',
    status: 'pending',
  },
  {
    id: 'dp-005',
    proposalNo: 'PRO/2026/005',
    companyName: 'Horizon Pharma Pvt. Ltd.',
    contactPerson: 'Karan Joshi',
    email: 'karan@horizonpharma.com',
    city: 'Ahmedabad',
    state: 'Gujarat',
    service: 'Agreements & Contracts',
    sentDate: '2026-04-18',
    status: 'pending',
  },
  {
    id: 'dp-006',
    proposalNo: 'PRO/2026/006',
    companyName: 'Pinnacle Real Estate Group',
    contactPerson: 'Deepa Nair',
    email: 'deepa@pinnaclerealty.com',
    city: 'Chennai',
    state: 'Tamil Nadu',
    service: 'Dispute Resolution',
    sentDate: '2026-04-20',
    status: 'pending',
  },
];