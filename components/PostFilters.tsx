import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Select, SelectItem } from "@heroui/select";
import { useState } from "react";

interface PostFiltersProps {
  searchTerm: string;
  selectedType: string;
  onSearchChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClear: () => void;
}

const postTypes = [
  { value: "all", label: "All Types" },
  { value: "general", label: "General" },
  { value: "event", label: "Event" },
  { value: "poll", label: "Poll" },
  { value: "petition", label: "Petition" },
  { value: "announcement", label: "Announcement" },
];

export default function PostFilters({
  searchTerm: defaultSearchTerm,
  selectedType,
  onSearchChange,
  onTypeChange,
  onSubmit,
  onClear,
}: PostFiltersProps) {
  const [searchTerm, setSearchTerm] = useState(defaultSearchTerm);

  return (
    <div className="bg-default-50 p-4 rounded-lg">
      <form className="flex flex-col sm:flex-row gap-4" onSubmit={onSubmit}>
        <Input
          className="flex-grow"
          placeholder="Search posts..."
          size="lg"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Select
          className="sm:w-40"
          placeholder="Filter by type"
          size="lg"
          value={selectedType}
          onChange={(e) => onTypeChange(e.target.value)}
        >
          {postTypes.map((type) => (
            <SelectItem key={type.value} textValue={type.value}>
              {type.label}
            </SelectItem>
          ))}
        </Select>
        <div className="flex gap-2">
          <Button
            color="primary"
            size="lg"
            type="submit"
            onPress={() => onSearchChange(searchTerm)}
          >
            Search
          </Button>
          {(selectedType !== "all" || searchTerm) && (
            <Button size="lg" variant="flat" onPress={onClear}>
              Clear
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
