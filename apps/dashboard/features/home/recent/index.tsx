import { DataTable } from "@/components/table";
import { recentDemosColumns } from "./columns";
import { recentDemos } from "./data";

export default function RecentDemos() {
  return (
    <div className="min-h-[50vh]">
      <DataTable columns={recentDemosColumns} data={recentDemos}>
        <h3 className="font-medium text-lg">Recent demos</h3>
      </DataTable>
    </div>
  );
}
