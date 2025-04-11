"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardBody, CardFooter } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Chip } from "@heroui/chip";
import { Progress } from "@heroui/progress";
import { Radio, RadioGroup } from "@heroui/radio";
import { Divider } from "@heroui/divider";
import { useSession } from "next-auth/react";

// Removed dummy polls data

export default function PollsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [searchTerm, setSearchTerm] = useState("");
  const [userVotes, setUserVotes] = useState<Record<string, string>>({});
  const [votedPolls, setVotedPolls] = useState<Record<string, boolean>>({});
  const [polls, setPolls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch polls from API
  useEffect(() => {
    const fetchPolls = async () => {
      try {
        if (status !== "authenticated") {
          setLoading(false);
          return;
        }

        const res = await fetch("/api/polls");

        if (!res.ok) throw new Error("Failed to load polls");
        const data = await res.json();

        setPolls(data.polls);
      } catch (err: any) {
        setError(err.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchPolls();
  }, [status]);

  // Filter polls based on search
  const filteredPolls = polls.filter((poll) => {
    return (
      poll.postId.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      poll.postId.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Calculate percentage for visualization
  const calculatePercentage = (votes: number, totalVotes: number) => {
    return totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
  };

  // Handle vote submission
  const handleVote = async (pollId: string, optionKey: string) => {
    if (!optionKey) return;

    try {
      const res = await fetch(`/api/polls/${pollId}/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ option: optionKey }),
      });

      if (!res.ok) throw new Error("Failed to submit vote");

      // Mark poll as voted and refresh the polls
      setVotedPolls({
        ...votedPolls,
        [pollId]: true,
      });

      // Refresh the polls list to update vote counts
      const updatedPollsRes = await fetch("/api/polls");
      if (updatedPollsRes.ok) {
        const updatedData = await updatedPollsRes.json();
        setPolls(updatedData.polls);
      }
    } catch (err: any) {
      setError(err.message || "Failed to submit vote");
    }
  };

  // Format expiration date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Check if user has already voted on this poll
  const hasUserVoted = (poll: any) => {
    if (!session || !poll.votedUsers) return false;
    const userEmail = session.user?.email;
    if (!userEmail) return false;

    return poll.votedUsers.some((user: any) => user.email === userEmail);
  };

  // Get total votes for a poll
  const getTotalVotes = (options: Record<string, number>) => {
    return Object.values(options).reduce((sum, count) => sum + count, 0);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Loading polls...</p>
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
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Community Polls</h1>
          <p className="text-default-500">
            Vote on important issues in your neighborhood
          </p>
        </div>
        <Button
          className="mt-4 md:mt-0"
          color="primary"
          onClick={() => router.push("/posts/create?type=poll")}
        >
          Create Poll
        </Button>
      </div>

      {/* Search */}
      <div className="my-6">
        <Input
          className="max-w-md"
          placeholder="Search polls..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Poll Cards */}
      <div className="grid grid-cols-1 gap-6 mt-8">
        {filteredPolls.length > 0 ? (
          filteredPolls.map((poll) => {
            const totalVotes = getTotalVotes(poll.options);
            const userHasVoted = hasUserVoted(poll);
            const showResults = userHasVoted || status !== "authenticated";

            return (
              <Card key={poll._id} className="w-full">
                <CardHeader className="flex flex-col">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold">{poll.postId.title}</h3>
                      <p className="text-small text-default-500">
                        Created {formatDate(poll.createdAt)}
                      </p>
                    </div>
                    {userHasVoted && (
                      <Chip color="success" variant="flat">
                        Voted
                      </Chip>
                    )}
                  </div>
                  <p className="mt-2">{poll.postId.description}</p>
                </CardHeader>

                <CardBody>
                  {showResults ? (
                    <div className="space-y-4">
                      {Object.entries(poll.options).map(
                        ([option, votes]: [string, any]) => {
                          const percentage = calculatePercentage(
                            votes,
                            totalVotes
                          );

                          return (
                            <div key={option} className="space-y-1">
                              <div className="flex justify-between items-center">
                                <p>{option}</p>
                                <p className="text-small font-medium">
                                  {percentage}% ({votes} votes)
                                </p>
                              </div>
                              <Progress
                                aria-label={`${option} - ${percentage}%`}
                                className="h-3"
                                color="primary"
                                value={percentage}
                              />
                            </div>
                          );
                        }
                      )}
                      <p className="text-small text-center mt-4 text-default-500">
                        Total votes: {totalVotes}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <RadioGroup
                        value={userVotes[poll._id] || ""}
                        onValueChange={(value) =>
                          setUserVotes({ ...userVotes, [poll._id]: value })
                        }
                      >
                        {Object.keys(poll.options).map((option) => (
                          <Radio key={option} value={option}>
                            {option}
                          </Radio>
                        ))}
                      </RadioGroup>
                    </div>
                  )}
                </CardBody>

                <Divider />

                <CardFooter className="flex justify-between">
                  <div>
                    <Chip variant="flat">{poll.postId.locality}</Chip>
                  </div>
                  {!showResults && (
                    <Button
                      color="primary"
                      isDisabled={!userVotes[poll._id]}
                      onClick={() => handleVote(poll._id, userVotes[poll._id])}
                    >
                      Submit Vote
                    </Button>
                  )}
                  {showResults &&
                    !userHasVoted &&
                    status === "authenticated" && (
                      <Button
                        color="primary"
                        variant="flat"
                        onClick={() => router.push(`/posts/${poll.postId._id}`)}
                      >
                        View Details
                      </Button>
                    )}
                </CardFooter>
              </Card>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center p-12 bg-default-50 rounded-lg">
            <p className="text-xl font-semibold mb-2">No polls found</p>
            <p className="text-default-500 text-center mb-6">
              {status === "authenticated"
                ? "We couldn't find any polls matching your search."
                : "Please log in to view polls in your community."}
            </p>
            {status === "authenticated" ? (
              <Button color="primary" onClick={() => setSearchTerm("")}>
                Clear Search
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
