import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Eye, EyeOff, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Credential } from '@/types/credential';
import { TagSelect } from '@/components/TagSelect';
import { toast } from 'sonner';

interface CredentialFormProps {
  onSave: (credential: Omit<Credential, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const NUMBERS = '0123456789';
const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?';

export function CredentialForm({ onSave }: CredentialFormProps) {
  const [open, setOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    websiteName: '',
    websiteUrl: '',
    username: '',
    password: '',
    tags: [] as string[],
  });

  const generatePassword = () => {
    const charset = UPPERCASE + LOWERCASE + NUMBERS + SYMBOLS;
    let newPassword = '';
    const array = new Uint32Array(16);
    crypto.getRandomValues(array);
    
    for (let i = 0; i < 16; i++) {
      newPassword += charset[array[i] % charset.length];
    }
    
    setFormData(prev => ({ ...prev, password: newPassword }));
    setShowPassword(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.websiteName.trim() || !formData.username.trim() || !formData.password.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    onSave(formData);
    setFormData({ websiteName: '', websiteUrl: '', username: '', password: '', tags: [] });
    setOpen(false);
    toast.success('Credential saved successfully!');
  };

  const handleTagsChange = (newTags: string[]) => {
    setFormData(prev => ({ ...prev, tags: newTags }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gradient-primary text-primary-foreground shadow-glow hover:opacity-90 text-sm sm:text-base">
          <Plus size={16} className="mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Add Credential</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">Add New Credential</DialogTitle>
        </DialogHeader>
        <motion.form 
          onSubmit={handleSubmit} 
          className="space-y-3 sm:space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="websiteName" className="text-sm">Website Name *</Label>
            <Input
              id="websiteName"
              placeholder="e.g., Google, Netflix"
              value={formData.websiteName}
              onChange={(e) => setFormData(prev => ({ ...prev, websiteName: e.target.value }))}
              className="h-10 sm:h-11"
            />
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="websiteUrl" className="text-sm">Website URL</Label>
            <Input
              id="websiteUrl"
              placeholder="e.g., google.com"
              value={formData.websiteUrl}
              onChange={(e) => setFormData(prev => ({ ...prev, websiteUrl: e.target.value }))}
              className="h-10 sm:h-11"
            />
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="username" className="text-sm">Username / Email *</Label>
            <Input
              id="username"
              placeholder="Enter username or email"
              value={formData.username}
              onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
              className="h-10 sm:h-11"
            />
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="password" className="text-sm">Password *</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="pr-10 h-10 sm:h-11"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </Button>
              </div>
              <Button
                type="button"
                variant="secondary"
                onClick={generatePassword}
                className="shrink-0 h-10 sm:h-11 px-3"
              >
                <Sparkles size={14} className="sm:mr-1" />
                <span className="hidden sm:inline">Generate</span>
              </Button>
            </div>
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <Label className="text-sm">Tags (Optional)</Label>
            <TagSelect
              selectedTags={formData.tags}
              onChange={handleTagsChange}
            />
          </div>

          <div className="flex gap-2 pt-2 sm:pt-4">
            <Button type="button" variant="outline" className="flex-1 h-10 sm:h-11" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1 h-10 sm:h-11 gradient-primary text-primary-foreground">
              Save
            </Button>
          </div>
        </motion.form>
      </DialogContent>
    </Dialog>
  );
}
