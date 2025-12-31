"use client";

import { useState, useEffect } from "react";
import { Blog, fetchBlogs } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import type { BlogType, SortBy } from "./use-url-filters";
import { getTagsForCategory, type TagCategory } from "@/lib/tag-filters";

const ITEMS_PER_PAGE = 12;

export interface BlogDataState {
  blogs: Blog[];
  loading: boolean;
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

export interface BlogDataFilters {
  blogType: BlogType;
  selectedBlog: string;
  sortBy: SortBy;
  searchQuery: string;
  tagCategory: TagCategory;
  selectedSubTags: string[];
  page: number;
}

export function useBlogData(filters: BlogDataFilters): BlogDataState {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    const loadBlogs = async () => {
      try {
        setLoading(true);
        const tags = getTagsForCategory(
          filters.tagCategory,
          filters.selectedSubTags
        );

        const result = await fetchBlogs({
          page: filters.page,
          limit: ITEMS_PER_PAGE,
          sortBy: filters.sortBy,
          blogType: filters.blogType,
          author:
            filters.selectedBlog === "all" ? undefined : filters.selectedBlog,
          search: filters.searchQuery || undefined,
          tags: tags,
        });

        setBlogs(result.blogs);
        setTotalCount(result.totalCount);
        setTotalPages(result.totalPages);
      } catch (error) {
        console.error("블로그 로드 실패:", error);
        toast({
          title: "오류",
          description: "블로그 데이터를 불러오는데 실패했습니다.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadBlogs();
  }, [
    filters.page,
    filters.sortBy,
    filters.blogType,
    filters.selectedBlog,
    filters.searchQuery,
    filters.tagCategory,
    filters.selectedSubTags.join(","),
    toast,
  ]);

  return {
    blogs,
    loading,
    totalCount,
    totalPages,
    currentPage: filters.page,
  };
}
