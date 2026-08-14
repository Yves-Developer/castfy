/** biome-ignore-all lint/correctness/noChildrenProp: <explanation> */
import { Button } from "@castfy/ui/components/button";
import { UserEmail } from "./email";
import { UserNames } from "./names";
import { ProfilePic } from "./profile-pic";

export function AccountProfile() {
  return (
    <div className="flex h-full flex-col gap-7.5">
      <ProfilePic />
      <div className="flex flex-1 flex-col gap-5">
        <UserNames />
        <UserEmail />
        <div className="mt-auto flex items-center gap-2">
          <Button className="flex-1" size="md" variant="secondary">
            Sign Out
          </Button>
          <Button className="flex-1" size="md" variant="secondary">
            Delete Account
          </Button>
        </div>
      </div>
    </div>
  );
}
