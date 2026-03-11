import { motion } from 'framer-motion';
import { Activity, Shield, AlertTriangle, CheckCircle, XCircle, RefreshCcw, Lock, Copy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCredentials } from '@/hooks/useCredentials';
import { calculateStrength } from '@/components/PasswordStrength';
import { PasswordStrength as StrengthType } from '@/types/credential';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Link } from 'react-router-dom';

const STRENGTH_COLORS = {
  weak: 'hsl(0, 84%, 60%)',
  fair: 'hsl(38, 92%, 50%)',
  good: 'hsl(38, 92%, 50%)',
  strong: 'hsl(142, 71%, 45%)',
  excellent: 'hsl(142, 71%, 45%)',
};

const STRENGTH_LABELS: Record<StrengthType, string> = {
  weak: 'Weak',
  fair: 'Fair',
  good: 'Good',
  strong: 'Strong',
  excellent: 'Excellent',
};

export default function HealthDashboard() {
  const { credentials, isLoading, refetch } = useCredentials();

  // Analyze all passwords
  const passwordAnalysis = credentials.map(cred => ({
    ...cred,
    strength: calculateStrength(cred.password),
  }));

  // Count by strength
  const strengthCounts = passwordAnalysis.reduce((acc, item) => {
    acc[item.strength] = (acc[item.strength] || 0) + 1;
    return acc;
  }, {} as Record<StrengthType, number>);

  // Find reused passwords
  const passwordMap = new Map<string, string[]>();
  credentials.forEach(cred => {
    const existing = passwordMap.get(cred.password) || [];
    existing.push(cred.websiteName);
    passwordMap.set(cred.password, existing);
  });
  
  const reusedPasswords = Array.from(passwordMap.entries())
    .filter(([_, sites]) => sites.length > 1);
  const reusedCount = reusedPasswords.reduce((sum, [_, sites]) => sum + sites.length, 0);

  // Weak passwords list
  const weakPasswords = passwordAnalysis.filter(p => p.strength === 'weak' || p.strength === 'fair');

  // Calculate overall health score (0-100)
  const totalPasswords = credentials.length;
  const strongCount = (strengthCounts.strong || 0) + (strengthCounts.excellent || 0);
  const weakCount = (strengthCounts.weak || 0) + (strengthCounts.fair || 0);
  
  let healthScore = 100;
  if (totalPasswords > 0) {
    healthScore = Math.round(
      ((strongCount * 1 + (strengthCounts.good || 0) * 0.7 - weakCount * 0.5 - reusedCount * 0.3) / totalPasswords) * 100
    );
    healthScore = Math.max(0, Math.min(100, healthScore));
  }

  // Pie chart data
  const pieData = Object.entries(strengthCounts)
    .filter(([_, count]) => count > 0)
    .map(([strength, count]) => ({
      name: STRENGTH_LABELS[strength as StrengthType],
      value: count,
      color: STRENGTH_COLORS[strength as StrengthType],
    }));

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 50) return 'text-warning';
    return 'text-destructive';
  };

  const getHealthLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Attention';
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <motion.div
      className="max-w-5xl mx-auto space-y-6 sm:space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <motion.div
            className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl gradient-primary shadow-glow"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <Activity className="text-primary-foreground" size={24} />
          </motion.div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Password Health</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Monitor your password security
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={() => refetch()} size="sm" className="w-fit">
          <RefreshCcw size={16} className="mr-2" />
          Refresh
        </Button>
      </div>

      {totalPasswords === 0 ? (
        <Card className="card-hover">
          <CardContent className="py-12 sm:py-16 text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
              <Lock className="text-muted-foreground" size={28} />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold mb-2">No Passwords Yet</h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-4 max-w-sm mx-auto">
              Add some credentials to see your password health analysis
            </p>
            <Link to="/manager">
              <Button className="gradient-primary text-primary-foreground">
                Go to Manager
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Overview Cards */}
          <div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-4">
            {/* Health Score */}
            <Card className="col-span-2 row-span-2 card-hover">
              <CardContent className="p-4 sm:p-6 flex flex-col items-center justify-center h-full min-h-[200px]">
                <div className="relative">
                  <svg className="w-28 h-28 sm:w-40 sm:h-40 transform -rotate-90">
                    <circle
                      cx="50%"
                      cy="50%"
                      r="45%"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="10"
                      className="text-muted"
                    />
                    <circle
                      cx="50%"
                      cy="50%"
                      r="45%"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="10"
                      strokeDasharray={`${(healthScore / 100) * 283} 283`}
                      strokeLinecap="round"
                      className={getHealthColor(healthScore)}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-3xl sm:text-4xl font-bold ${getHealthColor(healthScore)}`}>
                      {healthScore}
                    </span>
                    <span className="text-xs text-muted-foreground">out of 100</span>
                  </div>
                </div>
                <h3 className={`text-lg sm:text-xl font-semibold mt-3 sm:mt-4 ${getHealthColor(healthScore)}`}>
                  {getHealthLabel(healthScore)}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground text-center mt-1">
                  Overall security score
                </p>
              </CardContent>
            </Card>

            {/* Total Passwords */}
            <Card className="card-hover">
              <CardContent className="p-3 sm:p-6">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10 shrink-0">
                    <Shield className="text-primary" size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xl sm:text-2xl font-bold truncate">{totalPasswords}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">Total</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Strong Passwords */}
            <Card className="card-hover">
              <CardContent className="p-3 sm:p-6">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 rounded-lg bg-success/10 shrink-0">
                    <CheckCircle className="text-success" size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xl sm:text-2xl font-bold truncate">{strongCount}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">Strong</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Weak Passwords */}
            <Card className="card-hover">
              <CardContent className="p-3 sm:p-6">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 rounded-lg bg-destructive/10 shrink-0">
                    <XCircle className="text-destructive" size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xl sm:text-2xl font-bold truncate">{weakCount}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">Weak</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reused Passwords */}
            <Card className="card-hover">
              <CardContent className="p-3 sm:p-6">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 rounded-lg bg-warning/10 shrink-0">
                    <Copy className="text-warning" size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xl sm:text-2xl font-bold truncate">{reusedCount}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">Reused</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts and Lists */}
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
            {/* Strength Distribution Chart */}
            {pieData.length > 0 && (
              <Card className="card-hover">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg sm:text-xl">Strength Distribution</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Breakdown by password strength</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-52 sm:h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius="70%"
                          innerRadius="45%"
                          paddingAngle={2}
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend wrapperStyle={{ fontSize: '12px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Weak Passwords List */}
            <Card className="card-hover">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <AlertTriangle className="text-warning" size={18} />
                  Needs Attention
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">Update these for better security</CardDescription>
              </CardHeader>
              <CardContent>
                {weakPasswords.length === 0 ? (
                  <div className="text-center py-6 sm:py-8">
                    <CheckCircle className="mx-auto text-success mb-2" size={28} />
                    <p className="text-success font-medium text-sm sm:text-base">All passwords are strong!</p>
                  </div>
                ) : (
                  <ul className="space-y-2 max-h-40 sm:max-h-48 overflow-y-auto">
                    {weakPasswords.slice(0, 5).map((item) => (
                      <li
                        key={item.id}
                        className="flex items-center justify-between p-2.5 sm:p-3 bg-muted/50 rounded-lg"
                      >
                        <span className="font-medium text-sm truncate mr-2">{item.websiteName}</span>
                        <span className={`text-xs px-2 py-0.5 rounded shrink-0 ${
                          item.strength === 'weak' 
                            ? 'bg-destructive/10 text-destructive' 
                            : 'bg-warning/10 text-warning'
                        }`}>
                          {STRENGTH_LABELS[item.strength]}
                        </span>
                      </li>
                    ))}
                    {weakPasswords.length > 5 && (
                      <li className="text-center text-xs text-muted-foreground py-2">
                        +{weakPasswords.length - 5} more
                      </li>
                    )}
                  </ul>
                )}
              </CardContent>
            </Card>

            {/* Reused Passwords */}
            {reusedPasswords.length > 0 && (
              <Card className="md:col-span-2 card-hover">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <Copy className="text-warning" size={18} />
                    Reused Passwords
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Using the same password on multiple sites is risky</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 sm:space-y-3">
                    {reusedPasswords.slice(0, 3).map(([_, sites], index) => (
                      <li key={index} className="p-2.5 sm:p-3 bg-warning/5 border border-warning/20 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-2">
                          Same password used on:
                        </p>
                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                          {sites.map((site, i) => (
                            <span key={i} className="px-2 py-1 bg-warning/10 text-warning text-xs rounded">
                              {site}
                            </span>
                          ))}
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        </>
      )}
    </motion.div>
  );
}
