import Image from "next/image";

export default function HomeThumbnail() {
  return (
    <div>
      <div className="relative border-y">
        <Image
          alt="Hero"
          className="h-auto w-full max-w-7xl rounded-xl lg:rounded-[2.5rem]"
          height={800}
          priority
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
          src="/hero.svg"
          width={1200}
        />
        <div className="absolute bottom-0 left-0 h-12 w-full from-transparent to-background max-md:hidden lg:h-24 dark:bg-gradient-to-b" />
      </div>
    </div>
  );
}
