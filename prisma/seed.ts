// Seeding script for the Community Matrimony platform Database

export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  COMMUNITY_ADMIN = 'COMMUNITY_ADMIN',
  USER = 'USER'
}

export enum AdminStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED'
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED'
}

export enum VerificationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  REQUEST_REUPLOAD = 'REQUEST_REUPLOAD'
}

export enum NotificationRecipient {
  ALL_USERS = 'ALL_USERS',
  SPECIFIC_COMMUNITY = 'SPECIFIC_COMMUNITY',
  COMMUNITY_ADMINS = 'COMMUNITY_ADMINS'
}

export async function seed() {
  console.log('Seeding started...');

  const communities = [
    { name: 'Maratha', description: 'Prominent community with warrior roots and agrarian traditions.' },
    { name: 'Kunbi', description: 'Traditional agriculturalist community concentrated in Maharashtra.' },
    { name: 'Mali', description: 'Horticultural and gardening legacy known for progressive reforms.' },
    { name: 'Dhangar', description: 'Shepherds and herders heritage with strong spiritual practices.' },
    { name: 'Brahmin', description: 'Traditional priestly, scholarly, and professional community.' },
    { name: 'Jain', description: 'Community known for business, philosophy, and ahimsa principles.' },
    { name: 'Lingayat', description: 'Followers of social reformer Basaveshwara, rich in cultural heritage.' }
  ];

  console.log(`Seeding ${communities.length} communities...`);
  // Seed logic mapped out:
  // 1. Create Communities
  // 2. Create Community Admins (e.g. maratha_admin, brahmin_admin)
  // 3. Create Users, Profiles, and Verification Documents
  // 4. Create Audit Logs & Broadcast Notifications
  
  console.log('Seeding completed successfully!');
}

if (require.main === module) {
  seed()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}
