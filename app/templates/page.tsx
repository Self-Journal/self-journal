'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import AppLayout from '@/components/AppLayout';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { challengeTemplates, categories, ChallengeTemplate } from '@/lib/templates';
import { CheckCircle2, Calendar, Sparkles } from 'lucide-react';

export default function TemplatesPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [applying, setApplying] = useState<string | null>(null);

  const filteredTemplates = selectedCategory === 'all'
    ? challengeTemplates
    : challengeTemplates.filter(t => t.category === selectedCategory);

  const handleApplyTemplate = async (template: ChallengeTemplate) => {
    if (applying) return;

    const confirmed = confirm(
      `Start "${template.name}"?\n\n` +
      `This will add ${template.tasks.length} recurring tasks to your journal starting today. ` +
      `The challenge will run for ${template.duration} days.\n\n` +
      `Continue?`
    );

    if (!confirmed) return;

    setApplying(template.id);

    try {
      const response = await fetch('/api/templates/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: template.id,
          startDate: format(new Date(), 'yyyy-MM-dd'),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        alert(` ${data.message}\n\nYour challenge starts today!`);
        router.push('/daily');
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error applying template:', error);
      alert('Failed to apply template. Please try again.');
    } finally {
      setApplying(null);
    }
  };

  return (
    <AppLayout showSidebar={false}>
      <div className="container max-w-5xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="h-8 w-8" />
            <h1 className="text-3xl font-bold">Challenge Templates</h1>
          </div>
          <p className="text-muted-foreground">
            Choose from popular challenges to kickstart your journey. Each template includes
            recurring tasks that will automatically appear in your daily log.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(category.id)}
              className="gap-2"
            >
              <span>{category.icon}</span>
              <span>{category.name}</span>
            </Button>
          ))}
        </div>

        {/* Templates Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="text-4xl">{template.icon}</div>
                  <Badge variant="secondary" className="text-xs">
                    {template.duration} days
                  </Badge>
                </div>
                <CardTitle className="text-lg">{template.name}</CardTitle>
                <CardDescription className="text-sm">
                  {template.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col gap-4">
                {/* Tasks Preview */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    Includes {template.tasks.length} tasks:
                  </p>
                  <ul className="space-y-1">
                    {template.tasks.slice(0, 3).map((task, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                        <span className="line-clamp-1">{task.content}</span>
                      </li>
                    ))}
                    {template.tasks.length > 3 && (
                      <li className="text-xs text-muted-foreground pl-6">
                        +{template.tasks.length - 3} more...
                      </li>
                    )}
                  </ul>
                </div>

                {/* Apply Button */}
                <Button
                  onClick={() => handleApplyTemplate(template)}
                  disabled={applying === template.id}
                  className="w-full mt-auto gap-2"
                >
                  {applying === template.id ? (
                    <>
                      <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
                      <span>Starting...</span>
                    </>
                  ) : (
                    <>
                      <Calendar className="h-4 w-4" />
                      <span>Start Challenge</span>
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No templates found in this category.</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
