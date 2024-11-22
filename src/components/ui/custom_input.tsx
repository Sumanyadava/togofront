import * as React from "react"
import { cn } from "@/lib/utils"

interface CustomInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const CustomInput = React.forwardRef<HTMLInputElement, CustomInputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <div className="relative w-[80%] ">
        <input
          type={type}
          className={cn(
            "flex h-10 w-full  focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ",
            "border-b border-transparent transition-all duration-500 ease-linear",
            "focus:border-b p-5 bg-inherit cursor-pointer font-semibold",
            "peer",
            className
          )}
          ref={ref}
          {...props}
          placeholder="hii Every asda asd jdlaksjdalskd"
        />
        <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 peer-focus:w-full"></div>
      </div>
    )
  }
)
CustomInput.displayName = "CustomInput"

export { CustomInput }
