"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardBody, CardFooter } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Chip } from "@heroui/chip";
import { Pagination } from "@heroui/pagination";
import { Select, SelectItem } from "@heroui/select";
import { useSession } from "next-auth/react";

// Remove dummy events data

// Category options with color mapping
const categories = [
  { value: "all", label: "All Categories", color: "default" },
  { value: "environment", label: "Environment", color: "success" },
  { value: "business", label: "Business", color: "primary" },
  { value: "education", label: "Education", color: "secondary" },
  { value: "safety", label: "Safety", color: "warning" },
  { value: "food", label: "Food", color: "danger" },
  { value: "government", label: "Government", color: "default" },
];

// Get category color
const getCategoryColor = (category: string) => {
  const found = categories.find((c) => c.value === category);

  return found ? found.color : "default";
};

// Format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);

  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function EventsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [page, setPage] = useState(1);
  const itemsPerPage = 4;
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch events from API
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        if (status !== "authenticated") {
          setLoading(false);
          return;
        }

        const res = await fetch("/api/events");

        if (!res.ok) throw new Error("Failed to load events");
        const data = await res.json();

        setEvents(data.events);
      } catch (err: any) {
        setError(err.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [status]);

  // Filter events based on search and category
  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.postId.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.postId.description.toLowerCase().includes(searchTerm.toLowerCase());

    // For now, we're not filtering by category as it's not in the model
    // Once category is added, we can implement this filtering
    const matchesCategory = true; // selectedCategory === "all" || event.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Paginate the results
  const displayedEvents = filteredEvents.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Loading events...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-danger">{error}</p>
      </div>
    );
  }

  return (
    <div className="!w-full py-8 px-4 sm:px-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Community Events</h1>
          <p className="text-default-500">
            Discover and join events in your neighborhood
          </p>
        </div>
        <Button
          className="mt-4 md:mt-0"
          color="primary"
          onPress={() => router.push("/posts/create?type=event")}
        >
          Create Event
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 my-6">
        <Input
          className="max-w-md"
          placeholder="Search events..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {/* Commenting out category filter for now since it's not in the model
        <Select
          className="max-w-xs"
          placeholder="Filter by category"
          selectedKeys={[selectedCategory]}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          {categories.map((category) => (
            <SelectItem key={category.value} textValue={category.value}>
              {category.label}
            </SelectItem>
          ))}
        </Select>
        */}
      </div>

      {/* Event Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        {displayedEvents.length > 0 ? (
          displayedEvents.map((event) => (
            <Card key={event._id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex gap-3">
                <div className="flex flex-col">
                  <p className="text-lg font-bold">{event.postId.title}</p>
                  <p className="text-small text-default-500">
                    Organized by {event.organizer.name || "Anonymous"}
                  </p>
                </div>
              </CardHeader>
              <CardBody>
                <p className="mb-3">{event.postId.description}</p>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <div>
                    <p className="text-small font-bold">Date & Time</p>
                    <p className="text-small text-default-500">
                      {formatDate(event.startDate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-small font-bold">Location</p>
                    <p className="text-small text-default-500">
                      {event.location}
                    </p>
                  </div>
                </div>
              </CardBody>
              <CardFooter className="flex justify-between items-center">
                <Chip color="primary" variant="flat">
                  {event.postId.locality}
                </Chip>
                <Button
                  color="primary"
                  variant="light"
                  onClick={() => router.push(`/posts/${event.postId._id}`)}
                >
                  View Details
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-2 flex flex-col items-center justify-center p-12 bg-default-50 rounded-lg">
            <p className="text-xl font-semibold mb-2">No events found</p>
            <p className="text-default-500 text-center mb-6">
              {status === "authenticated"
                ? "We couldn't find any events matching your criteria."
                : "Please log in to view events in your community."}
            </p>
            {status === "authenticated" ? (
              <Button
                color="primary"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("all");
                }}
              >
                Clear Filters
              </Button>
            ) : (
              <Button color="primary" onClick={() => router.push("/login")}>
                Log In
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Pagination */}
      {filteredEvents.length > itemsPerPage && (
        <div className="flex justify-center mt-10">
          <Pagination
            initialPage={1}
            page={page}
            total={Math.ceil(filteredEvents.length / itemsPerPage)}
            onChange={setPage}
          />
        </div>
      )}
    </div>
  );
}
