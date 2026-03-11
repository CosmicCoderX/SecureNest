import { motion } from 'framer-motion';
import { PasswordStrength as StrengthType } from '@/types/credential';

interface PasswordStrengthProps {
  password: string;
}

export function calculateStrength(password: string): StrengthType {
  if (!password) return 'weak';
  
  let score = 0;
  
  // Length scoring
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;
  
  // Character variety scoring
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;
  
  if (score <= 2) return 'weak';
  if (score <= 4) return 'fair';
  if (score <= 5) return 'good';
  if (score <= 6) return 'strong';
  return 'excellent';
}

const strengthConfig = {
  weak: { 
    color: 'bg-destructive', 
    width: '20%', 
    label: 'Weak',
    textColor: 'text-destructive'
  },
  fair: { 
    color: 'bg-warning', 
    width: '40%', 
    label: 'Fair',
    textColor: 'text-warning'
  },
  good: { 
    color: 'bg-warning', 
    width: '60%', 
    label: 'Good',
    textColor: 'text-warning'
  },
  strong: { 
    color: 'bg-success', 
    width: '80%', 
    label: 'Strong',
    textColor: 'text-success'
  },
  excellent: { 
    color: 'bg-success', 
    width: '100%', 
    label: 'Excellent',
    textColor: 'text-success'
  },
};

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const strength = calculateStrength(password);
  const config = strengthConfig[strength];

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">Password Strength</span>
        <span className={`text-sm font-medium ${config.textColor}`}>
          {config.label}
        </span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          className={`h-full ${config.color} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: config.width }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
