"use client";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@castfy/ui/components/input-group";
import { LinkIcon } from "lucide-react";

export default function DemoUrl() {
  return (
    <InputGroup className="h-7.5">
      <InputGroupInput
        className="font-medium text-xs placeholder:text-xs"
        placeholder="Url"
      />
      <InputGroupAddon>
        <LinkIcon className="size-3" strokeWidth={2.7} />
      </InputGroupAddon>
    </InputGroup>
  );
}
