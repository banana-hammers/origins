"use client";

import { useForm } from "react-hook-form"
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "./form"
import { Input } from "./input"
import { Button } from "./button"
import { useAuth } from '../../lib/auth'

type LoginFormValues = {
  email: string
  password: string
}

export default function LoginForm() {
  const { signIn } = useAuth();
  const form = useForm<LoginFormValues>({
    defaultValues: { email: "", password: "" }
  })
  const { handleSubmit, control } = form

  const onSubmit = async (values: LoginFormValues) => {
    try {
      await signIn(values.email, values.password)
      // Success! The auth state will be updated automatically
    } catch (err: unknown) {
      console.error(err)
      alert('Invalid email or password')
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={control}
          name="email"
          rules={{
            required: 'Email is required',
            pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' }
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
          rules={{ required: 'Password is required', minLength: { value: 6, message: 'Password must be at least 6 characters' } }}
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

        <Button type="submit" className="w-full">
          Sign In
        </Button>
      </form>
    </Form>
  )
}