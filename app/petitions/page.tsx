"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardBody, CardFooter } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Chip } from "@heroui/chip";
import { Progress } from "@heroui/progress";
import { Divider } from "@heroui/divider";
import { useSession } from "next-auth/react";

// Simulated petition data
const dummyPetitions = [
  {
    id: "1",
    title: "Add More Bike Lanes on Main Street",
    description:
      "Petition to add designated bike lanes on Main Street to improve safety for cyclists and reduce traffic congestion.",
    goal: 500,
    currentSignatures: 324,
    createdBy: "Cycling Coalition",
    expiration: "2026-08-15",
    locality: "Downtown",
    category: "transportation",
    targetOfficial: "City Transportation Department",
  },
  {
    id: "2",
    title: "Extend Library Operating Hours",
    description:
      "Request to extend the public library hours to include evenings and weekends to better serve working community members.",
    goal: 250,
    currentSignatures: 187,
    createdBy: "Library Support Group",
    expiration: "2023-08-05",
    locality: "Eastside",
    category: "education",
    targetOfficial: "Library Board",
  },
  {
    id: "3",
    title: "Build Community Garden in Riverside Park",
    description:
      "Proposal to convert unused space in Riverside Park into a community garden for residents to grow vegetables and flowers.",
    goal: 300,
    currentSignatures: 216,
    createdBy: "Green Space Alliance",
    expiration: "2023-08-20",
    locality: "Riverside",
    category: "environment",
    targetOfficial: "Parks Department",
  },
  {
    id: "4",
    title: "Improve Sidewalk Accessibility",
    description:
      "Petition to repair broken sidewalks and add ramps for improved accessibility for all residents, including those with mobility challenges.",
    goal: 400,
    currentSignatures: 178,
    createdBy: "Accessibility Advocates",
    expiration: "2023-09-10",
    locality: "Citywide",
    category: "infrastructure",
    targetOfficial: "Public Works Department",
  },
  {
    id: "5",
    title: "Create After-School Programs at Community Center",
    description:
      "Proposal to establish free after-school programs for children at the local community center to provide education and recreation.",
    goal: 350,
    currentSignatures: 289,
    createdBy: "Parents Association",
    expiration: "2023-08-30",
    locality: "Westside",
    category: "education",
    targetOfficial: "Community Services Director",
  },
];

// Category options with color mapping
const categories = [
  { value: "all", label: "All Categories", color: "default" },
  { value: "transportation", label: "Transportation", color: "primary" },
  { value: "education", label: "Education", color: "success" },
  { value: "environment", label: "Environment", color: "secondary" },
  { value: "infrastructure", label: "Infrastructure", color: "warning" },
  { value: "health", label: "Health", color: "danger" },
  { value: "safety", label: "Safety", color: "default" },
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
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export default function PetitionsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [petitions, setPetitions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [signedPetitions, setSignedPetitions] = useState<
    Record<string, boolean>
  >({});

  // Fetch petitions from API
  useEffect(() => {
    const fetchPetitions = async () => {
      try {
        const res = await fetch("/api/petitions");

        if (!res.ok) throw new Error("Failed to load petitions");
        const data = await res.json();

        setPetitions(data.petitions);
      } catch (err: any) {
        setError(err.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchPetitions();
  }, []);

  const filteredPetitions = petitions.filter((petition) => {
    const matchesSearch =
      petition.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      petition.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" || petition.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // // Filter petitions based on search and category
  // const filteredPetitions = dummyPetitions.filter((petition) => {
  //   const matchesSearch =
  //     petition.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     petition.description.toLowerCase().includes(searchTerm.toLowerCase());

  //   const matchesCategory =
  //     selectedCategory === "all" || petition.category === selectedCategory;

  //   return matchesSearch && matchesCategory;
  // });

  // Calculate percentage completion
  const calculateCompletionPercentage = (current: number, goal: number) => {
    return Math.min(Math.round((current / goal) * 100), 100);
  };

  // Handle petition signing
  const handleSign = (petitionId: string) => {
    if (status !== "authenticated") {
      router.push("/login?callbackUrl=/petitions");

      return;
    }

    // In a real app, we would call an API to save the signature
    setSignedPetitions({
      ...signedPetitions,
      [petitionId]: true,
    });

    // This would update the signature count in a real application
    console.log(`Signed petition ${petitionId}`, session);
  };

  // Check if petition is expired
  const isPetitionExpired = (expirationDate: string) => {
    const expiration = new Date(expirationDate);
    const now = new Date();

    return expiration < now;
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Community Petitions</h1>
          <p className="text-default-500">
            Support and create petitions to drive change in your community
          </p>
        </div>
        <Button
          className="mt-4 md:mt-0"
          color="primary"
          onClick={() => router.push("/petitions/create")}
        >
          Start a Petition
        </Button>
      </div>

      {/* Search */}
      <div className="my-6">
        <Input
          className="max-w-md"
          placeholder="Search petitions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {/* Category tags */}
        <div className="flex flex-wrap gap-2 mt-4">
          {categories.map((category) => (
            <Chip
              key={category.value}
              className="cursor-pointer"
              color={
                category.value === selectedCategory
                  ? (category.color as any)
                  : "default"
              }
              variant={category.value === selectedCategory ? "solid" : "flat"}
              onClick={() => setSelectedCategory(category.value)}
            >
              {category.label}
            </Chip>
          ))}
        </div>
      </div>

      {/* Petition Cards */}
      <div className="grid grid-cols-1 gap-6 mt-8">
        {filteredPetitions.length > 0 ? (
          filteredPetitions.map((petition) => {
            const isExpired = isPetitionExpired(petition.expiration);
            const hasSigned = signedPetitions[petition.id];
            const completionPercentage = calculateCompletionPercentage(
              petition.currentSignatures,
              petition.goal,
            );
            const isCompleted = completionPercentage >= 100;

            return (
              <Card key={petition.id} className="w-full">
                <CardHeader className="flex flex-col">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold">{petition.title}</h3>
                      <p className="text-small text-default-500">
                        By {petition.createdBy} • Expires{" "}
                        {formatDate(petition.expiration)}
                      </p>
                    </div>
                    {isExpired && (
                      <Chip color="danger" variant="flat">
                        Expired
                      </Chip>
                    )}
                    {isCompleted && !isExpired && (
                      <Chip color="success" variant="flat">
                        Goal Reached
                      </Chip>
                    )}
                    {hasSigned && !isExpired && (
                      <Chip color="primary" variant="flat">
                        Signed
                      </Chip>
                    )}
                  </div>
                </CardHeader>

                <CardBody>
                  <p className="mb-6">{petition.description}</p>

                  <div className="mb-2 flex justify-between items-center">
                    <span>Target: {petition.targetOfficial}</span>
                    <span className="text-small font-medium">
                      {petition.currentSignatures} of {petition.goal} signatures
                    </span>
                  </div>

                  <Progress
                    aria-label={`${completionPercentage}% complete`}
                    className="h-3 mb-4"
                    color={isCompleted ? "success" : "primary"}
                    value={completionPercentage}
                  />

                  <div className="flex justify-between items-center text-small text-default-500">
                    <span>Locality: {petition.locality}</span>
                    <span>
                      {petition.goal - petition.currentSignatures > 0
                        ? `${petition.goal - petition.currentSignatures} more needed`
                        : "Goal reached!"}
                    </span>
                  </div>
                </CardBody>

                <Divider />

                <CardFooter className="flex justify-between">
                  <Chip
                    color={getCategoryColor(petition.category) as any}
                    variant="flat"
                  >
                    {petition.category.charAt(0).toUpperCase() +
                      petition.category.slice(1)}
                  </Chip>

                  <div className="flex gap-2">
                    <Button
                      color="primary"
                      variant="flat"
                      onClick={() => router.push(`/petitions/${petition.id}`)}
                    >
                      View Details
                    </Button>

                    {!isExpired && !hasSigned && (
                      <Button
                        color="primary"
                        onClick={() => handleSign(petition.id)}
                      >
                        Sign Petition
                      </Button>
                    )}
                  </div>
                </CardFooter>
              </Card>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center p-12 bg-default-50 rounded-lg">
            <p className="text-xl font-semibold mb-2">No petitions found</p>
            <p className="text-default-500 text-center mb-6">
              We couldn&apos;t find any petitions matching your criteria.
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
    </div>
  );
}
