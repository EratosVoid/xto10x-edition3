"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@heroui/button";
import { Spinner } from "@heroui/spinner";
import { Pagination } from "@heroui/pagination";
import { Tabs, Tab } from "@heroui/tabs";

import PostFilters from "@/components/PostFilters";
import PostCard from "@/components/PostCard";

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination({ ...pagination, page: 1 }); // Reset to first page on new search
  };

  const handleClearFilters = () => {
    searchTerm.current = "";
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

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6">
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

      <PostFilters
        searchTerm={searchTerm.current}
        selectedType={selectedType}
        onClear={handleClearFilters}
        onSearchChange={(value: string) => (searchTerm.current = value)}
        onSubmit={handleSearch}
        onTypeChange={setSelectedType}
      />

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
