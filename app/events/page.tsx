"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardBody, CardFooter } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Chip } from "@heroui/chip";
import { Pagination } from "@heroui/pagination";
import { Select, SelectItem } from "@heroui/select";

// Simulated event data
const dummyEvents = [
  {
    id: "1",
    title: "Community Clean-up Day",
    description: "Join us for a day of cleaning up our local park and streets.",
    date: "2023-06-15T10:00:00",
    location: "Central Park",
    organizer: "Green Initiative Group",
    locality: "Downtown",
    category: "environment",
  },
  {
    id: "2",
    title: "Local Business Networking",
    description: "Network with local business owners and entrepreneurs.",
    date: "2023-06-18T18:30:00",
    location: "Community Center",
    organizer: "Chamber of Commerce",
    locality: "Downtown",
    category: "business",
  },
  {
    id: "3",
    title: "Summer Reading Program Kickoff",
    description:
      "Launch of the annual summer reading program for children and adults.",
    date: "2023-06-20T14:00:00",
    location: "Public Library",
    organizer: "Library Staff",
    locality: "Eastside",
    category: "education",
  },
  {
    id: "4",
    title: "Neighborhood Watch Meeting",
    description:
      "Monthly meeting to discuss community safety and crime prevention.",
    date: "2023-06-22T19:00:00",
    location: "Police Station Community Room",
    organizer: "Neighborhood Watch Committee",
    locality: "Westside",
    category: "safety",
  },
  {
    id: "5",
    title: "Farmers Market",
    description: "Weekly farmers market featuring local produce and goods.",
    date: "2023-06-17T08:00:00",
    location: "Town Square",
    organizer: "Local Farmers Association",
    locality: "Downtown",
    category: "food",
  },
  {
    id: "6",
    title: "Town Hall Meeting",
    description:
      "Discussion of upcoming infrastructure projects and community improvements.",
    date: "2023-06-25T18:00:00",
    location: "City Hall",
    organizer: "Mayor's Office",
    locality: "Downtown",
    category: "government",
  },
];

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
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [page, setPage] = useState(1);
  const itemsPerPage = 4;

  // Filter events based on search and category
  const filteredEvents = dummyEvents.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" || event.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Paginate the results
  const displayedEvents = filteredEvents.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Community Events</h1>
          <p className="text-default-500">
            Discover and join events in your neighborhood
          </p>
        </div>
        <Button
          color="primary"
          className="mt-4 md:mt-0"
          onClick={() => router.push("/events/create")}
        >
          Create Event
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 my-6">
        <Input
          placeholder="Search events..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
        <Select
          placeholder="Filter by category"
          selectedKeys={[selectedCategory]}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="max-w-xs"
        >
          {categories.map((category) => (
            <SelectItem key={category.value} textValue={category.value}>
              {category.label}
            </SelectItem>
          ))}
        </Select>
      </div>

      {/* Event Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        {displayedEvents.length > 0 ? (
          displayedEvents.map((event) => (
            <Card key={event.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex gap-3">
                <div className="flex flex-col">
                  <p className="text-lg font-bold">{event.title}</p>
                  <p className="text-small text-default-500">
                    Organized by {event.organizer}
                  </p>
                </div>
              </CardHeader>
              <CardBody>
                <p className="mb-3">{event.description}</p>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <div>
                    <p className="text-small font-bold">Date & Time</p>
                    <p className="text-small text-default-500">
                      {formatDate(event.date)}
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
                <Chip
                  color={getCategoryColor(event.category) as any}
                  variant="flat"
                >
                  {event.category.charAt(0).toUpperCase() +
                    event.category.slice(1)}
                </Chip>
                <Button
                  color="primary"
                  variant="light"
                  onClick={() => router.push(`/events/${event.id}`)}
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
              We couldn&apos;t find any events matching your criteria.
            </p>
            <Button
              color="primary"
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("all");
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>

      {/* Pagination */}
      {filteredEvents.length > itemsPerPage && (
        <div className="flex justify-center mt-10">
          <Pagination
            total={Math.ceil(filteredEvents.length / itemsPerPage)}
            initialPage={1}
            page={page}
            onChange={setPage}
          />
        </div>
      )}
    </div>
  );
}
