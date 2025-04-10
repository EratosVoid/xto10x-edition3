"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardHeader, CardBody, CardFooter } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Chip } from "@heroui/chip";
import { Avatar } from "@heroui/avatar";
import { Pagination } from "@heroui/pagination";
import { Spinner } from "@heroui/spinner";
import { Select, SelectItem } from "@heroui/select";

// Post categories
const categories = [
  { value: "all", label: "All Categories", color: "default" },
  { value: "community", label: "Community", color: "primary" },
  { value: "events", label: "Events", color: "success" },
  { value: "announcements", label: "Announcements", color: "warning" },
  { value: "help", label: "Help Needed", color: "danger" },
  { value: "discussion", label: "Discussion", color: "secondary" },
];

// Post types
const postTypes = [
  { value: "all", label: "All Types" },
  { value: "general", label: "General" },
  { value: "event", label: "Event" },
  { value: "poll", label: "Poll" },
  { value: "petition", label: "Petition" },
  { value: "announcement", label: "Announcement" },
];

// Format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return (
      "Today at " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  } else if (diffDays === 1) {
    return (
      "Yesterday at " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  } else if (diffDays < 7) {
    return diffDays + " days ago";
  } else {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
};

export default function PostsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
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
  }, [status, pagination.page, selectedCategory, selectedType, searchTerm]);

  const fetchPosts = async () => {
    try {
      setLoading(true);

      // Build query parameters
      const params = new URLSearchParams();
      params.append("page", pagination.page.toString());
      params.append("limit", pagination.limit.toString());

      if (selectedCategory !== "all") {
        params.append("category", selectedCategory);
      }

      if (selectedType !== "all") {
        params.append("type", selectedType);
      }

      if (searchTerm) {
        params.append("search", searchTerm);
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
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setPagination({ ...pagination, page });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination({ ...pagination, page: 1 }); // Reset to first page on new search
  };

  // Show loading or error state
  if (status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  // Get category color for chip
  const getCategoryColor = (category: string) => {
    const found = categories.find((c) => c.value === category);
    return found ? found.color : "default";
  };

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
          color="primary"
          className="mt-4 md:mt-0"
          onClick={() => router.push("/posts/create")}
        >
          Create Post
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="my-6">
        <form
          onSubmit={handleSearch}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Input
            placeholder="Search posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-grow"
          />
          <Select
            placeholder="Filter by type"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="sm:w-40"
          >
            {postTypes.map((type) => (
              <SelectItem key={type.value} textValue={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </Select>
          <Button type="submit" color="primary">
            Search
          </Button>
        </form>

        {/* Category tags */}
        <div className="flex flex-wrap gap-2 mt-4">
          {categories.map((category) => (
            <Chip
              key={category.value}
              color={
                category.value === selectedCategory
                  ? (category.color as any)
                  : "default"
              }
              variant={category.value === selectedCategory ? "solid" : "flat"}
              className="cursor-pointer"
              onClick={() => setSelectedCategory(category.value)}
            >
              {category.label}
            </Chip>
          ))}
        </div>
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
          <Spinner />
        </div>
      ) : posts.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 mt-8">
          {posts.map((post: any) => (
            <Card key={post._id} className="w-full">
              <CardHeader className="flex flex-col">
                <div className="flex justify-between items-start">
                  <div className="flex gap-3">
                    <Avatar
                      src={
                        post.createdBy?.image ||
                        "https://i.pravatar.cc/150?img=1"
                      }
                      name={post.createdBy?.name || "User"}
                      size="sm"
                    />
                    <div>
                      <h3 className="text-xl font-bold">{post.title}</h3>
                      <p className="text-small text-default-500">
                        By {post.createdBy?.name} • {formatDate(post.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Chip
                      color={getCategoryColor(post.category) as any}
                      variant="flat"
                      size="sm"
                    >
                      {post.category}
                    </Chip>
                    <Chip color="default" variant="flat" size="sm">
                      {post.type}
                    </Chip>
                  </div>
                </div>
              </CardHeader>

              <CardBody>
                <p>{post.description}</p>
              </CardBody>

              <CardFooter>
                <Button
                  color="primary"
                  variant="flat"
                  onClick={() => router.push(`/posts/${post._id}`)}
                >
                  View Details
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="bg-default-50 p-8 rounded-lg text-center">
          <p className="text-xl font-semibold mb-2">No posts found</p>
          <p className="text-default-500 mb-4">
            {selectedCategory !== "all" || selectedType !== "all" || searchTerm
              ? "Try changing your search filters"
              : "Be the first to post in your community!"}
          </p>
          {(selectedCategory !== "all" ||
            selectedType !== "all" ||
            searchTerm) && (
            <Button
              variant="flat"
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("all");
                setSelectedType("all");
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center mt-8">
          <Pagination
            total={pagination.pages}
            initialPage={pagination.page}
            onChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}
