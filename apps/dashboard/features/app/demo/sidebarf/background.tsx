import { Button } from "@castfy/ui/components/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@castfy/ui/components/tabs";
export default function BackgroundTab() {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between text-muted-foreground">
        <p className="font-medium text-sm">Background</p>
        <Button className="hover:text-destructive" variant={"ghost"}>
          Reset
        </Button>
      </div>
      <Tabs className="w-full" defaultValue="image">
        <TabsList className="w-full">
          <TabsTrigger value="image">Image</TabsTrigger>
          <TabsTrigger value="video">Video</TabsTrigger>
          <TabsTrigger value="color">Color</TabsTrigger>
          <TabsTrigger value="gradient">Gradient</TabsTrigger>
        </TabsList>
        <TabsContent value="image">
          <p>Upload an image</p>
        </TabsContent>
        <TabsContent value="video">
          <p>Upload a video</p>
        </TabsContent>
        <TabsContent value="color">
          <p>Select a color</p>
        </TabsContent>
        <TabsContent value="gradient">
          <p>Select a gradient</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
