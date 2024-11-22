
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { EyeCatchingButton_v2 } from "@/components/EyeCatching/VButtons";
import { toast } from "sonner";



export default function Login() {
  

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
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold">Login</h1>
            <p className="text-balance text-muted-foreground">
              Enter your email below to login to your account
            </p>
          </div>
          <div className="grid gap-4">
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
                Remember this device
              </label>
            </div>

            <EyeCatchingButton_v2>Login</EyeCatchingButton_v2>

            <Button variant="outline" onClick={handleGoogleLogin}>
              Login with Google
            </Button>
          </div>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{" "}
            <span
              className="underline cursor-pointer"
              onClick={() => console.log("hii")
              }
            >
              Sign up
            </span>
            <a
              href="/forgot-password"
              className="my-5 inline-block text-sm underline mb-5"
            >
              Forgot your password?
            </a>
          </div>
        </div>
      </div>
      <div className="hidden bg-muted lg:block">
        <img src="/images/owl.jpg" alt="abc" className="h-full w-full bg-white object-contain dark:brightness-[0.2] dark:grayscale" />
        
      </div>
    </div>
  );
}
