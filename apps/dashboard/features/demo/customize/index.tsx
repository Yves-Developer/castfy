import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@castfy/ui/components/tabs";
import { Background } from "./background";
import { Cursor } from "./cursor";
import { Design } from "./design";
import { Settings } from "./settings";

export function CustomizeTabs() {
  return (
    <Tabs className="flex h-full flex-col" defaultValue="background">
      <TabsList className="w-full shrink-0 rounded-none" variant={"line"}>
        <TabsTrigger value="background">Background</TabsTrigger>
        <TabsTrigger value="design">Design</TabsTrigger>
        <TabsTrigger value="cursor">Cursor</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>

      <TabsContent className="mt-0 min-h-0 flex-1" value="background">
        <Background />
      </TabsContent>

      <TabsContent className="mt-0 min-h-0 flex-1" value="design">
        <Design />
      </TabsContent>

      <TabsContent className="mt-0 min-h-0 flex-1" value="cursor">
        <Cursor />
      </TabsContent>

      <TabsContent className="mt-0 min-h-0 flex-1" value="settings">
        <Settings />
      </TabsContent>
    </Tabs>
  );
}
