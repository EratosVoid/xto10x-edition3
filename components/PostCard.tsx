import { Card, CardHeader, CardBody, CardFooter } from "@heroui/card";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Avatar } from "@heroui/avatar";
import { useRouter } from "next/navigation";

// Priority colors
const priorityColors: Record<string, "success" | "warning" | "danger"> = {
  low: "success",
  medium: "warning",
  high: "danger",
};

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

interface PostCardProps {
  post: {
    _id: string;
    title: string;
    description: string;
    type: string;
    priority: string;
    createdAt: string;
    createdBy: {
      name: string;
      image?: string;
    };
  };
  showEdit?: boolean;
  showAuthor?: boolean;
}

export default function PostCard({
  post,
  showEdit = false,
  showAuthor = true,
}: PostCardProps) {
  const router = useRouter();

  const handleEditPost = (postId: string) => {
    router.push(`/posts/${postId}/edit`);
  };

  return (
    <Card className="w-full hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="flex flex-col">
        <div className="flex justify-between items-start">
          <div className="flex gap-3">
            <Avatar
              className="border-2 border-primary"
              name={post.createdBy?.name || "User"}
              size="sm"
              src={post.createdBy?.image || "https://i.pravatar.cc/150?img=1"}
            />
            <div>
              <h3 className="text-xl font-bold text-foreground">
                {post.title}
              </h3>
              <p className="text-small text-default-500">
                {showAuthor
                  ? `By ${post.createdBy?.name} • ${formatDate(post.createdAt)}`
                  : formatDate(post.createdAt)}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Chip
              className="capitalize"
              color="primary"
              size="sm"
              variant="flat"
            >
              {post.type}
            </Chip>
            <Chip
              className="capitalize"
              color={
                priorityColors[post.priority as keyof typeof priorityColors]
              }
              size="sm"
              variant="flat"
            >
              {post.priority}
            </Chip>
          </div>
        </div>
      </CardHeader>

      <CardBody>
        <p className="text-default-600 line-clamp-3">{post.description}</p>
      </CardBody>

      <CardFooter className="flex gap-2">
        <Button
          className="flex-1"
          color="primary"
          variant="flat"
          onPress={() => router.push(`/posts/${post._id}`)}
        >
          View Details
        </Button>
        {showEdit && (
          <Button
            className="flex-1"
            color="secondary"
            variant="flat"
            onPress={() => handleEditPost(post._id)}
          >
            Edit
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
