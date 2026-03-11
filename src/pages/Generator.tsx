import { motion } from 'framer-motion';
import { KeyRound, Shield, Zap, Copy } from 'lucide-react';
import { PasswordGenerator } from '@/components/PasswordGenerator';
import { Card, CardContent } from '@/components/ui/card';

const tips = [
  {
    icon: Shield,
    title: 'Use Unique Passwords',
    description: 'Never reuse passwords across different accounts.',
  },
  {
    icon: Zap,
    title: 'Length Matters',
    description: 'Longer passwords are exponentially harder to crack.',
  },
  {
    icon: Copy,
    title: 'Save Securely',
    description: 'Store your passwords in the Manager after generating.',
  },
];

export default function Generator() {
  return (
    <motion.div
      className="max-w-4xl mx-auto space-y-6 sm:space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Page Header */}
      <div className="text-center">
        <motion.div
          className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl gradient-primary mb-4 shadow-glow"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <KeyRound className="text-primary-foreground" size={28} />
        </motion.div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Password Generator</h1>
        <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto px-4">
          Generate cryptographically secure passwords with customizable options
        </p>
      </div>

      {/* Generator Component */}
      <PasswordGenerator />

      {/* Tips Section */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3">
        {tips.map((tip, index) => (
          <motion.div
            key={tip.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
          >
            <Card className="h-full card-hover">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                    <tip.icon className="text-primary" size={18} />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground mb-1 text-sm sm:text-base">{tip.title}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">{tip.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
