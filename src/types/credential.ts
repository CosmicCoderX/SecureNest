export interface Credential {
  id: string;
  websiteName: string;
  websiteUrl: string;
  username: string;
  password: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PasswordOptions {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
}

export type PasswordStrength = 'weak' | 'fair' | 'good' | 'strong' | 'excellent';
