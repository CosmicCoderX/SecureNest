import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Shield, 
  KeyRound, 
  Lock, 
  ArrowRight, 
  Globe,
  TrendingUp,
  Clock,
  Activity,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCredentials } from '@/hooks/useCredentials';
import { format } from 'date-fns';
import { MeteorShower } from '@/components/MeteorShower';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function Index() {
  const { totalCount, getRecentCredentials, isLoading } = useCredentials();
  const recentCredentials = getRecentCredentials(5);

  return (
    <motion.div
      className="space-y-6 sm:space-y-8 relative"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Meteor Shower Background */}
      <MeteorShower />

      {/* Hero Section */}
      <motion.div 
        className="relative overflow-hidden rounded-2xl sm:rounded-3xl gradient-hero p-6 sm:p-8 md:p-12 text-white"
        variants={itemVariants}
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 left-4 sm:top-10 sm:left-10 w-20 h-20 sm:w-32 sm:h-32 border border-white/30 rounded-full" />
          <div className="absolute bottom-4 right-8 sm:bottom-10 sm:right-20 w-32 h-32 sm:w-48 sm:h-48 border border-white/20 rounded-full" />
          <div className="absolute top-1/2 left-1/2 w-40 h-40 sm:w-64 sm:h-64 border border-white/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
        </div>
        
        <div className="relative z-10 max-w-2xl">
          <motion.div 
            className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="p-2 sm:p-3 bg-white/10 rounded-xl backdrop-blur-sm">
              <Shield className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            <span className="text-xs sm:text-sm font-medium bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">
              Secure & Private
            </span>
          </motion.div>
          
          <h1 className="text-responsive-2xl font-bold mb-3 sm:mb-4">
            Welcome to <span className="text-gradient">SecureNest</span>
          </h1>
          <p className="text-responsive-base text-white/80 mb-4 sm:mb-6">
            Generate strong passwords and manage your credentials securely. 
            Your digital life, protected.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Link to="/generator" className="w-full sm:w-auto">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/25 font-semibold"
                >
                  <KeyRound size={18} className="mr-2" />
                  Generate Password
                  <Sparkles size={14} className="ml-2 animate-pulse" />
                </Button>
              </motion.div>
            </Link>
            <Link to="/manager" className="w-full sm:w-auto">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 hover:border-white/30 shadow-lg"
                >
                  <Lock size={18} className="mr-2" />
                  Manage Passwords
                  <ArrowRight size={14} className="ml-2" />
                </Button>
              </motion.div>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div 
        className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3"
        variants={itemVariants}
      >
        <Card className="card-hover">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-responsive-sm text-muted-foreground">Total Passwords</p>
                <p className="text-2xl sm:text-3xl font-bold text-foreground mt-1">
                  {isLoading ? '...' : totalCount}
                </p>
              </div>
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl gradient-primary flex items-center justify-center shrink-0">
                <Lock className="text-primary-foreground" size={20} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-responsive-sm text-muted-foreground">Security Score</p>
                <p className="text-2xl sm:text-3xl font-bold text-success mt-1">Strong</p>
              </div>
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-success/10 flex items-center justify-center shrink-0">
                <Shield className="text-success" size={20} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-responsive-sm text-muted-foreground">Protection</p>
                <p className="text-2xl sm:text-3xl font-bold text-primary mt-1">Active</p>
              </div>
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <TrendingUp className="text-primary" size={20} />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Credentials */}
      <motion.div variants={itemVariants}>
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between pb-2 sm:pb-4">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Clock size={18} className="text-primary" />
              Recent Entries
            </CardTitle>
            <Link to="/manager">
              <Button variant="ghost" size="sm" className="text-xs sm:text-sm">
                View All <ArrowRight size={14} className="ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="pt-0">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
              </div>
            ) : recentCredentials.length > 0 ? (
              <div className="space-y-2 sm:space-y-3">
                {recentCredentials.map((cred, index) => (
                  <motion.div
                    key={cred.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.08 }}
                    className="flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg gradient-primary flex items-center justify-center shrink-0">
                        <Globe className="text-primary-foreground" size={16} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-foreground truncate text-sm sm:text-base">{cred.websiteName}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">{cred.username}</p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0 ml-2">
                      {format(new Date(cred.createdAt), 'MMM d')}
                    </span>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 sm:py-12">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                  <Lock className="text-muted-foreground" size={28} />
                </div>
                <p className="text-muted-foreground mb-4 text-sm sm:text-base">No saved credentials yet</p>
                <Link to="/manager">
                  <Button className="gradient-primary text-primary-foreground">
                    <Sparkles size={16} className="mr-2" />
                    Add Your First Credential
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div 
        className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2"
        variants={itemVariants}
      >
        <Link to="/generator">
          <Card className="group cursor-pointer card-hover h-full">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl gradient-primary flex items-center justify-center group-hover:shadow-glow transition-shadow shrink-0">
                  <KeyRound className="text-primary-foreground" size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-base sm:text-lg text-foreground">Generate Password</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">Create strong, secure passwords</p>
                </div>
                <ArrowRight className="text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" size={20} />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/health">
          <Card className="group cursor-pointer card-hover h-full">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl bg-success/10 flex items-center justify-center shrink-0">
                  <Activity className="text-success" size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-base sm:text-lg text-foreground">Password Health</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">Check your security status</p>
                </div>
                <ArrowRight className="text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" size={20} />
              </div>
            </CardContent>
          </Card>
        </Link>
      </motion.div>
    </motion.div>
  );
}
