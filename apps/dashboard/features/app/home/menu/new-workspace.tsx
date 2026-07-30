import { Button } from "@castfy/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@castfy/ui/components/dialog";
import { Field, FieldGroup } from "@castfy/ui/components/field";
import { Input } from "@castfy/ui/components/input";
import { Label } from "@castfy/ui/components/label";

export function NewWorkspace({
  isOpen,
  onOpenChange,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog onOpenChange={onOpenChange} open={isOpen}>
      <form>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Create Workspace</DialogTitle>
            <DialogDescription className="sr-only">
              Create a new workspace for your projects.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <Label className="sr-only" htmlFor="name-1">
                Name
              </Label>
              <Input id="name-1" name="name" placeholder="Workspace" />
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button className="w-full" disabled type="submit">
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
