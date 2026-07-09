export type UserRole = 'SUPER_ADMIN' | 'COMMUNITY_ADMIN' | 'USER';

export interface Community {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  userCount: number;
  createdAt: string;
}

export interface CommunityAdmin {
  id: string;
  username: string;
  email: string;
  communityId: string;
  communityName: string;
  status: 'ACTIVE' | 'SUSPENDED';
  createdAt: string;
}

export interface MatrimonyUser {
  id: string;
  email: string;
  role: UserRole;
  status: 'ACTIVE' | 'SUSPENDED';
  communityId: string;
  communityName: string;
  profile?: {
    id: string;
    name: string;
    age: number;
    gender: 'Male' | 'Female' | 'Other';
    occupation: string;
    location: string;
    education: string;
    income: string;
    imageUrl: string;
    verified: boolean;
    verificationStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'REQUEST_REUPLOAD';
    documentType?: string;
    documentUrl?: string;
    bio?: string;
  };
  createdAt: string;
}

export interface AuditLog {
  id: string;
  action: string;
  username: string;
  role: UserRole;
  details: string;
  ipAddress: string;
  createdAt: string;
}

export interface BroadcastNotification {
  id: string;
  title: string;
  message: string;
  recipientType: 'ALL_USERS' | 'SPECIFIC_COMMUNITY' | 'COMMUNITY_ADMINS';
  communityName?: string;
  createdAt: string;
}

export interface AppSettings {
  websiteName: string;
  logo: string;
  banner: string;
  contactDetails: string;
  privacyPolicy: string;
  termsAndConditions: string;
}
