export interface Profile {
  id: string;
  name: string;
  age: number;
  occupation: string;
  location: string;
  community: string;
  imageUrl: string;
  verified: boolean;
  matchPercentage?: number;
  about?: string;
  height?: string;
  motherTongue?: string;
  maritalStatus?: string;
  education?: string;
  employer?: string;
  income?: string;
  diet?: string;
  drinkSmoke?: string;
  interests?: string[];
}
