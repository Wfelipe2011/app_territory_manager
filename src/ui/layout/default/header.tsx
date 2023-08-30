import clsx from "clsx";

export interface HeaderProps {
  children: React.ReactNode;
  size?: keyof typeof sizes;
}

const sizes = {
  default: "h-48",
  small: "h-24",
};

export function Header({ children, size }: HeaderProps) {
  return (
    <>
      <div
        className={clsx(
          "bg-secondary flex w-full rounded-bl-[30%] relative items-center shadow-md drop-shadow-md p-6 z-10 space-x-2",
          size ? sizes[size] : sizes.default
        )}
      >
        {children}
      </div>
    </>
  );
}
