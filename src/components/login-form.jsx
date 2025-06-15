import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { loginAdmin } from "@/helpers/auth/loginAdmin";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { setItem } from "@/utils/local_storage";
import { setCredentials } from "@/redux/admin/adminSlice";
import { useDispatch } from "react-redux";

export function LoginForm({ className, ...props }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ phoneNumber: "", otp: "" });
  const [loading, setLoading] = useState(false);
  const otpRef = useRef(null);

  const handleChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");

    if (value.length === 10) {
      setFormData({ ...formData, [e.target.id]: value });
      otpRef.current?.focus();
      return;
    }
    setFormData({ ...formData, [e.target.id]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.phoneNumber || !formData.otp) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const response = await loginAdmin(formData);

      if (response?.response?.success) {
        const data = response?.response?.data;
        const tokenData = data?.token;
        const user = data?.user;
        const userId = user?._id;

        if (tokenData) {
          const localStoragePayload = {
            token: tokenData,
            userId: userId,
          };
          setItem(localStoragePayload);

          dispatch(
            setCredentials({
              token: tokenData,
              id: userId,
              name: user?.name,
              email: user?.email,
              role: user?.role,
            })
          );
        }

        toast.success("Login successful!");
        navigate("/dashboard");
      } else {
        toast.error(response?.response?.data?.message || "Login failed");
      }
    } catch (error) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form onSubmit={handleSubmit} className="p-6 md:p-8">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">Login into Admin</h1>
                {/* <p className="text-muted-foreground text-balance">
                  Login into Admin 
                </p> */}
              </div>
              <div className="grid gap-3">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="1234567890"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="otp">OTP</Label>
                </div>
                <InputOTP 
                maxLength={6}
                value={formData.otp}
                onChange={(otp) => setFormData({ ...formData, otp })}
                ref={otpRef}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup>
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <Button type="submit" className="w-full hover:cursor-pointer">
                {loading ? "Logging in..." : "Login"}
              </Button>
            </div>
          </form>
          <div className="bg-muted relative hidden md:block">
            <img
              src="/logo-light.jpg"
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
