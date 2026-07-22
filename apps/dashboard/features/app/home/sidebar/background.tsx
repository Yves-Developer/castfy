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
        <p className="text-sm">Background</p>
        <Button className="" variant={"ghost"}>
          Reset
        </Button>
      </div>
      <Tabs className="w-full" defaultValue="image">
        <TabsList className="w-full">
          <TabsTrigger
            className="text-[13px] leading-4.5 tracking-tight"
            value="image"
          >
            Image
          </TabsTrigger>
          <TabsTrigger
            className="text-[13px] leading-4.5 tracking-tight"
            value="video"
          >
            Video
          </TabsTrigger>
          <TabsTrigger
            className="text-[13px] leading-4.5 tracking-tight"
            value="color"
          >
            Color
          </TabsTrigger>
          <TabsTrigger
            className="text-[13px] leading-4.5 tracking-tight"
            value="gradient"
          >
            Gradient
          </TabsTrigger>
        </TabsList>
        <TabsContent value="account">
          Make changes to your account here.
        </TabsContent>
        <TabsContent value="password">Change your password here.</TabsContent>
      </Tabs>
    </div>
  );
}
