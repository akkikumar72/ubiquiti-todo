import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { RxLockClosed, RxEnvelopeClosed, RxPerson } from "react-icons/rx";
import {
  Button,
  Divider,
  ErrorBlock,
  Input,
  SuccessBlock,
} from "@/components/ui";
import Link from "next/link";
import { useEffect } from "react";
import { routes } from "@/constants";

interface Props {
  handleSignUp: (
    email: string,
    password: string
  ) => Promise<void>;
  handleGithub: () => Promise<void>;
  loading: boolean;
  error?: string;
  success?: string;
}

const schema = z.object({
  email: z.string().email("Enter valid email"),
  password: z.string().min(6, "Minimum 6 characters"),
});

type FormData = z.infer<typeof schema>;

const SignupForm = ({
  handleSignUp,
  handleGithub,
  loading,
  error,
  success,
}: Props) => {

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (success) reset();
  }, [success, reset]);

  return (
    <form
      className="flex flex-col gap-2"
      onSubmit={handleSubmit((e) =>
        handleSignUp( e.email, e.password)
      )}
    >
      {error && <ErrorBlock>{error}</ErrorBlock>}
      {success && <SuccessBlock>{success}</SuccessBlock>}
      <Input
        label={"Email"}
        placeholder={"Type your email"}
        type={"email"}
        error={errors.email?.message}
        icon={<RxEnvelopeClosed />}
        {...register("email")}
      />
      <Input
        label={"Password"}
        placeholder={"Type your password"}
        type={"password"}
        error={errors.password?.message}
        icon={<RxLockClosed />}
        {...register("password")}
      />
      <Button loading={loading} className="my-3 w-full" type="submit">
        Sign up
      </Button>
      <Link
        href={routes.auth.signin}
        className="mb-0 text-center text-sm text-zinc-500 opacity-75 hover:opacity-100"
      >
        Already have an account? <span className="text-zinc-300">Sign in</span>
      </Link>
      <Divider>OR</Divider>
      <Button
        className="w-full"
        type="button"
        variant="github"
        onClick={handleGithub}
      >
        Sign up with Github
      </Button>
    </form>
  );
};

export default SignupForm;
