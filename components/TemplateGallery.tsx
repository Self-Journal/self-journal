'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { collectionTemplates, type CollectionTemplate } from '@/lib/templates';
import { Sparkles, BookOpen, Target, Lightbulb, Heart } from 'lucide-react';

interface TemplateGalleryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTemplateSelect: (template: CollectionTemplate, customName: string) => void;
}

const categoryIcons = {
  productivity: Target,
  lifestyle: BookOpen,
  creative: Lightbulb,
  health: Heart,
};

const categoryLabels = {
  productivity: 'Productivity',
  lifestyle: 'Lifestyle',
  creative: 'Creative',
  health: 'Health',
};

export default function TemplateGallery({ open, onOpenChange, onTemplateSelect }: TemplateGalleryProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<CollectionTemplate | null>(null);
  const [customName, setCustomName] = useState('');

  const handleTemplateClick = (template: CollectionTemplate) => {
    setSelectedTemplate(template);
    setCustomName(template.name);
  };

  const handleCreate = () => {
    if (selectedTemplate && customName.trim()) {
      onTemplateSelect(selectedTemplate, customName.trim());
      setSelectedTemplate(null);
      setCustomName('');
      onOpenChange(false);
    }
  };

  const handleBack = () => {
    setSelectedTemplate(null);
    setCustomName('');
  };

  // Group templates by category
  const categories = Array.from(new Set(collectionTemplates.map(t => t.category)));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        {!selectedTemplate ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Choose a Template
              </DialogTitle>
              <DialogDescription>
                Start with a pre-built collection template
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 pt-4">
              {categories.map((category) => {
                const templates = collectionTemplates.filter(t => t.category === category);
                const Icon = categoryIcons[category];

                return (
                  <div key={category}>
                    <div className="flex items-center gap-2 mb-3">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                        {categoryLabels[category]}
                      </h3>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      {templates.map((template) => (
                        <button
                          key={template.id}
                          onClick={() => handleTemplateClick(template)}
                          className="flex items-start gap-3 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors text-left"
                        >
                          <div className="text-3xl">{template.icon}</div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold mb-1">{template.name}</h4>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {template.description}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <span className="text-2xl">{selectedTemplate.icon}</span>
                {selectedTemplate.name}
              </DialogTitle>
              <DialogDescription>
                {selectedTemplate.description}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Collection Name</label>
                <Input
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="Give your collection a name..."
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Preview</label>
                <div className="p-4 border rounded-lg bg-muted/30 space-y-2 max-h-64 overflow-y-auto">
                  {selectedTemplate.items.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm">
                      {item.symbol === 'bullet' && <div className="w-1.5 h-1.5 rounded-full bg-foreground mt-1.5" />}
                      {item.symbol === 'complete' && <span className="text-foreground">×</span>}
                      {item.symbol === 'note' && <span className="text-foreground">-</span>}
                      {item.symbol === 'event' && <span className="text-foreground">○</span>}
                      <span className={item.symbol === 'note' ? 'font-medium' : 'text-muted-foreground'}>
                        {item.content || '(empty line)'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedTemplate.customFields && selectedTemplate.customFields.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Suggested Fields</label>
                  <div className="flex flex-wrap gap-2">
                    {selectedTemplate.customFields.map((field) => (
                      <span key={field} className="text-xs px-2 py-1 bg-muted rounded-md">
                        {field}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button onClick={handleBack} variant="outline" className="flex-1">
                  Back
                </Button>
                <Button
                  onClick={handleCreate}
                  disabled={!customName.trim()}
                  className="flex-1"
                >
                  Create Collection
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
