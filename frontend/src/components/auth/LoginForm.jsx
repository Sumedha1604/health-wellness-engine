import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import Input from "../ui/Input";
import Button from "../ui/Button";

import { login } from "../../services/auth.service";
import { useAuth } from "../../context/AuthContext";

export default function LoginForm() {
  const navigate = useNavigate();

  const { login: loginUser } = useAuth();

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const message = localStorage.getItem("authMessage");

    if (message) {
      toast.error(message);
      localStorage.removeItem("authMessage");
    }
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await login({
        email,
        password,
      });

      loginUser(
        response.data.token,
        response.data.user
      );

      toast.success("Welcome back!");

      navigate("/");

    } catch (error) {
      toast.error(
        error.response?.data?.message ||
        "Login failed"
      );

    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      <h1 className="text-3xl font-bold">
        Welcome Back
      </h1>

      <p className="text-muted">
        Sign in to continue
      </p>

      <Input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) =>
          setEmail(e.target.value)
        }
      />

      <Input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) =>
          setPassword(e.target.value)
        }
      />

      <Button
        type="submit"
        disabled={loading}
      >
        {loading ? "Signing In..." : "Login"}
      </Button>
    </form>
  );
}