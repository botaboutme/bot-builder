import { cn } from "@reactive-resume/utils";

type Props = {
  title?: React.ReactNode;
  description?: React.ReactNode;
  start?: React.ReactNode;
  central?: React.ReactNode;
  end?: React.ReactNode;
  className?: string;
  onClick?: () => void;
};

export const BaseCentralListItem = ({
  title,
  description,
  start,
  central,
  end,
  className,
  onClick,
}: Props) => (
  <div
    onClick={onClick}
    className={cn(
      "flex cursor-pointer items-center rounded p-4 transition-colors hover:bg-secondary/30",
      className,
    )}
  >
    <div className="flex w-full items-center justify-between">
      <div className="flex items-center space-x-2">
        <div className="flex size-5 items-center justify-center">{start}</div>
        <h4 className="w-[220px] truncate font-medium lg:w-[320px]">{title}</h4>
        <p className="hidden text-xs opacity-75 sm:block">{description}</p>
        {/* <div>
          <p className="hidden text-xs opacity-75 sm:block pl-5">Profile views: 10 </p>
          <p className="hidden text-xs opacity-75 sm:block pl-5">Bot chats : 100</p>
        </div> */}
        {central && <div className="flex items-center space-x-2 pl-5">{central}</div>}
      </div>

      {end && <div className="flex size-5 items-center justify-center">{end}</div>}
    </div>
  </div>
);
