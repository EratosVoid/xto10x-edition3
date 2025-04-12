"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@heroui/button";
import { Spinner } from "@heroui/spinner";
import { Pagination } from "@heroui/pagination";
import { Tabs, Tab } from "@heroui/tabs";
import { Chip } from "@heroui/chip";
import { Input } from "@heroui/input";

import PostCard from "@/components/PostCard";

// Search icon component (since @heroui/icons isn't available)
const SearchIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="text-default-400"
  >
    <path
      d="M21 21L15.5 15.5M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Post types with colors
const POST_TYPES = [
  { key: "all", label: "All Types", color: "default" },
  { key: "general", label: "General", color: "default" },
  { key: "event", label: "Events", color: "primary" },
  { key: "poll", label: "Polls", color: "secondary" },
  { key: "petition", label: "Petitions", color: "success" },
  { key: "announcement", label: "Announcements", color: "warning" },
];

export default function PostsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const searchTerm = useRef("");
  const [selectedType, setSelectedType] = useState("all");
  const [activeTab, setActiveTab] = useState("all");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [searchInput, setSearchInput] = useState("");

  // Check for type parameter in URL
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const typeParam = searchParams.get("type");

    if (typeParam && POST_TYPES.some((type) => type.key === typeParam)) {
      setSelectedType(typeParam);
    }
  }, []);

  // Fetch posts when filters change
  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/posts");

      return;
    }

    fetchPosts();
    if (session?.user) {
      fetchPosts(true);
    }
  }, [status, pagination.page, selectedType, searchTerm.current, activeTab]);

  const fetchPosts = async (self = false) => {
    try {
      setLoading(true);

      // Build query parameters
      const params = new URLSearchParams();

      params.append("page", pagination.page.toString());
      params.append("limit", pagination.limit.toString());

      if (self) {
        params.append("self", "true");
      }

      if (selectedType !== "all") {
        params.append("type", selectedType);
      }

      if (searchTerm.current) {
        params.append("search", searchTerm.current);
      }

      const response = await fetch(`/api/posts?${params.toString()}`);

      if (!response.ok) {
        const errorData = await response.json();

        throw new Error(errorData.error || "Failed to fetch posts");
      }

      const data = await response.json();

      setPosts(data.posts);
      setPagination(data.pagination);
    } catch (err: any) {
      console.error("Error fetching posts:", err);
      setError(err.message || "Failed to load posts");
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }
  };

  const handlePageChange = (page: number) => {
    setPagination({ ...pagination, page });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    searchTerm.current = searchInput;
    setPagination({ ...pagination, page: 1 }); // Reset to first page on new search
  };

  const handleClearFilters = () => {
    searchTerm.current = "";
    setSearchInput("");
    setSelectedType("all");
    setPagination({ ...pagination, page: 1 });
  };

  // Show loading or error state
  if (status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  // Get color for the current post type
  const getPostTypeColor = (type: string) => {
    const postType = POST_TYPES.find((t) => t.key === type);
    return postType?.color || "default";
  };

  return (
    <div className="w-full mx-auto py-8 px-4 sm:px-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Community Posts</h1>
          <p className="text-default-500">
            Posts from your {(session?.user as any)?.locality} community
          </p>
        </div>
        <Button
          className="mt-4 md:mt-0"
          color="primary"
          size="lg"
          onPress={() => router.push("/posts/create")}
        >
          Create Post
        </Button>
      </div>

      <Tabs
        className="mb-6"
        selectedKey={activeTab}
        size="lg"
        onSelectionChange={(key) => setActiveTab(key as string)}
      >
        <Tab key="all" title="All Posts" />
        <Tab key="my" title="My Posts" />
      </Tabs>

      {/* Redesigned Filters */}
      <div className="mb-6 space-y-4">
        {/* Type Filters as Chips */}
        <div className="flex flex-wrap gap-2">
          {POST_TYPES.map((type) => (
            <Chip
              key={type.key}
              color={
                type.key === selectedType ? (type.color as any) : "default"
              }
              variant={type.key === selectedType ? "solid" : "bordered"}
              size="lg"
              className={`cursor-pointer transition-all ${
                type.key === selectedType ? "font-medium" : ""
              }`}
              onClick={() => setSelectedType(type.key)}
            >
              {type.label}
            </Chip>
          ))}
        </div>

        {/* Active Filters Badge */}
        {(selectedType !== "all" || searchInput) && (
          <div className="flex items-center gap-2">
            <Chip size="sm" color="primary" variant="flat" className="px-2">
              {selectedType !== "all" && searchInput
                ? "2 filters active"
                : "1 filter active"}
            </Chip>
            <Button
              variant="light"
              size="sm"
              onClick={handleClearFilters}
              className="text-default-500 hover:text-default-700"
            >
              Clear all
            </Button>
          </div>
        )}

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2 items-center">
          <Input
            classNames={{
              base: "w-full",
              inputWrapper: "shadow-sm",
            }}
            placeholder="Search posts by title or description..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            startContent={<SearchIcon />}
            size="lg"
          />
          <Button
            type="submit"
            color="primary"
            size="lg"
            isDisabled={!searchInput.trim().length}
          >
            Search
          </Button>
        </form>
      </div>

      {/* Error display */}
      {error && (
        <div className="bg-danger-50 p-4 rounded-lg mb-6 text-danger">
          {error}
        </div>
      )}

      {/* Posts List */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Spinner size="lg" />
        </div>
      ) : activeTab === "all" ? (
        <>
          {posts.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 mt-8">
              {posts.map((post: any) => (
                <PostCard key={post._id} post={post} showAuthor={true} />
              ))}
            </div>
          ) : (
            <div className="bg-default-50 p-8 rounded-lg text-center mt-8">
              <p className="text-xl font-semibold mb-2">No posts found</p>
              <p className="text-default-500 mb-4">
                {selectedType !== "all" || searchTerm
                  ? "Try changing your search filters"
                  : "Be the first to post in your community!"}
              </p>
              <Button
                color="primary"
                size="lg"
                onPress={() => router.push("/posts/create")}
              >
                Create Post
              </Button>
            </div>
          )}
        </>
      ) : (
        <>
          {posts.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 mt-8">
              {posts.map((post: any) => (
                <PostCard
                  key={post._id}
                  post={post}
                  showAuthor={false}
                  showEdit={true}
                />
              ))}
            </div>
          ) : (
            <div className="bg-default-50 p-8 rounded-lg text-center mt-8">
              <p className="text-xl font-semibold mb-2">No posts yet</p>
              <p className="text-default-500 mb-4">
                Create your first post to get started!
              </p>
              <Button
                color="primary"
                size="lg"
                onPress={() => router.push("/posts/create")}
              >
                Create Post
              </Button>
            </div>
          )}
        </>
      )}

      {/* Pagination */}
      {activeTab === "all" && pagination.pages > 1 && (
        <div className="flex justify-center mt-8">
          <Pagination
            initialPage={pagination.page}
            size="lg"
            total={pagination.pages}
            onChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}
