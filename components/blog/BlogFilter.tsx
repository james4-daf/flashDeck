'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { BlogPost } from '@/app/blog/page';

const categories = ['All', 'Learning Science', 'Study Tips', 'Programming'];

interface BlogFilterProps {
  posts: BlogPost[];
}

export function BlogFilter({ posts }: BlogFilterProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    // Filter posts client-side by hiding/showing elements
    const postCards = document.querySelectorAll('.blog-post-card');
    const postCountElement = document.getElementById('post-count');
    let visibleCount = 0;

    postCards.forEach((card) => {
      const category = card.getAttribute('data-category');
      const title = card.getAttribute('data-title') || '';
      const description = card.getAttribute('data-description') || '';
      const tags = card.getAttribute('data-tags') || '';

      const matchesSearch =
        searchQuery === '' ||
        title.includes(searchQuery.toLowerCase()) ||
        description.includes(searchQuery.toLowerCase()) ||
        tags.includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === 'All' || category === selectedCategory;

      if (matchesSearch && matchesCategory) {
        (card as HTMLElement).style.display = '';
        visibleCount++;
      } else {
        (card as HTMLElement).style.display = 'none';
      }
    });

    // Update post count
    if (postCountElement) {
      const regularPosts = posts.filter((post) => !post.featured);
      const totalPosts = searchQuery === '' && selectedCategory === 'All'
        ? regularPosts.length
        : visibleCount;
      postCountElement.textContent = `${totalPosts} article${totalPosts !== 1 ? 's' : ''}`;
    }
  }, [searchQuery, selectedCategory, posts]);

  return (
    <div className="max-w-3xl mx-auto mb-8">
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
        <Input
          type="text"
          placeholder="Search articles..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-12 text-lg"
        />
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 justify-center">
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? 'default' : 'outline'}
            onClick={() => setSelectedCategory(category)}
            className={
              selectedCategory === category
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : ''
            }
          >
            {category}
          </Button>
        ))}
      </div>
    </div>
  );
}
