"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardBody, CardFooter } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Chip } from "@heroui/chip";
import { Progress } from "@heroui/progress";
import { Radio, RadioGroup } from "@heroui/radio";
import { Divider } from "@heroui/divider";
import { useSession } from "next-auth/react";

// Simulated poll data
const dummyPolls = [
  {
    id: "1",
    title: "Park Improvements",
    description: "What improvement would you like to see in Central Park?",
    options: [
      { id: "1a", text: "New playground equipment", votes: 45 },
      { id: "1b", text: "More benches and picnic tables", votes: 30 },
      { id: "1c", text: "Better lighting", votes: 25 },
      { id: "1d", text: "Water fountain", votes: 15 },
    ],
    totalVotes: 115,
    createdBy: "Parks Department",
    expiration: "2026-07-15",
    locality: "Downtown",
    category: "parks",
  },
  {
    id: "2",
    title: "Community Center Programs",
    description:
      "Which new program would you like to see at the community center?",
    options: [
      { id: "2a", text: "Cooking classes", votes: 38 },
      { id: "2b", text: "Computer skills workshop", votes: 42 },
      { id: "2c", text: "Fitness classes", votes: 67 },
      { id: "2d", text: "Arts and crafts", votes: 29 },
    ],
    totalVotes: 176,
    createdBy: "Community Center Board",
    expiration: "2023-07-10",
    locality: "Downtown",
    category: "education",
  },
  {
    id: "3",
    title: "Traffic Calming Measures",
    description:
      "Which traffic calming measure do you support for Main Street?",
    options: [
      { id: "3a", text: "Speed bumps", votes: 56 },
      { id: "3b", text: "Reduced speed limit", votes: 32 },
      { id: "3c", text: "Traffic circles", votes: 48 },
      { id: "3d", text: "More stop signs", votes: 27 },
    ],
    totalVotes: 163,
    createdBy: "Traffic Safety Commission",
    expiration: "2023-07-20",
    locality: "Eastside",
    category: "traffic",
  },
  {
    id: "4",
    title: "Farmers Market Timing",
    description:
      "What day and time would you prefer for the weekly farmers market?",
    options: [
      { id: "4a", text: "Saturday morning", votes: 89 },
      { id: "4b", text: "Saturday afternoon", votes: 45 },
      { id: "4c", text: "Sunday morning", votes: 67 },
      { id: "4d", text: "Wednesday evening", votes: 34 },
    ],
    totalVotes: 235,
    createdBy: "Farmers Market Association",
    expiration: "2023-07-05",
    locality: "Downtown",
    category: "events",
  },
];

export default function PollsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [searchTerm, setSearchTerm] = useState("");
  const [userVotes, setUserVotes] = useState<Record<string, string>>({});
  const [votedPolls, setVotedPolls] = useState<Record<string, boolean>>({});

  // Filter polls based on search
  const filteredPolls = dummyPolls.filter((poll) => {
    return (
      poll.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      poll.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Calculate percentage for visualization
  const calculatePercentage = (votes: number, totalVotes: number) => {
    return totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
  };

  // Handle vote submission
  const handleVote = (pollId: string) => {
    if (!userVotes[pollId]) return;

    // In a real app, we would call an API to save the vote
    console.log(
      `Voted for poll ${pollId}, option ${userVotes[pollId]}`,
      session,
    );

    // Mark poll as voted
    setVotedPolls({
      ...votedPolls,
      [pollId]: true,
    });
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

  // Check if poll is expired
  const isPollExpired = (expirationDate: string) => {
    const expiration = new Date(expirationDate);
    const now = new Date();

    return expiration < now;
  };

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
          onClick={() => router.push("/polls/create")}
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
            const isExpired = isPollExpired(poll.expiration);
            const hasVoted = votedPolls[poll.id];
            const showResults =
              hasVoted || isExpired || status !== "authenticated";

            return (
              <Card key={poll.id} className="w-full">
                <CardHeader className="flex flex-col">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold">{poll.title}</h3>
                      <p className="text-small text-default-500">
                        By {poll.createdBy} • Expires{" "}
                        {formatDate(poll.expiration)}
                      </p>
                    </div>
                    {isExpired && (
                      <Chip color="danger" variant="flat">
                        Expired
                      </Chip>
                    )}
                    {!isExpired && hasVoted && (
                      <Chip color="success" variant="flat">
                        Voted
                      </Chip>
                    )}
                  </div>
                  <p className="mt-2">{poll.description}</p>
                </CardHeader>

                <CardBody>
                  {showResults ? (
                    <div className="space-y-4">
                      {poll.options.map((option) => {
                        const percentage = calculatePercentage(
                          option.votes,
                          poll.totalVotes,
                        );

                        return (
                          <div key={option.id} className="space-y-1">
                            <div className="flex justify-between items-center">
                              <p>{option.text}</p>
                              <p className="text-small font-medium">
                                {percentage}% ({option.votes} votes)
                              </p>
                            </div>
                            <Progress
                              aria-label={`${option.text} - ${percentage}%`}
                              className="h-3"
                              color={
                                userVotes[poll.id] === option.id
                                  ? "primary"
                                  : "default"
                              }
                              value={percentage}
                            />
                          </div>
                        );
                      })}
                      <p className="text-small text-center mt-4 text-default-500">
                        Total votes: {poll.totalVotes}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <RadioGroup
                        value={userVotes[poll.id] || ""}
                        onValueChange={(value) =>
                          setUserVotes({ ...userVotes, [poll.id]: value })
                        }
                      >
                        {poll.options.map((option) => (
                          <Radio key={option.id} value={option.id}>
                            {option.text}
                          </Radio>
                        ))}
                      </RadioGroup>
                    </div>
                  )}
                </CardBody>

                <Divider />

                <CardFooter className="flex justify-between">
                  <div>
                    <Chip variant="flat">{poll.locality}</Chip>
                    <Chip className="ml-2" variant="flat">
                      {poll.category}
                    </Chip>
                  </div>
                  {!showResults && (
                    <Button
                      color="primary"
                      isDisabled={!userVotes[poll.id]}
                      onClick={() => handleVote(poll.id)}
                    >
                      Submit Vote
                    </Button>
                  )}
                  {showResults &&
                    !hasVoted &&
                    status === "authenticated" &&
                    !isExpired && (
                      <Button
                        color="primary"
                        variant="flat"
                        onClick={() =>
                          setVotedPolls({ ...votedPolls, [poll.id]: false })
                        }
                      >
                        Vote Now
                      </Button>
                    )}
                  {(hasVoted || isExpired || status !== "authenticated") && (
                    <Button
                      variant="flat"
                      onClick={() => router.push(`/polls/${poll.id}`)}
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
              We couldn&apos;t find any polls matching your search.
            </p>
            <Button color="primary" onClick={() => setSearchTerm("")}>
              Clear Search
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
