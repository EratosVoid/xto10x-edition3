import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardBody, CardFooter } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Textarea } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";

// Post types
const postTypes = [
  { value: "general", label: "General" },
  { value: "event", label: "Event" },
  { value: "poll", label: "Poll" },
  { value: "petition", label: "Petition" },
  { value: "announcement", label: "Announcement" },
];

// Priority options
const priorities = [
  { value: "low", label: "Low Priority", color: "success" },
  { value: "medium", label: "Medium Priority", color: "warning" },
  { value: "high", label: "High Priority", color: "danger" },
];

export interface PostFormData {
  title: string;
  description: string;
  type: string;
  priority: string;
}

interface PostFormProps {
  initialData?: PostFormData;
  isEditing?: boolean;
  postId?: string;
  onSubmit: (formData: PostFormData) => Promise<void>;
  isSubmitting: boolean;
  error: string;
}

export default function PostForm({
  initialData = {
    title: "",
    description: "",
    type: "general",
    priority: "medium",
  },
  isEditing = false,
  postId,
  onSubmit,
  isSubmitting,
  error,
}: PostFormProps) {
  const router = useRouter();

  // Form state
  const [formData, setFormData] = useState<PostFormData>(initialData);

  // Form validation errors
  const [validationErrors, setValidationErrors] = useState({
    title: "",
    description: "",
    type: "",
  });

  // Update form data when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear validation error when field is edited
    if (validationErrors[name as keyof typeof validationErrors]) {
      setValidationErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {
      title: "",
      description: "",
      type: "",
    };
    let isValid = true;

    if (!formData.title.trim()) {
      errors.title = "Title is required";
      isValid = false;
    } else if (formData.title.length < 5) {
      errors.title = "Title must be at least 5 characters";
      isValid = false;
    }

    if (!formData.description.trim()) {
      errors.description = "Description is required";
      isValid = false;
    } else if (formData.description.length < 10) {
      errors.description = "Description must be at least 10 characters";
      isValid = false;
    }

    if (!isEditing && !formData.type) {
      errors.type = "Please select a type";
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    await onSubmit(formData);
  };

  const handleCancel = () => {
    if (isEditing && postId) {
      router.push(`/posts/${postId}`);
    } else {
      router.push("/posts");
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-col">
        <h1 className="text-3xl font-bold mb-2">
          {isEditing ? "Edit Post" : "Create Post"}
        </h1>

        {error && (
          <div className="bg-danger-50 p-4 rounded-lg my-4 text-danger">
            {error}
          </div>
        )}
      </CardHeader>

      <CardBody>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-1">
              Post Title <span className="text-danger">*</span>
            </label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter a title for your post"
              isInvalid={!!validationErrors.title}
              errorMessage={validationErrors.title}
              fullWidth
              size="lg"
            />
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium mb-1"
            >
              Description <span className="text-danger">*</span>
            </label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter your post description"
              isInvalid={!!validationErrors.description}
              errorMessage={validationErrors.description}
              minRows={5}
              fullWidth
              size="lg"
            />
          </div>

          {!isEditing && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Type */}
              <div>
                <label
                  htmlFor="type"
                  className="block text-sm font-medium mb-1"
                >
                  Post Type <span className="text-danger">*</span>
                </label>
                <Select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  placeholder="Select post type"
                  isInvalid={!!validationErrors.type}
                  errorMessage={validationErrors.type}
                  fullWidth
                  size="lg"
                >
                  {postTypes.map((type) => (
                    <SelectItem key={type.value} textValue={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </Select>
              </div>

              {/* Priority */}
              <div>
                <label
                  htmlFor="priority"
                  className="block text-sm font-medium mb-1"
                >
                  Priority
                </label>
                <Select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  fullWidth
                  size="lg"
                >
                  {priorities.map((priority) => (
                    <SelectItem key={priority.value} textValue={priority.value}>
                      {priority.label}
                    </SelectItem>
                  ))}
                </Select>
              </div>
            </div>
          )}
        </form>
      </CardBody>

      <CardFooter className="flex justify-between">
        <Button variant="flat" onClick={handleCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          color="primary"
          onClick={handleSubmit}
          isLoading={isSubmitting}
          disabled={isSubmitting}
        >
          {isEditing ? "Update Post" : "Create Post"}
        </Button>
      </CardFooter>
    </Card>
  );
}
