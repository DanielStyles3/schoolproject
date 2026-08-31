import { Input } from "@/components/ui/input";
import { SearchIcon } from "lucide-react";

const Search = ({
  search,
  setSearch,
  title,
}: {
  search: string;
  setSearch: (search: string) => void;
  title: string;
}) => {
  return (
    <div className="relative w-full sm:min-w-[16rem] md:w-72">
      <SearchIcon className="absolute left-3 top-3 size-4 text-primary" />
      <Input
        placeholder={`Search ${title}`}
        className="h-11 w-full rounded-full border-border bg-card pl-10 text-foreground shadow-sm focus-visible:border-primary focus-visible:ring-primary/20"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
    </div>
  );
};

export default Search;