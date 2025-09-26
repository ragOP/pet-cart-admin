import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { updateUser } from "../helper/updateUser";
import { createUser } from "../helper/createUser";
import { getUserAddress } from "../helper/getUserAddress";

const UserFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 characters"), 
  // password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["user", "admin"]),
});

const UserForm = ({ isEdit = false, initialData }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(UserFormSchema),
    defaultValues: initialData || {
      name: "",
      email: "",
      phoneNumber: "",
      // password: "",
      role: "user",
    },
  });

  // Fetch user addresses when editing
  const { data: addressData, isLoading: isLoadingAddress } = useQuery({
    queryKey: ['userAddress', initialData?._id],
    queryFn: () => getUserAddress(initialData._id),
    enabled: isEdit && !!initialData?._id,
    retry: 1,
  });

  const mutation = useMutation({
    mutationFn: async (data) => {
      if (isEdit) {
        const payload = {
          role: data.role,
          name: data.name,
          email: data.email,
          phoneNumber: data.phoneNumber,
        };
        return await updateUser({ id: initialData._id, payload });
      } else {
        return await createUser(data);
      }
    },
    onSuccess: (res) => {
      if (res?.response?.success) {
        queryClient.invalidateQueries({ queryKey: ['user', initialData._id] });
        toast.success(`User ${isEdit ? "updated" : "created"} successfully`);
        navigate("/dashboard/users");
      } else {
        toast.error(res?.response?.message || "Failed to process user");
      }
    },
    onError: (error) => {
      console.error(error);
      toast.error(`Failed to ${isEdit ? "update" : "create"} user`);
    },
  });

  const onSubmit = async (data) => {
    mutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter user's full name"
                  {...field}
                  // disabled={isEdit}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="Enter user email"
                  {...field}
                  // disabled={isEdit}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phoneNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input
                  type="tel"
                  placeholder="Enter user's Phone Number"
                  {...field}
                  // disabled={isEdit}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* {!isEdit && (
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Enter password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )} */}

        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending
            ? "Processing..."
            : isEdit
            ? "Update User"
            : "Create User"}
        </Button>

        {/* User Addresses Section - Only show when editing */}
        {isEdit && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>User Addresses</CardTitle>
              <CardDescription>
                Addresses associated with this user account
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingAddress ? (
                <div className="flex items-center justify-center p-4">
                  <div className="text-sm text-muted-foreground">Loading addresses...</div>
                </div>
              ) : addressData?.response?.success && addressData?.response?.data?.length > 0 ? (
                <div className="space-y-4">
                  {addressData.response.data.map((address, index) => (
                    <Card key={address._id || index} className="border border-gray-200 hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Badge variant={address.isDefault ? "default" : "secondary"} className="text-xs">
                              {address.isDefault ? "Default" : "Additional"}
                            </Badge>
                            <Badge variant="outline" className="text-xs capitalize">
                              {address.type || 'home'}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div>
                              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Full Name</p>
                              <p className="text-sm font-medium">
                                {`${address.firstName || ''} ${address.lastName || ''}`.trim() || 'N/A'}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Phone</p>
                              <p className="text-sm">{address.phone || 'N/A'}</p>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div>
                              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Address</p>
                              <p className="text-sm leading-relaxed">
                                {address.address && (
                                  <span className="block">{address.address}</span>
                                )}
                                <span className="block">
                                  {[address.city, address.state, address.zip].filter(Boolean).join(', ')}
                                </span>
                                <span className="block font-medium">{address.country}</span>
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>Added: {new Date(address.createdAt).toLocaleDateString()}</span>
                            {address.updatedAt !== address.createdAt && (
                              <span>Updated: {new Date(address.updatedAt).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center p-4">
                  <p className="text-sm text-muted-foreground">
                    {addressData?.response?.message || "No addresses found for this user"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </form>
    </Form>
  );
};

export default UserForm;
