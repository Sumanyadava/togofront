

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { EyeCatchingButton_v2 } from "@/components/EyeCatching/VButtons";
import { toast } from "sonner";


export default function Signup() {
  

  const handleGoogleLogin = () => {
    toast.success("Event has been created", {
      description: "Sunday, December 03, 2023 at 9:00 AM",
      action: {
        label: "Undo",
        onClick: () => console.log("Undo"),
      },
    });
  };

  return (
    <div className="w-full h-screen lg:grid lg:min-h-[600px] lg:grid-cols-2 xl:min-h-[800px] overflow-hidden">
      <div className="hidden bg-muted lg:block">
        <img src="/images/owl2.jpg" alt="abc" className="h-full w-full object-cover bg-white dark:brightness-[0.2] dark:grayscale"  />
        
      </div>

      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold">Sign in</h1>
            <p className="text-balance text-muted-foreground">
              Register to Start using Togo
            </p>
          </div>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" type="text" placeholder="Your name" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
              </div>
              <Input id="password" type="password" required />
            </div>

            <div className="flex items-center space-x-2 mb-5">
              <Checkbox id="terms" />
              <label
                htmlFor="terms"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Accept <u>terms & conditions</u> and <u>Privacy policy</u>
              </label>
            </div>

            <EyeCatchingButton_v2>Signin</EyeCatchingButton_v2>

            <Button variant="outline" onClick={handleGoogleLogin}>
              Login with Google
            </Button>
          </div>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{" "}
            <span
              className="underline cursor-pointer"
              onClick={() => console.log("hello")
              }
            >
              Sign up
            </span>
            <br />
            <a className="underline  ">
              Forgot your password?
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
