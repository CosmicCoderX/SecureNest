import { motion } from 'framer-motion';
import { 
  KeyRound, 
  Lock, 
  Shield, 
  Copy, 
  Search, 
  Trash2,
  ArrowDown,
  CheckCircle2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const generatorSteps = [
  {
    icon: KeyRound,
    title: 'Choose Your Options',
    description: 'Select password length and character types (uppercase, lowercase, numbers, symbols).',
  },
  {
    icon: Shield,
    title: 'Generate Securely',
    description: 'Click generate to create a cryptographically secure random password.',
  },
  {
    icon: Copy,
    title: 'Copy & Use',
    description: 'Copy your new password to clipboard and use it wherever needed.',
  },
];

const managerSteps = [
  {
    icon: Lock,
    title: 'Add Credentials',
    description: 'Save website name, URL, username, and password securely.',
  },
  {
    icon: Search,
    title: 'Search & Find',
    description: 'Quickly find any credential using the powerful search feature.',
  },
  {
    icon: Trash2,
    title: 'Manage Safely',
    description: 'View, copy, or delete credentials with confirmation for safety.',
  },
];

const securityFeatures = [
  'Passwords are masked by default for privacy',
  'Delete confirmation prevents accidental loss',
  'Local storage keeps data on your device',
  'No server-side storage of plain passwords',
  'Cryptographically secure random generation',
  'Strong password strength indicator',
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function HowItWorks() {
  return (
    <motion.div
      className="max-w-4xl mx-auto space-y-12"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Hero */}
      <motion.div className="text-center" variants={itemVariants}>
        <h1 className="text-4xl font-bold text-foreground mb-4">How It Works</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          SecureNest makes password management simple and secure. 
          Here's everything you need to know to get started.
        </p>
      </motion.div>

      {/* Password Generator Section */}
      <motion.div className="space-y-6" variants={itemVariants}>
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl gradient-primary">
            <KeyRound className="text-primary-foreground" size={24} />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Password Generator</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {generatorSteps.map((step, index) => (
            <motion.div
              key={step.title}
              variants={itemVariants}
              className="relative"
            >
              <Card className="h-full">
                <CardContent className="p-6 text-center">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full gradient-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
                    {index + 1}
                  </div>
                  <div className="p-3 rounded-xl bg-primary/10 inline-block mb-4 mt-2">
                    <step.icon className="text-primary" size={28} />
                  </div>
                  <h3 className="font-semibold text-lg text-foreground mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </CardContent>
              </Card>
              {index < generatorSteps.length - 1 && (
                <div className="hidden md:flex absolute top-1/2 -right-2 -translate-y-1/2 z-10">
                  <ArrowDown className="rotate-[-90deg] text-muted-foreground" size={20} />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Password Manager Section */}
      <motion.div className="space-y-6" variants={itemVariants}>
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl gradient-primary">
            <Lock className="text-primary-foreground" size={24} />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Password Manager</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {managerSteps.map((step, index) => (
            <motion.div
              key={step.title}
              variants={itemVariants}
              className="relative"
            >
              <Card className="h-full">
                <CardContent className="p-6 text-center">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full gradient-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
                    {index + 1}
                  </div>
                  <div className="p-3 rounded-xl bg-primary/10 inline-block mb-4 mt-2">
                    <step.icon className="text-primary" size={28} />
                  </div>
                  <h3 className="font-semibold text-lg text-foreground mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </CardContent>
              </Card>
              {index < managerSteps.length - 1 && (
                <div className="hidden md:flex absolute top-1/2 -right-2 -translate-y-1/2 z-10">
                  <ArrowDown className="rotate-[-90deg] text-muted-foreground" size={20} />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Security Features */}
      <motion.div variants={itemVariants}>
        <Card className="gradient-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="text-primary" size={24} />
              Security Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2">
              {securityFeatures.map((feature) => (
                <div key={feature} className="flex items-center gap-3">
                  <CheckCircle2 className="text-success shrink-0" size={20} />
                  <span className="text-muted-foreground">{feature}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* CTA */}
      <motion.div 
        className="text-center space-y-4"
        variants={itemVariants}
      >
        <h2 className="text-2xl font-bold text-foreground">Ready to Get Started?</h2>
        <p className="text-muted-foreground">
          Start generating secure passwords and managing your credentials today.
        </p>
        <div className="flex justify-center gap-4 flex-wrap">
          <Link to="/generator">
            <Button size="lg" className="gradient-primary text-primary-foreground shadow-glow">
              <KeyRound size={18} className="mr-2" />
              Generate Password
            </Button>
          </Link>
          <Link to="/manager">
            <Button size="lg" variant="outline">
              <Lock size={18} className="mr-2" />
              Manage Passwords
            </Button>
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
}
