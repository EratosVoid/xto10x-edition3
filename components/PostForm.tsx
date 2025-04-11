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
  // Event fields
  startDate?: string;
  endDate?: string;
  duration?: number;
  location?: string;
  // Poll fields
  options?: string[];
  // Petition fields
  target?: string;
  goal?: number;
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
    options: [""],
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
    startDate: "",
    endDate: "",
    duration: "",
    location: "",
    options: "",
    target: "",
    goal: "",
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

  // Handle poll options changes
  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...(formData.options || [""])];
    newOptions[index] = value;
    setFormData((prev) => ({ ...prev, options: newOptions }));

    // Clear validation error when field is edited
    if (validationErrors.options) {
      setValidationErrors((prev) => ({ ...prev, options: "" }));
    }
  };

  // Add poll option
  const addPollOption = () => {
    setFormData((prev) => ({
      ...prev,
      options: [...(prev.options || [""]), ""],
    }));
  };

  // Remove poll option
  const removePollOption = (index: number) => {
    const newOptions = [...(formData.options || [""])];
    newOptions.splice(index, 1);
    setFormData((prev) => ({ ...prev, options: newOptions }));
  };

  // Validate form
  const validateForm = () => {
    const errors = {
      title: "",
      description: "",
      type: "",
      startDate: "",
      endDate: "",
      duration: "",
      location: "",
      options: "",
      target: "",
      goal: "",
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

    // Validate Event fields
    if (formData.type === "event") {
      if (!formData.startDate) {
        errors.startDate = "Start date is required";
        isValid = false;
      }
      if (!formData.endDate) {
        errors.endDate = "End date is required";
        isValid = false;
      }
      if (!formData.duration) {
        errors.duration = "Duration is required";
        isValid = false;
      }
      if (!formData.location?.trim()) {
        errors.location = "Location is required";
        isValid = false;
      }
    }

    // Validate Poll fields
    if (formData.type === "poll") {
      if (!formData.options || formData.options.length < 2) {
        errors.options = "At least 2 options are required";
        isValid = false;
      } else if (formData.options.some((option) => !option.trim())) {
        errors.options = "All options must have content";
        isValid = false;
      }
    }

    // Validate Petition fields
    if (formData.type === "petition") {
      if (!formData.target?.trim()) {
        errors.target = "Target is required";
        isValid = false;
      }
      if (!formData.goal || formData.goal <= 0) {
        errors.goal = "Goal must be a positive number";
        isValid = false;
      }
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

          {/* Event Fields */}
          {formData.type === "event" && (
            <div className="border p-4 rounded-lg ">
              <h3 className="text-lg font-semibold mb-4">Event Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Start Date */}
                <div>
                  <label
                    htmlFor="startDate"
                    className="block text-sm font-medium mb-1"
                  >
                    Start Date <span className="text-danger">*</span>
                  </label>
                  <Input
                    id="startDate"
                    name="startDate"
                    type="datetime-local"
                    value={formData.startDate || ""}
                    onChange={handleChange}
                    isInvalid={!!validationErrors.startDate}
                    errorMessage={validationErrors.startDate}
                    fullWidth
                  />
                </div>

                {/* End Date */}
                <div>
                  <label
                    htmlFor="endDate"
                    className="block text-sm font-medium mb-1"
                  >
                    End Date <span className="text-danger">*</span>
                  </label>
                  <Input
                    id="endDate"
                    name="endDate"
                    type="datetime-local"
                    value={formData.endDate || ""}
                    onChange={handleChange}
                    isInvalid={!!validationErrors.endDate}
                    errorMessage={validationErrors.endDate}
                    fullWidth
                    min={formData.startDate}
                  />
                </div>

                {/* Location */}
                <div>
                  <label
                    htmlFor="location"
                    className="block text-sm font-medium mb-1 col-span-full"
                  >
                    Location <span className="text-danger">*</span>
                  </label>
                  <Input
                    id="location"
                    name="location"
                    value={formData.location || ""}
                    onChange={handleChange}
                    placeholder="Enter event location"
                    isInvalid={!!validationErrors.location}
                    errorMessage={validationErrors.location}
                    fullWidth
                  />
                </div>
              </div>
            </div>
          )}

          {/* Poll Fields */}
          {formData.type === "poll" && (
            <div className="border p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Poll Options</h3>
              {formData.options?.map((option, index) => (
                <div key={index} className="flex items-center mb-3">
                  <Input
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    className="mr-2"
                    fullWidth
                  />
                  {index > 1 && (
                    <Button
                      type="button"
                      color="danger"
                      variant="flat"
                      size="sm"
                      onClick={() => removePollOption(index)}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                color="primary"
                variant="flat"
                onClick={addPollOption}
                className="mt-2"
              >
                Add Option
              </Button>
              {validationErrors.options && (
                <p className="text-danger text-xs mt-1">
                  {validationErrors.options}
                </p>
              )}
            </div>
          )}

          {/* Petition Fields */}
          {formData.type === "petition" && (
            <div className="border p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Petition Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Target */}
                <div>
                  <label
                    htmlFor="target"
                    className="block text-sm font-medium mb-1"
                  >
                    Target <span className="text-danger">*</span>
                  </label>
                  <Input
                    id="target"
                    name="target"
                    value={formData.target || ""}
                    onChange={handleChange}
                    placeholder="Who is this petition targeting?"
                    isInvalid={!!validationErrors.target}
                    errorMessage={validationErrors.target}
                    fullWidth
                  />
                </div>

                {/* Goal */}
                <div>
                  <label
                    htmlFor="goal"
                    className="block text-sm font-medium mb-1"
                  >
                    Signature Goal <span className="text-danger">*</span>
                  </label>
                  <Input
                    id="goal"
                    name="goal"
                    type="number"
                    value={formData.goal?.toString() || ""}
                    onChange={handleChange}
                    placeholder="Number of signatures needed"
                    isInvalid={!!validationErrors.goal}
                    errorMessage={validationErrors.goal}
                    fullWidth
                  />
                </div>
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
