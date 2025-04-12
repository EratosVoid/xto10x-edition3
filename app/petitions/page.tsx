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
        if (status !== "authenticated") {
          setLoading(false);
          return;
        }

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
  }, [status]);

  // Filter petitions based on search and category
  const filteredPetitions = petitions.filter((petition) => {
    const matchesSearch =
      petition.postId.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      petition.postId.description
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    // Category filter - for now it's not in the schema so we return true
    const matchesCategory = true;

    return matchesSearch && matchesCategory;
  });

  // Calculate percentage completion
  const calculateCompletionPercentage = (current: number, goal: number) => {
    return Math.min(Math.round((current / goal) * 100), 100);
  };

  // Get the current signature count from the poll data
  const getCurrentSignatures = (petition: any) => {
    // In our simpler model, signatures are stored directly in the petition
    return petition.signatures || 0;
  };

  // Handle petition signing
  const handleSign = async (petitionId: string) => {
    if (status !== "authenticated") {
      router.push("/login?callbackUrl=/petitions");
      return;
    }

    try {
      const res = await fetch(`/api/petitions/${petitionId}/sign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) throw new Error("Failed to sign petition");

      // Mark petition as signed
      setSignedPetitions({
        ...signedPetitions,
        [petitionId]: true,
      });

      // Refresh the petitions list to update signature counts
      const updatedPetitionsRes = await fetch("/api/petitions");
      if (updatedPetitionsRes.ok) {
        const updatedData = await updatedPetitionsRes.json();
        setPetitions(updatedData.petitions);
      }
    } catch (err: any) {
      setError(err.message || "Failed to sign petition");
    }
  };

  // Check if user has already signed this petition
  const hasUserSigned = (petition: any) => {
    if (!session || !petition.supporters) return false;
    const userEmail = session.user?.email;
    if (!userEmail) return false;

    return petition.supporters.some((user: any) => user.email === userEmail);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Loading petitions...</p>
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
    <div className="w-full mx-auto py-8 px-4 sm:px-6">
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
          onClick={() => router.push("/posts/create?type=petition")}
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
        {/* Commenting out category filtering for now
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
        */}
      </div>

      {/* Petition Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {filteredPetitions.length > 0 ? (
          filteredPetitions.map((petition) => {
            const currentSignatures = getCurrentSignatures(petition);
            const userHasSigned = hasUserSigned(petition);
            const completionPercentage = calculateCompletionPercentage(
              currentSignatures,
              petition.goal
            );
            const isCompleted = completionPercentage >= 100;

            return (
              <Card key={petition._id} className="w-full">
                <CardHeader className="flex flex-col">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold">
                        {petition.postId.title}
                      </h3>
                      <p className="text-small text-default-500">
                        Created {formatDate(petition.createdAt)}
                      </p>
                    </div>
                    {isCompleted && (
                      <Chip color="success" variant="flat">
                        Goal Reached
                      </Chip>
                    )}
                    {userHasSigned && (
                      <Chip color="primary" variant="flat">
                        Signed
                      </Chip>
                    )}
                  </div>
                </CardHeader>

                <CardBody>
                  <p className="mb-6">{petition.postId.description}</p>

                  <div className="mb-2 flex justify-between items-center">
                    <span>Target: {petition.target}</span>
                    <span className="text-small font-medium">
                      {currentSignatures} of {petition.goal} signatures
                    </span>
                  </div>

                  <Progress
                    aria-label={`${completionPercentage}% complete`}
                    className="h-3 mb-4"
                    color={isCompleted ? "success" : "primary"}
                    value={completionPercentage}
                  />

                  <div className="flex justify-between items-center text-small text-default-500">
                    <span>Locality: {petition.postId.locality}</span>
                    <span>
                      {petition.goal - currentSignatures > 0
                        ? `${petition.goal - currentSignatures} more needed`
                        : "Goal reached!"}
                    </span>
                  </div>
                </CardBody>

                <Divider />

                <CardFooter className="flex justify-between">
                  <Chip color="primary" variant="flat">
                    {petition.postId.priority}
                  </Chip>

                  <div className="flex gap-2">
                    <Button
                      color="primary"
                      variant="flat"
                      onClick={() =>
                        router.push(`/posts/${petition.postId._id}`)
                      }
                    >
                      View Details
                    </Button>

                    {!userHasSigned && (
                      <Button
                        color="primary"
                        onClick={() => handleSign(petition._id)}
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
              {status === "authenticated"
                ? "We couldn't find any petitions matching your criteria."
                : "Please log in to view petitions in your community."}
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
    </div>
  );
}
