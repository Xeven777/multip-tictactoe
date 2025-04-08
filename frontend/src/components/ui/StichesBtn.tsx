import { cn } from "@/lib/utils";

const StitchesButton = ({
  text = "Click Me",
  onClick = () => {},
  className = "",
  ...props
}: {
  text?: string;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}) => {
  return (
    <button
      onClick={onClick}
      type="button"
      {...props}
      className={cn(
        "group relative rounded-lg border-2 border-primary bg-primary px-5 py-2 font-medium text-white duration-700 hover:shadow-lg hover:shadow-primary/50 disabled:opacity-60 disabled:pointer-events-none hover:brightness-110 cursor-pointer",
        "active:translate-y-[2px] active:shadow-none active:shadow-primary/50",
        className
      )}
    >
      <span className="absolute left-0 top-0 size-full rounded-md border border-dashed border-violet-50 shadow-inner shadow-white/30 group-active:shadow-white/10"></span>
      <span className="absolute left-0 top-0 size-full rotate-180 rounded-md border-violet-50 shadow-inner shadow-black/30 group-active:shadow-black/10"></span>
      {text}
    </button>
  );
};

export default StitchesButton;
