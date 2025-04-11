import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Select, SelectItem } from "@heroui/select";

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
  searchTerm,
  selectedType,
  onSearchChange,
  onTypeChange,
  onSubmit,
  onClear,
}: PostFiltersProps) {
  return (
    <div className="bg-default-50 p-4 rounded-lg">
      <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Search posts..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="flex-grow"
          size="lg"
        />
        <Select
          placeholder="Filter by type"
          value={selectedType}
          onChange={(e) => onTypeChange(e.target.value)}
          className="sm:w-40"
          size="lg"
        >
          {postTypes.map((type) => (
            <SelectItem key={type.value} textValue={type.value}>
              {type.label}
            </SelectItem>
          ))}
        </Select>
        <div className="flex gap-2">
          <Button type="submit" color="primary" size="lg">
            Search
          </Button>
          {(selectedType !== "all" || searchTerm) && (
            <Button variant="flat" onPress={onClear} size="lg">
              Clear
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
