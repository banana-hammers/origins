"use client";

import { useForm } from "react-hook-form";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "./form";
import { Input } from "./input";
import { Button } from "./button";
import { useAuth } from "../../lib/auth";

type SignUpFormValues = {
  email: string;
  password: string;
  confirmPassword: string;
};

export default function SignUpForm() {
  const { signUp } = useAuth();
  const form = useForm<SignUpFormValues>({
    defaultValues: { email: "", password: "", confirmPassword: "" },
  });
  
  const { handleSubmit, control, getValues } = form;

  const onSubmit = async (values: SignUpFormValues) => {
    try {
      await signUp(values.email, values.password);
      alert('Check your email to confirm your account!');
    } catch (err: unknown) {
      console.error(err);
      alert('Error signing up. Please try again.');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={control}
          name="email"
          rules={{
            required: 'Email is required',
            pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' },
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} type="email" placeholder="you@example.com" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="password"
          rules={{ 
            required: 'Password is required',
            minLength: { value: 6, message: 'Password must be at least 6 characters' },
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input {...field} type="password" placeholder="••••••••" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="confirmPassword"
          rules={{ 
            required: 'Please confirm your password',
            validate: (value) => value === getValues('password') || 'Passwords do not match',
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <Input {...field} type="password" placeholder="••••••••" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          Sign Up
        </Button>
      </form>
    </Form>
  );
}