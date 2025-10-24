'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import TaskList, { TaskSymbol } from '@/components/TaskList';
import AppNav from '@/components/AppNav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Plus, Trash2 } from 'lucide-react';

interface Collection {
  id: number;
  name: string;
  description?: string;
}

interface CollectionItem {
  id: number;
  content: string;
  symbol: TaskSymbol;
  position: number;
}

export default function CollectionsPage() {
  const router = useRouter();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [items, setItems] = useState<CollectionItem[]>([]);
  const [showNewCollectionDialog, setShowNewCollectionDialog] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionDescription, setNewCollectionDescription] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCollections();
  }, []);

  useEffect(() => {
    if (selectedCollection) {
      loadCollectionItems(selectedCollection.id);
    }
  }, [selectedCollection]);

  const loadCollections = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/collections');
      if (response.status === 401) {
        router.push('/login');
        return;
      }
      const data = await response.json();
      setCollections(data);
    } catch (error) {
      console.error('Error loading collections:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCollectionItems = async (collectionId: number) => {
    try {
      const response = await fetch(`/api/collections?id=${collectionId}`);
      const data = await response.json();
      setItems(data);
    } catch (error) {
      console.error('Error loading collection items:', error);
    }
  };

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) return;

    try {
      const response = await fetch('/api/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCollectionName,
          description: newCollectionDescription,
        }),
      });
      const { id } = await response.json();
      const newCollection = {
        id,
        name: newCollectionName,
        description: newCollectionDescription,
      };
      setCollections([newCollection, ...collections]);
      setNewCollectionName('');
      setNewCollectionDescription('');
      setShowNewCollectionDialog(false);
      setSelectedCollection(newCollection);
    } catch (error) {
      console.error('Error creating collection:', error);
    }
  };

  const handleDeleteCollection = async (id: number) => {
    try {
      await fetch(`/api/collections?id=${id}`, { method: 'DELETE' });
      setCollections(collections.filter(c => c.id !== id));
      if (selectedCollection?.id === id) {
        setSelectedCollection(null);
        setItems([]);
      }
    } catch (error) {
      console.error('Error deleting collection:', error);
    }
  };

  const handleAddItem = async (content: string, symbol: TaskSymbol, afterSection?: string) => {
    if (!selectedCollection) return;

    try {
      // Find position after the selected section
      let position = items.length;

      if (afterSection) {
        // Find the section (note) with matching content
        const sectionIndex = items.findIndex(
          item => item.symbol === 'note' && item.content === afterSection
        );

        if (sectionIndex !== -1) {
          // Find the next section or end of list
          let insertIndex = sectionIndex + 1;

          // Skip to the end of current section (before next note)
          while (
            insertIndex < items.length &&
            items[insertIndex].symbol !== 'note'
          ) {
            insertIndex++;
          }

          position = insertIndex;
        }
      }

      const response = await fetch('/api/collections/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          collectionId: selectedCollection.id,
          content,
          symbol,
          position,
        }),
      });
      const { id } = await response.json();

      // Insert at the calculated position
      const newItems = [...items];
      newItems.splice(position, 0, { id, content, symbol, position });

      // Update positions for items after insertion
      const updatedItems = newItems.map((item, idx) => ({
        ...item,
        position: idx
      }));

      setItems(updatedItems);

      // Reload to get correct order from server
      setTimeout(() => {
        loadCollectionItems(selectedCollection.id);
      }, 100);
    } catch (error) {
      console.error('Error adding item:', error);
    }
  };

  const handleUpdateItem = async (id: number, content: string, symbol: TaskSymbol) => {
    try {
      await fetch('/api/collections/items', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, content, symbol }),
      });
      setItems(items.map(item => item.id === id ? { ...item, content, symbol } : item));
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  const handleDeleteItem = async (id: number) => {
    try {
      await fetch(`/api/collections/items?id=${id}`, { method: 'DELETE' });
      setItems(items.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <AppNav />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-foreground animate-pulse" />
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppNav />

      <main className="container max-w-6xl mx-auto py-8 px-4 flex-1">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Collections List */}
          <div className="md:col-span-1">
            <Card>
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <CardTitle>Collections</CardTitle>
                  <div className="flex gap-2">
                    <Dialog open={showNewCollectionDialog} onOpenChange={setShowNewCollectionDialog}>
                      <DialogTrigger asChild>
                        <Button size="sm" className="gap-1">
                          <Plus className="h-4 w-4" />
                          Blank
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Create Blank Collection</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Name</label>
                            <Input
                              value={newCollectionName}
                              onChange={(e) => setNewCollectionName(e.target.value)}
                              placeholder="Collection name..."
                              autoFocus
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Description</label>
                            <Input
                              value={newCollectionDescription}
                              onChange={(e) => setNewCollectionDescription(e.target.value)}
                              placeholder="Optional description..."
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="ghost" onClick={() => setShowNewCollectionDialog(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleCreateCollection}>Create</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {collections.length === 0 ? (
                    <div className="p-8 text-center">
                      <p className="text-sm text-muted-foreground">No collections yet.</p>
                      <p className="text-xs text-muted-foreground mt-1">Click &quot;New&quot; to create one.</p>
                    </div>
                  ) : (
                    collections.map((collection) => (
                      <div
                        key={collection.id}
                        onClick={() => setSelectedCollection(collection)}
                        className={`w-full p-4 text-left hover:bg-muted/50 transition-colors group cursor-pointer ${
                          selectedCollection?.id === collection.id ? 'bg-muted' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium truncate">{collection.name}</h3>
                            {collection.description && (
                              <p className="text-sm text-muted-foreground truncate mt-1">
                                {collection.description}
                              </p>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 h-7 w-7 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm('Delete this collection?')) {
                                handleDeleteCollection(collection.id);
                              }
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Collection Items */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader className="border-b">
                {selectedCollection ? (
                  <>
                    <CardTitle>{selectedCollection.name}</CardTitle>
                    {selectedCollection.description && (
                      <CardDescription>{selectedCollection.description}</CardDescription>
                    )}
                  </>
                ) : (
                  <div className="text-center">
                    <CardTitle className="text-muted-foreground font-normal">
                      Select a collection
                    </CardTitle>
                  </div>
                )}
              </CardHeader>
              <CardContent className="pt-6">
                {selectedCollection ? (
                  <TaskList
                    tasks={items}
                    onAddTask={handleAddItem}
                    onUpdateTask={handleUpdateItem}
                    onDeleteTask={handleDeleteItem}
                  />
                ) : (
                  <div className="flex items-center justify-center py-16">
                    <p className="text-sm text-muted-foreground">
                      Select a collection to view its items
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

      </main>
    </div>
  );
}
