"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@castfy/ui/components/dropdown-menu";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@castfy/ui/components/empty";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@castfy/ui/components/input-group";
import { MessageScrollerProvider } from "@castfy/ui/components/message-scroller";
import {
  ArrowUpIcon,
  GlobeIcon,
  ImageIcon,
  MessageCircleDashedIcon,
  PaperclipIcon,
  PlusIcon,
  TelescopeIcon,
} from "lucide-react";

export default function AiTab() {
  return (
    <MessageScrollerProvider>
      <div className="flex h-full flex-col">
        <div className="flex-1 overflow-hidden p-0">
          <Empty className="h-full">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <MessageCircleDashedIcon />
              </EmptyMedia>
              <EmptyTitle>Morning, lecon!</EmptyTitle>
              <EmptyDescription>
                What are we editing today? Press send to start a new
                conversation
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </div>
        <InputGroup className="mt-auto w-full">
          <InputGroupTextarea
            className="min-h-2 text-sm"
            placeholder="Edit with ai..."
          />
          <InputGroupAddon align="block-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <InputGroupButton
                  aria-label="Add files"
                  className="rounded-full"
                  size="icon-sm"
                  type="button"
                  variant="outline"
                >
                  <PlusIcon />
                </InputGroupButton>
              </DropdownMenuTrigger>

              <DropdownMenuContent>
                <DropdownMenuItem>
                  <PaperclipIcon />
                  Add Photos & Files
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <ImageIcon />
                  Create Image
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <TelescopeIcon />
                  Deep Research
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <GlobeIcon />
                  Web Search
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <InputGroupButton
              className="ml-auto rounded-full"
              disabled
              size="icon-sm"
              type="submit"
              variant="default"
            >
              <ArrowUpIcon />
              <span className="sr-only">Send</span>
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </div>
    </MessageScrollerProvider>
  );
}
