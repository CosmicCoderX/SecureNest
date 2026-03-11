import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TagFilterProps {
  availableTags: string[];
  selectedTags: string[];
  onChange: (tags: string[]) => void;
}

export function TagFilter({ availableTags, selectedTags, onChange }: TagFilterProps) {
  if (availableTags.length === 0) return null;

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onChange(selectedTags.filter(t => t !== tag));
    } else {
      onChange([...selectedTags, tag]);
    }
  };

  const clearAll = () => onChange([]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs sm:text-sm text-muted-foreground">Filter by tags</span>
        {selectedTags.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAll}
            className="h-6 px-2 text-xs hover:text-destructive"
          >
            Clear
            <X size={12} className="ml-1" />
          </Button>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {availableTags.map((tag) => {
          const isSelected = selectedTags.includes(tag);
          return (
            <Badge
              key={tag}
              variant={isSelected ? 'default' : 'outline'}
              className={cn(
                "cursor-pointer transition-all text-xs",
                isSelected 
                  ? 'hover:opacity-80' 
                  : 'hover:bg-primary/10 hover:border-primary'
              )}
              onClick={() => toggleTag(tag)}
            >
              {tag}
            </Badge>
          );
        })}
      </div>
    </div>
  );
}
