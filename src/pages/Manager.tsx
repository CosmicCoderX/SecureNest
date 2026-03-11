import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Search, Database, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { CredentialCard } from '@/components/CredentialCard';
import { CredentialForm } from '@/components/CredentialForm';
import { TagFilter } from '@/components/TagFilter';
import { useCredentials } from '@/hooks/useCredentials';
import { toast } from 'sonner';

export default function Manager() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const { 
    credentials, 
    isLoading, 
    addCredential, 
    deleteCredential, 
    searchCredentials,
    getAllTags,
    filterByTags,
    totalCount 
  } = useCredentials();

  const allTags = useMemo(() => getAllTags(), [getAllTags]);
  
  const filteredCredentials = useMemo(() => {
    let result = credentials;
    
    // Filter by tags first
    if (selectedTags.length > 0) {
      result = filterByTags(selectedTags);
    }
    
    // Then filter by search query
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(cred =>
        cred.websiteName.toLowerCase().includes(lowerQuery) ||
        cred.websiteUrl.toLowerCase().includes(lowerQuery) ||
        cred.username.toLowerCase().includes(lowerQuery)
      );
    }
    
    return result;
  }, [credentials, selectedTags, searchQuery, filterByTags]);

  const handleDelete = (id: string) => {
    deleteCredential(id);
    toast.success('Credential deleted successfully');
  };

  return (
    <motion.div
      className="max-w-4xl mx-auto space-y-6 sm:space-y-8"
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
            <Lock className="text-primary-foreground" size={24} />
          </motion.div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Password Manager</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              {totalCount} credential{totalCount !== 1 ? 's' : ''} saved
            </p>
          </div>
        </div>
        
        <CredentialForm onSave={addCredential} />
      </div>

      {/* Search Bar */}
      <div className="space-y-3 sm:space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            placeholder="Search by website, username, or URL..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11 sm:h-12 text-sm sm:text-base"
          />
        </div>
        
        {/* Tag Filter */}
        <TagFilter
          availableTags={allTags}
          selectedTags={selectedTags}
          onChange={setSelectedTags}
        />
      </div>

      {/* Credentials Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent" />
        </div>
      ) : filteredCredentials.length > 0 ? (
        <motion.div 
          className="grid gap-3 sm:gap-4 md:grid-cols-2"
          layout
        >
          <AnimatePresence mode="popLayout">
            {filteredCredentials.map((cred) => (
              <CredentialCard
                key={cred.id}
                credential={cred}
                onDelete={handleDelete}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <motion.div
          className="flex flex-col items-center justify-center py-12 sm:py-16 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-muted flex items-center justify-center mb-4">
            {searchQuery ? (
              <Search className="text-muted-foreground" size={28} />
            ) : (
              <Database className="text-muted-foreground" size={28} />
            )}
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">
            {searchQuery ? 'No Results Found' : 'No Credentials Yet'}
          </h3>
          <p className="text-sm sm:text-base text-muted-foreground max-w-sm mb-6 px-4">
            {searchQuery 
              ? `No credentials match "${searchQuery}". Try a different search term.`
              : 'Start by adding your first credential. Your passwords are stored securely.'}
          </p>
          {!searchQuery && (
            <CredentialForm onSave={addCredential} />
          )}
        </motion.div>
      )}

      {/* Info Banner */}
      <motion.div
        className="bg-primary/5 border border-primary/20 rounded-xl p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-primary/10 shrink-0">
            <Lock className="text-primary" size={18} />
          </div>
          <div>
            <h4 className="font-medium text-foreground mb-1 text-sm sm:text-base">Secure Cloud Storage</h4>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Your credentials are securely stored and synced across devices. 
              Enable Google Sheets sync for additional backup.
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
