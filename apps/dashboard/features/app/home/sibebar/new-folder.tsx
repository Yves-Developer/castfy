import { Button } from "@castfy/ui/components/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@castfy/ui/components/dialog";
import { Field, FieldGroup } from "@castfy/ui/components/field";
import { Input } from "@castfy/ui/components/input";
import { Label } from "@castfy/ui/components/label";
import { PlusIcon } from "lucide-react";

export function NewFolder() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          className="group relative w-full justify-normal gap-3 text-muted-foreground"
          size="sm"
          variant={"ghost"}
        >
          <PlusIcon className="size-3" strokeWidth={2.7} />
          New Folder...
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-68" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="font-semibold text-xs">
            New Folder
          </DialogTitle>
          <DialogDescription className="sr-only">
            Create new folder
          </DialogDescription>
        </DialogHeader>
        <form
          className="flex flex-col gap-3"
          onSubmit={(e) => e.preventDefault()}
        >
          <FieldGroup>
            <Field>
              <Label className="sr-only" htmlFor="name">
                Name
              </Label>
              <Input
                className="h-7 border-0 text-xs focus-visible:ring-1 dark:bg-input/50"
                id="name"
                name="name"
                placeholder="Name"
              />
            </Field>
          </FieldGroup>
          <p className="text-muted-foreground text-xs">
            Create a new folder to help organize your projects.
          </p>
          <div className="flex items-center gap-2">
            <DialogClose asChild>
              <Button className="flex-1 text-xs" variant="secondary">
                Cancel
              </Button>
            </DialogClose>
            <Button className="flex-1 text-xs" type="submit">
              Done
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
