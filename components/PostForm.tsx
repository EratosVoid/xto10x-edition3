import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardBody, CardFooter } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Textarea } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";

// Post types
const postTypes = [
  { value: "general", label: "General", icon: "📝" },
  { value: "event", label: "Event", icon: "🗓️" },
  { value: "poll", label: "Poll", icon: "📊" },
  { value: "petition", label: "Petition", icon: "✍️" },
  { value: "announcement", label: "Announcement", icon: "📢" },
];

// Priority options
const priorities = [
  { value: "low", label: "Low Priority", color: "success" },
  { value: "medium", label: "Medium Priority", color: "warning" },
  { value: "high", label: "High Priority", color: "danger" },
];

// Department options for petitions
const departments = [
  { value: "cityDevelopment", label: "City Development Department" },
  { value: "publicWorks", label: "Public Works Department" },
  { value: "parks", label: "Parks and Recreation Department" },
  { value: "transportation", label: "Transportation Department" },
  { value: "police", label: "Police Department" },
  { value: "health", label: "Health Department" },
  { value: "education", label: "Education Department" },
  { value: "housing", label: "Housing Department" },
  { value: "environment", label: "Environmental Protection Department" },
  { value: "other", label: "Other (Please specify in description)" },
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

// Get type from URL if present
function getInitialTypeFromUrl() {
  if (typeof window === "undefined") return null;

  const urlParams = new URLSearchParams(window.location.search);
  const typeFromUrl = urlParams.get("type");

  if (typeFromUrl && postTypes.some((pt) => pt.value === typeFromUrl)) {
    return typeFromUrl;
  }

  return null;
}

// Helper function to get icon for post type
const getTypeIcon = (type: string): string => {
  const postType = postTypes.find((pt) => pt.value === type);
  return postType?.icon || "📝";
};

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

  // Get the type from URL before initializing state
  const typeFromUrl = getInitialTypeFromUrl();

  // Initialize form state with URL type if present
  const [formData, setFormData] = useState<PostFormData>({
    ...initialData,
    type: typeFromUrl || initialData.type,
  });

  const [selectedType, setSelectedType] = useState<string>(
    typeFromUrl || initialData.type || "general"
  );

  // Debug logs
  useEffect(() => {
    console.log("Current form type:", formData.type);
    console.log("Current selected type:", selectedType);
  }, [formData.type, selectedType]);

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
    if (initialData && !typeFromUrl) {
      setFormData(initialData);
      setSelectedType(initialData.type || "general");
    } else {
      if (typeFromUrl) {
        setSelectedType(typeFromUrl);
        setFormData((prev) => ({ ...prev, type: typeFromUrl }));
      }
    }
  }, [initialData, typeFromUrl]);

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));

    // Update selectedType if the type field changes
    if (name === "type") {
      setSelectedType(value);
    }

    // Clear validation error when field is edited
    if (validationErrors[name as keyof typeof validationErrors]) {
      setValidationErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Handle type selection
  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    console.log("Type changed to:", value);
    setSelectedType(value);
    setFormData((prev) => ({ ...prev, type: value }));

    // Clear validation error when field is edited
    if (validationErrors.type) {
      setValidationErrors((prev) => ({ ...prev, type: "" }));
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
        errors.target = "Please select a department";
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

    console.log("Form data at submission:", formData);

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
          {getTypeIcon(formData.type)}{" "}
          {isEditing
            ? `Edit ${formData.type.charAt(0).toUpperCase() + formData.type.slice(1)}`
            : `Create ${formData.type.charAt(0).toUpperCase() + formData.type.slice(1)}`}
        </h1>

        {error && (
          <div className="bg-danger-50 p-4 rounded-lg my-4 text-danger">
            {error}
          </div>
        )}
      </CardHeader>

      <CardBody>
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="title">
              Post Title <span className="text-danger">*</span>
            </label>
            <Input
              fullWidth
              errorMessage={validationErrors.title}
              id="title"
              isInvalid={!!validationErrors.title}
              name="title"
              placeholder="Enter a title for your post"
              size="lg"
              value={formData.title}
              onChange={handleChange}
            />
          </div>

          {/* Description */}
          <div>
            <label
              className="block text-sm font-medium mb-1"
              htmlFor="description"
            >
              Description <span className="text-danger">*</span>
            </label>
            <Textarea
              fullWidth
              errorMessage={validationErrors.description}
              id="description"
              isInvalid={!!validationErrors.description}
              minRows={5}
              name="description"
              placeholder="Enter your post description"
              size="lg"
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          {!isEditing && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Type */}
              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  htmlFor="type"
                >
                  Post Type <span className="text-danger">*</span>
                </label>
                <Select
                  fullWidth
                  selectedKeys={[selectedType]}
                  errorMessage={validationErrors.type}
                  id="type"
                  isInvalid={!!validationErrors.type}
                  name="type"
                  placeholder="Select post type"
                  size="lg"
                  onChange={handleTypeChange}
                >
                  {postTypes.map((type) => (
                    <SelectItem key={type.value} textValue={type.value}>
                      {type.icon} {type.label}
                    </SelectItem>
                  ))}
                </Select>
              </div>

              {/* Priority */}
              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  htmlFor="priority"
                >
                  Priority
                </label>
                <Select
                  fullWidth
                  defaultSelectedKeys={[formData.priority]}
                  id="priority"
                  name="priority"
                  size="lg"
                  onChange={handleChange}
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
                    className="block text-sm font-medium mb-1"
                    htmlFor="startDate"
                  >
                    Start Date <span className="text-danger">*</span>
                  </label>
                  <Input
                    fullWidth
                    errorMessage={validationErrors.startDate}
                    id="startDate"
                    isInvalid={!!validationErrors.startDate}
                    name="startDate"
                    type="datetime-local"
                    value={formData.startDate || ""}
                    onChange={handleChange}
                  />
                </div>

                {/* End Date */}
                <div>
                  <label
                    className="block text-sm font-medium mb-1"
                    htmlFor="endDate"
                  >
                    End Date <span className="text-danger">*</span>
                  </label>
                  <Input
                    fullWidth
                    errorMessage={validationErrors.endDate}
                    id="endDate"
                    isInvalid={!!validationErrors.endDate}
                    min={formData.startDate}
                    name="endDate"
                    type="datetime-local"
                    value={formData.endDate || ""}
                    onChange={handleChange}
                  />
                </div>

                {/* Location */}
                <div>
                  <label
                    className="block text-sm font-medium mb-1 col-span-full"
                    htmlFor="location"
                  >
                    Location <span className="text-danger">*</span>
                  </label>
                  <Input
                    fullWidth
                    errorMessage={validationErrors.location}
                    id="location"
                    isInvalid={!!validationErrors.location}
                    name="location"
                    placeholder="Enter event location"
                    value={formData.location || ""}
                    onChange={handleChange}
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
                    fullWidth
                    className="mr-2"
                    placeholder={`Option ${index + 1}`}
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                  />
                  {index > 1 && (
                    <Button
                      color="danger"
                      size="sm"
                      type="button"
                      variant="flat"
                      onClick={() => removePollOption(index)}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              ))}
              <Button
                className="mt-2"
                color="primary"
                type="button"
                variant="flat"
                onClick={addPollOption}
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
                {/* Target Department */}
                <div>
                  <label
                    className="block text-sm font-medium mb-1"
                    htmlFor="target"
                  >
                    Which department should address this issue?{" "}
                    <span className="text-danger">*</span>
                  </label>
                  <Select
                    fullWidth
                    errorMessage={validationErrors.target}
                    id="target"
                    isInvalid={!!validationErrors.target}
                    name="target"
                    placeholder="Select department"
                    size="lg"
                    selectedKeys={formData.target ? [formData.target] : []}
                    onChange={handleChange}
                  >
                    {departments.map((dept) => (
                      <SelectItem key={dept.value} textValue={dept.value}>
                        {dept.label}
                      </SelectItem>
                    ))}
                  </Select>
                </div>

                {/* Goal */}
                <div>
                  <label
                    className="block text-sm font-medium mb-1"
                    htmlFor="goal"
                  >
                    Signature Goal <span className="text-danger">*</span>
                  </label>
                  <Input
                    fullWidth
                    errorMessage={validationErrors.goal}
                    id="goal"
                    isInvalid={!!validationErrors.goal}
                    name="goal"
                    placeholder="Number of signatures needed"
                    type="number"
                    value={formData.goal?.toString() || ""}
                    onChange={handleChange}
                  />
                  <p className="text-xs mt-1 text-default-500">
                    Note: The more signatures your petition receives, the more
                    visibility it will gain with the targeted department.
                  </p>
                </div>
              </div>
            </div>
          )}
        </form>
      </CardBody>

      <CardFooter className="flex justify-between">
        <Button disabled={isSubmitting} variant="flat" onClick={handleCancel}>
          Cancel
        </Button>
        <Button
          color="primary"
          disabled={isSubmitting}
          isLoading={isSubmitting}
          onClick={handleSubmit}
        >
          {isEditing
            ? `Update ${formData.type.charAt(0).toUpperCase() + formData.type.slice(1)}`
            : `Create ${formData.type.charAt(0).toUpperCase() + formData.type.slice(1)}`}
        </Button>
      </CardFooter>
    </Card>
  );
}
