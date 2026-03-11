import { motion } from 'framer-motion';
import { Shield, Lock, Eye, Zap, Heart, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Logo } from '@/components/Logo';

const features = [
  {
    icon: Shield,
    title: 'Bank-Grade Security',
    description: 'Your data is protected with industry-standard encryption and security practices.',
  },
  {
    icon: Lock,
    title: 'Zero-Knowledge Architecture',
    description: 'We never have access to your passwords. Only you can decrypt your data.',
  },
  {
    icon: Eye,
    title: 'Privacy First',
    description: 'No tracking, no analytics on your credentials. Your privacy is our priority.',
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Instant password generation and quick access to all your stored credentials.',
  },
];

const values = [
  {
    icon: Heart,
    title: 'User-Centric Design',
    description: 'Every feature is designed with your convenience and security in mind.',
  },
  {
    icon: Users,
    title: 'Open & Transparent',
    description: 'We believe in transparency about how we handle and protect your data.',
  },
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

export default function About() {
  return (
    <motion.div
      className="max-w-4xl mx-auto space-y-12"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Hero */}
      <motion.div className="text-center" variants={itemVariants}>
        <div className="flex justify-center mb-6">
          <Logo size="lg" />
        </div>
        <h1 className="text-4xl font-bold text-foreground mb-4">
          About SecureNest
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          SecureNest is your trusted companion for password management. 
          We believe that security should be simple, accessible, and reliable.
        </p>
      </motion.div>

      {/* Mission */}
      <motion.div variants={itemVariants}>
        <Card className="gradient-hero text-white overflow-hidden">
          <CardContent className="p-8 relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10">
              <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
              <p className="text-lg text-white/80">
                To provide everyone with the tools they need to secure their digital identity. 
                We're committed to making password management effortless while maintaining 
                the highest security standards.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Features */}
      <motion.div className="space-y-6" variants={itemVariants}>
        <h2 className="text-2xl font-bold text-foreground text-center">Why SecureNest?</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl gradient-primary shrink-0">
                      <feature.icon className="text-primary-foreground" size={24} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-foreground mb-2">{feature.title}</h3>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Values */}
      <motion.div className="space-y-6" variants={itemVariants}>
        <h2 className="text-2xl font-bold text-foreground text-center">Our Values</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {values.map((value, index) => (
            <motion.div
              key={value.title}
              variants={itemVariants}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full border-primary/20 hover:border-primary/40 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-primary/10 shrink-0">
                      <value.icon className="text-primary" size={24} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-foreground mb-2">{value.title}</h3>
                      <p className="text-muted-foreground">{value.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
