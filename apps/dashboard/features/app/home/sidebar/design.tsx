import { Button } from "@castfy/ui/components/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@castfy/ui/components/tabs";
export default function DesignTab() {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between text-muted-foreground">
        <p className="font-medium text-sm">Design</p>
        <Button className="hover:text-destructive" variant={"ghost"}>
          Reset
        </Button>
      </div>
      <Tabs className="w-full" defaultValue="style">
        <TabsList className="w-full">
          <TabsTrigger value="style">Style</TabsTrigger>
          <TabsTrigger value="border">Border</TabsTrigger>
          <TabsTrigger value="shadow">Shadow</TabsTrigger>
        </TabsList>
        <TabsContent value="style">Style are the best</TabsContent>
        <TabsContent value="border">Border are the best</TabsContent>
        <TabsContent value="shadow">Shadow are the best</TabsContent>
      </Tabs>
    </div>
  );
}
