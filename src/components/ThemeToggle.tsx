import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/useTheme';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="relative rounded-full h-9 w-9 sm:h-10 sm:w-10 overflow-hidden bg-muted/50 hover:bg-muted border border-border/50 hover:border-primary/50 transition-all duration-300"
    >
      <AnimatePresence mode="wait" initial={false}>
        {theme === 'dark' ? (
          <motion.div
            key="sun"
            initial={{ rotate: -90, scale: 0, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: 90, scale: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <Sun size={18} className="text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
          </motion.div>
        ) : (
          <motion.div
            key="moon"
            initial={{ rotate: 90, scale: 0, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: -90, scale: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <Moon size={18} className="text-primary drop-shadow-[0_0_8px_hsl(var(--primary)/0.6)]" />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Enhanced hover glow effect */}
      <motion.div
        className="absolute inset-0 rounded-full pointer-events-none"
        initial={false}
        whileHover={{ scale: 1.1 }}
        animate={{
          boxShadow: theme === 'dark' 
            ? '0 0 16px hsl(38 92% 50% / 0.4), inset 0 0 8px hsl(38 92% 50% / 0.1)' 
            : '0 0 16px hsl(var(--primary) / 0.4), inset 0 0 8px hsl(var(--primary) / 0.1)',
        }}
        transition={{ duration: 0.3 }}
      />
    </Button>
  );
}
