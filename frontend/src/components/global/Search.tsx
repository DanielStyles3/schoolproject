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
      <SearchIcon className="absolute left-3 top-3 size-4 text-[#00843D]" />
      <Input
        placeholder={`Search ${title}`}
        className="h-11 w-full rounded-full border-[#E8F5EE] bg-white pl-10 text-[#111111] shadow-[0_12px_24px_rgba(0,132,61,0.07)] focus-visible:border-[#00843D] focus-visible:ring-[#00843D]/20"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
    </div>
  );
};

export default Search;