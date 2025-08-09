'use client';

import { Badge } from 'components/ui/badge';
import { Button } from 'components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from 'components/ui/card';
import { Input } from 'components/ui/input';
import { Label } from 'components/ui/label';
import { Plus, Tag, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Tag {
  id: string;
  name: string;
}

export default function TagsPage() {
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const response = await fetch('/api/account/tags');
      const data = await response.json();
      
      if (response.ok) {
        setTags(data.tags || []);
      } else {
        setError(data.error || 'Failed to fetch tags');
      }
    } catch (error) {
      setError('Failed to fetch tags');
    } finally {
      setIsLoading(false);
    }
  };

  const addTag = async () => {
    if (!newTag.trim()) return;

    setIsAdding(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/account/tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tags: [newTag.trim()] }),
      });

      const data = await response.json();

      if (response.ok) {
        setTags([...tags, newTag.trim()]);
        setNewTag('');
        setSuccess('Tag added successfully');
      } else {
        setError(data.error || 'Failed to add tag');
      }
    } catch (error) {
      setError('Failed to add tag');
    } finally {
      setIsAdding(false);
    }
  };

  const removeTag = async (tagToRemove: string) => {
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/account/tags', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tags: [tagToRemove] }),
      });

      const data = await response.json();

      if (response.ok) {
        setTags(tags.filter(tag => tag !== tagToRemove));
        setSuccess('Tag removed successfully');
      } else {
        setError(data.error || 'Failed to remove tag');
      }
    } catch (error) {
      setError('Failed to remove tag');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addTag();
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">My Tags</h1>
          <p className="text-muted-foreground">
            Manage your account tags and preferences
          </p>
        </div>
        <Card>
          <CardContent className="text-center py-12">
            <div className="animate-pulse">Loading...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Tags</h1>
        <p className="text-muted-foreground">
          Manage your account tags and preferences
        </p>
      </div>

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {success && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <p className="text-green-800">{success}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Add New Tag
          </CardTitle>
          <CardDescription>
            Add tags to help categorize your account and preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="new-tag">Tag Name</Label>
              <Input
                id="new-tag"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter tag name..."
                disabled={isAdding}
              />
            </div>
            <Button 
              onClick={addTag} 
              disabled={!newTag.trim() || isAdding}
              className="mt-6"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Current Tags</CardTitle>
          <CardDescription>
            {tags.length === 0 ? 'No tags added yet' : `${tags.length} tag(s) added`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {tags.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No tags added yet. Add your first tag above.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 