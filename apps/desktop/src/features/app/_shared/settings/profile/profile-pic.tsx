import { cn } from "@castfy/ui/lib/utils";
import { CameraIcon, XIcon } from "lucide-react";
import Image from "@/components/compat/image";
import { useRef, useState } from "react";

export function ProfilePic() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [image, setImage] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    // Optional: prevent non-images
    if (!file.type.startsWith("image/")) {
      return;
    }

    const imageUrl = URL.createObjectURL(file);
    setImage(imageUrl);
  };

  const removeImage = () => {
    if (image) {
      URL.revokeObjectURL(image);
    }

    setImage(null);

    // Allow selecting the same image again
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div className="flex items-center justify-center">
      <input
        accept="image/*"
        className="hidden"
        onChange={handleImageChange}
        ref={inputRef}
        type="file"
      />

      <div className="relative">
        <button
          className={cn(
            "flex size-20 cursor-pointer items-center justify-center overflow-hidden rounded-full",
            !image && "bg-input/70 hover:bg-input"
          )}
          onClick={() => inputRef.current?.click()}
          type="button"
        >
          {image ? (
            <Image
              alt="Profile"
              className="size-full object-cover"
              height={80}
              src={image}
              width={80}
            />
          ) : (
            <CameraIcon className="text-muted-foreground" />
          )}
        </button>

        {image && (
          <button
            aria-label="Remove profile picture"
            className="absolute -top-1 right-0 flex size-5 items-center justify-center rounded-full bg-background text-muted-foreground shadow ring-1 ring-border hover:text-foreground"
            onClick={removeImage}
            type="button"
          >
            <XIcon className="size-3.5" strokeWidth={2.7} />
          </button>
        )}
      </div>
    </div>
  );
}
