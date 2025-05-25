
"use client";

import { useState, type FormEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2 } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => Promise<void>;
  isLoading: boolean;
  placeholder?: string;
}

export function SearchBar({ onSearch, isLoading, placeholder = "Ask Study Buddy anything..." }: SearchBarProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!query.trim() || isLoading) return;
    await onSearch(query.trim());
    // Query clearing can be handled by the parent if needed, e.g. for follow-ups
    // setQuery(''); 
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full items-center space-x-2">
      <Input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="flex-grow bg-card text-card-foreground shadow-sm focus:ring-2 focus:ring-primary"
        disabled={isLoading}
        aria-label="Search input"
      />
      <Button 
        type="submit" 
        disabled={isLoading || !query.trim()} 
        className="bg-primary hover:bg-primary/90 text-primary-foreground"
        aria-label={isLoading ? "Searching" : "Search"}
      >
        {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
        <span className="sr-only">Search</span>
      </Button>
    </form>
  );
}
