import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Eye, EyeOff, AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PasswordStrength, calculateStrength } from '@/components/PasswordStrength';
import { PasswordStrength as StrengthType } from '@/types/credential';

interface PasswordAnalysis {
  length: number;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumbers: boolean;
  hasSymbols: boolean;
  hasRepeatingChars: boolean;
  hasSequentialChars: boolean;
  hasCommonPatterns: boolean;
  entropy: number;
}

function analyzePassword(password: string): PasswordAnalysis {
  const commonPatterns = [
    'password', '123456', 'qwerty', 'abc123', 'letmein', 'welcome',
    'admin', 'login', 'master', 'hello', 'dragon', 'monkey', 'shadow'
  ];
  
  const hasRepeatingChars = /(.)\1{2,}/.test(password);
  const hasSequentialChars = /(abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|012|123|234|345|456|567|678|789)/i.test(password);
  const hasCommonPatterns = commonPatterns.some(pattern => password.toLowerCase().includes(pattern));
  
  // Calculate entropy
  let charsetSize = 0;
  if (/[a-z]/.test(password)) charsetSize += 26;
  if (/[A-Z]/.test(password)) charsetSize += 26;
  if (/[0-9]/.test(password)) charsetSize += 10;
  if (/[^a-zA-Z0-9]/.test(password)) charsetSize += 32;
  
  const entropy = password.length * Math.log2(charsetSize || 1);
  
  return {
    length: password.length,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumbers: /[0-9]/.test(password),
    hasSymbols: /[^a-zA-Z0-9]/.test(password),
    hasRepeatingChars,
    hasSequentialChars,
    hasCommonPatterns,
    entropy: Math.round(entropy * 10) / 10,
  };
}

function getSuggestions(analysis: PasswordAnalysis): string[] {
  const suggestions: string[] = [];
  
  if (analysis.length < 12) {
    suggestions.push('Increase password length to at least 12 characters');
  }
  if (!analysis.hasUppercase) {
    suggestions.push('Add uppercase letters (A-Z)');
  }
  if (!analysis.hasLowercase) {
    suggestions.push('Add lowercase letters (a-z)');
  }
  if (!analysis.hasNumbers) {
    suggestions.push('Include numbers (0-9)');
  }
  if (!analysis.hasSymbols) {
    suggestions.push('Add special symbols (!@#$%^&*)');
  }
  if (analysis.hasRepeatingChars) {
    suggestions.push('Avoid repeating characters (e.g., "aaa", "111")');
  }
  if (analysis.hasSequentialChars) {
    suggestions.push('Avoid sequential patterns (e.g., "abc", "123")');
  }
  if (analysis.hasCommonPatterns) {
    suggestions.push('Avoid common words and patterns');
  }
  if (analysis.entropy < 60) {
    suggestions.push('Consider using a passphrase with random words');
  }
  
  return suggestions;
}

function getStrengthLabel(strength: StrengthType): { label: string; color: string; icon: typeof CheckCircle } {
  switch (strength) {
    case 'weak':
      return { label: 'Weak', color: 'text-destructive', icon: XCircle };
    case 'fair':
      return { label: 'Fair', color: 'text-warning', icon: AlertTriangle };
    case 'good':
      return { label: 'Good', color: 'text-warning', icon: AlertTriangle };
    case 'strong':
      return { label: 'Strong', color: 'text-success', icon: CheckCircle };
    case 'excellent':
      return { label: 'Excellent', color: 'text-success', icon: CheckCircle };
  }
}

export default function Analyzer() {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const analysis = password ? analyzePassword(password) : null;
  const strength = password ? calculateStrength(password) : 'weak';
  const suggestions = analysis ? getSuggestions(analysis) : [];
  const strengthInfo = getStrengthLabel(strength);

  return (
    <motion.div
      className="max-w-3xl mx-auto space-y-6 sm:space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Page Header */}
      <div className="flex items-center gap-3 sm:gap-4">
        <motion.div
          className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl gradient-primary shadow-glow"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <Shield className="text-primary-foreground" size={24} />
        </motion.div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Password Analyzer</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Check any password's strength</p>
        </div>
      </div>

      {/* Password Input */}
      <Card className="card-hover">
        <CardHeader className="pb-2 sm:pb-4">
          <CardTitle className="text-lg sm:text-xl">Enter Password to Analyze</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Your password is analyzed locally and never sent anywhere</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Paste or type a password..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 sm:h-12 text-base sm:text-lg pr-12"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </Button>
          </div>
          
          {password && <PasswordStrength password={password} />}
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {password && analysis && (
        <motion.div
          className="space-y-4 sm:space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {/* Strength Summary */}
          <Card className={`border-2 ${
            strength === 'weak' || strength === 'fair' 
              ? 'border-destructive/50' 
              : 'border-success/50'
          }`}>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className={`p-2 sm:p-3 rounded-full ${
                  strength === 'weak' || strength === 'fair' 
                    ? 'bg-destructive/10' 
                    : 'bg-success/10'
                }`}>
                  <strengthInfo.icon className={strengthInfo.color} size={28} />
                </div>
                <div>
                  <h3 className={`text-xl sm:text-2xl font-bold ${strengthInfo.color}`}>{strengthInfo.label}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Entropy: {analysis.entropy} bits • {analysis.length} characters
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Character Analysis */}
          <Card className="card-hover">
            <CardHeader className="pb-2 sm:pb-4">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Info size={18} />
                Character Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4">
                {[
                  { label: 'Uppercase (A-Z)', value: analysis.hasUppercase },
                  { label: 'Lowercase (a-z)', value: analysis.hasLowercase },
                  { label: 'Numbers (0-9)', value: analysis.hasNumbers },
                  { label: 'Symbols (!@#$)', value: analysis.hasSymbols },
                  { label: 'Length ≥ 12', value: analysis.length >= 12 },
                  { label: 'No Repeating', value: !analysis.hasRepeatingChars },
                ].map((item, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-2 p-2.5 sm:p-3 rounded-lg ${
                      item.value ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {item.value ? <CheckCircle size={14} /> : <XCircle size={14} />}
                    <span className="text-xs sm:text-sm font-medium">{item.label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <Card className="card-hover">
              <CardHeader className="pb-2 sm:pb-4">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <AlertTriangle size={18} className="text-warning" />
                  Improvement Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 sm:space-y-3">
                  {suggestions.map((suggestion, index) => (
                    <motion.li
                      key={index}
                      className="flex items-start gap-2 sm:gap-3 p-2.5 sm:p-3 bg-warning/5 rounded-lg border border-warning/20"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <AlertTriangle size={16} className="text-warning shrink-0 mt-0.5" />
                      <span className="text-xs sm:text-sm">{suggestion}</span>
                    </motion.li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {suggestions.length === 0 && (
            <Card className="bg-success/5 border-success/20">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center gap-3">
                  <CheckCircle className="text-success" size={24} />
                  <div>
                    <h4 className="font-semibold text-success">Excellent Password!</h4>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      This password meets all recommended security criteria.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
