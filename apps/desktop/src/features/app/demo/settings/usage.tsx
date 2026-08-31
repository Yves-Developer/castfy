import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@castfy/ui/components/select";

const items = [
  { label: "August 2026", value: "light" },
  { label: "July 2026", value: "dark" },
  { label: "May 2026", value: "system" },
];
export function DemoUsage() {
  return (
    <div className="flex items-center justify-between gap-10">
      <p className="max-w-60 font-medium text-muted-foreground text-xs">
        Usage is calculated on a monthly basis, and you&apos;ll be notified when
        you go over your limit.
      </p>

      <Select>
        <SelectTrigger className="w-45 font-medium text-xs">
          <SelectValue className="" placeholder="Date" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {items.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
