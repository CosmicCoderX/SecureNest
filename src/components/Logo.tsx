import { Shield } from 'lucide-react';
import { motion } from 'framer-motion';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export function Logo({ size = 'md', showText = true }: LogoProps) {
  const sizes = {
    sm: { icon: 20, text: 'text-lg' },
    md: { icon: 28, text: 'text-xl' },
    lg: { icon: 40, text: 'text-3xl' },
  };

  return (
    <motion.div 
      className="flex items-center gap-2"
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 400, damping: 10 }}
    >
      <div className="relative">
        <div className="gradient-primary rounded-lg p-2 shadow-glow">
          <Shield className="text-primary-foreground" size={sizes[size].icon} strokeWidth={2.5} />
        </div>
      </div>
      {showText && (
        <span className={`font-bold ${sizes[size].text} tracking-tight`}>
          <span className="text-gradient">Secure</span>
          <span className="text-foreground">Nest</span>
        </span>
      )}
    </motion.div>
  );
}
