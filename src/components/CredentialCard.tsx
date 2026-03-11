import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Eye, 
  EyeOff, 
  Copy, 
  Trash2, 
  ExternalLink,
  Globe,
  User,
  Key,
  Calendar,
  Tag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Credential } from '@/types/credential';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface CredentialCardProps {
  credential: Credential;
  onDelete: (id: string) => void;
}

export function CredentialCard({ credential, onDelete }: CredentialCardProps) {
  const [showPassword, setShowPassword] = useState(false);

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied!`);
    } catch {
      toast.error(`Failed to copy ${label.toLowerCase()}`);
    }
  };

  const maskedPassword = '•'.repeat(Math.min(credential.password.length, 12));

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="overflow-hidden card-hover">
        <CardContent className="p-0">
          {/* Header */}
          <div className="flex items-center justify-between p-3 sm:p-4 border-b border-border bg-muted/30">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg gradient-primary flex items-center justify-center shrink-0">
                <Globe className="text-primary-foreground" size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-foreground text-sm sm:text-base truncate">{credential.websiteName}</h3>
                {credential.websiteUrl && (
                  <a 
                    href={credential.websiteUrl.startsWith('http') ? credential.websiteUrl : `https://${credential.websiteUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs sm:text-sm text-primary hover:underline flex items-center gap-1 truncate"
                  >
                    <span className="truncate">{credential.websiteUrl}</span>
                    <ExternalLink size={10} className="shrink-0" />
                  </a>
                )}
              </div>
            </div>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive h-8 w-8 shrink-0">
                  <Trash2 size={16} />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="max-w-[90vw] sm:max-w-md">
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Credential</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete the credentials for "{credential.websiteName}"? 
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="gap-2 sm:gap-0">
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(credential.id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          {/* Details */}
          <div className="p-3 sm:p-4 space-y-2.5 sm:space-y-3">
            {/* Username */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-muted-foreground shrink-0">
                <User size={14} />
                <span className="text-xs sm:text-sm">Username</span>
              </div>
              <div className="flex items-center gap-1 min-w-0">
                <span className="font-mono text-xs sm:text-sm truncate">{credential.username}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0"
                  onClick={() => copyToClipboard(credential.username, 'Username')}
                >
                  <Copy size={12} />
                </Button>
              </div>
            </div>

            {/* Password */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-muted-foreground shrink-0">
                <Key size={14} />
                <span className="text-xs sm:text-sm">Password</span>
              </div>
              <div className="flex items-center gap-1 min-w-0">
                <span className="font-mono text-xs sm:text-sm truncate">
                  {showPassword ? credential.password : maskedPassword}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={12} /> : <Eye size={12} />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0"
                  onClick={() => copyToClipboard(credential.password, 'Password')}
                >
                  <Copy size={12} />
                </Button>
              </div>
            </div>

            {/* Tags */}
            {credential.tags && credential.tags.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-border">
                <Tag size={12} className="text-muted-foreground shrink-0" />
                {credential.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs px-2 py-0">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Date */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-border">
              <Calendar size={12} />
              <span>Added {format(new Date(credential.createdAt), 'MMM d, yyyy')}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
