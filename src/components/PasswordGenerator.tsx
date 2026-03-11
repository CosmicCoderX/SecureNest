import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Copy, RefreshCw, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PasswordStrength } from './PasswordStrength';
import { PasswordOptions } from '@/types/credential';
import { toast } from 'sonner';

const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const NUMBERS = '0123456789';
const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?';

export function PasswordGenerator() {
  const [password, setPassword] = useState('');
  const [copied, setCopied] = useState(false);
  const [options, setOptions] = useState<PasswordOptions>({
    length: 16,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
  });

  const generatePassword = useCallback(() => {
    let charset = '';
    if (options.uppercase) charset += UPPERCASE;
    if (options.lowercase) charset += LOWERCASE;
    if (options.numbers) charset += NUMBERS;
    if (options.symbols) charset += SYMBOLS;

    if (!charset) {
      toast.error('Please select at least one character type');
      return;
    }

    let newPassword = '';
    const array = new Uint32Array(options.length);
    crypto.getRandomValues(array);
    
    for (let i = 0; i < options.length; i++) {
      newPassword += charset[array[i] % charset.length];
    }

    setPassword(newPassword);
    setCopied(false);
  }, [options]);

  const copyToClipboard = async () => {
    if (!password) return;
    
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      toast.success('Password copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy password');
    }
  };

  const updateOption = <K extends keyof PasswordOptions>(key: K, value: PasswordOptions[K]) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Card className="gradient-card shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="h-8 w-1 gradient-primary rounded-full" />
          Password Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Password Display */}
        <div className="relative">
          <motion.div 
            className="flex items-center gap-2 p-4 bg-muted rounded-lg border border-border"
            animate={{ scale: password ? [1, 1.01, 1] : 1 }}
            transition={{ duration: 0.2 }}
          >
            <input
              type="text"
              value={password}
              readOnly
              placeholder="Click generate to create a password"
              className="flex-1 bg-transparent font-mono text-lg outline-none placeholder:text-muted-foreground"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={copyToClipboard}
              disabled={!password}
              className="shrink-0"
            >
              {copied ? (
                <Check className="text-success" size={18} />
              ) : (
                <Copy size={18} />
              )}
            </Button>
          </motion.div>
        </div>

        {/* Strength Indicator */}
        {password && <PasswordStrength password={password} />}

        {/* Length Slider */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label>Password Length</Label>
            <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
              {options.length}
            </span>
          </div>
          <Slider
            value={[options.length]}
            onValueChange={([value]) => updateOption('length', value)}
            min={8}
            max={64}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>8</span>
            <span>64</span>
          </div>
        </div>

        {/* Character Options */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <Label htmlFor="uppercase" className="cursor-pointer">Uppercase (A-Z)</Label>
            <Switch
              id="uppercase"
              checked={options.uppercase}
              onCheckedChange={(checked) => updateOption('uppercase', checked)}
            />
          </div>
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <Label htmlFor="lowercase" className="cursor-pointer">Lowercase (a-z)</Label>
            <Switch
              id="lowercase"
              checked={options.lowercase}
              onCheckedChange={(checked) => updateOption('lowercase', checked)}
            />
          </div>
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <Label htmlFor="numbers" className="cursor-pointer">Numbers (0-9)</Label>
            <Switch
              id="numbers"
              checked={options.numbers}
              onCheckedChange={(checked) => updateOption('numbers', checked)}
            />
          </div>
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <Label htmlFor="symbols" className="cursor-pointer">Symbols (!@#$%)</Label>
            <Switch
              id="symbols"
              checked={options.symbols}
              onCheckedChange={(checked) => updateOption('symbols', checked)}
            />
          </div>
        </div>

        {/* Generate Button */}
        <Button 
          onClick={generatePassword} 
          className="w-full gradient-primary text-primary-foreground shadow-glow hover:opacity-90 transition-opacity"
          size="lg"
        >
          <RefreshCw size={18} className="mr-2" />
          Generate Password
        </Button>
      </CardContent>
    </Card>
  );
}
