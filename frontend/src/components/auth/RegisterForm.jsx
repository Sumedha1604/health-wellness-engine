import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import Input from "../ui/Input";
import Button from "../ui/Button";
import { register } from "../../services/auth.service";

export default function RegisterForm() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    gender: "",
  });

  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await register(form);

      toast.success("Account created successfully!");

      navigate("/login");

    } catch (error) {
      toast.error(
        error.response?.data?.message ||
        "Registration failed"
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
        Create Account
      </h1>

      <p className="text-muted">
        Create your wellness account
      </p>

      <Input
        name="first_name"
        placeholder="First Name"
        value={form.first_name}
        onChange={handleChange}
      />

      <Input
        name="last_name"
        placeholder="Last Name"
        value={form.last_name}
        onChange={handleChange}
      />

      <Input
        name="email"
        type="email"
        placeholder="Email"
        value={form.email}
        onChange={handleChange}
      />

      <Input
        name="password"
        type="password"
        placeholder="Password"
        value={form.password}
        onChange={handleChange}
      />

      <select
        name="gender"
        value={form.gender}
        onChange={handleChange}
        className="w-full rounded-xl border border-gray-200 px-4 py-3"
      >
        <option value="">Select Gender</option>
        <option value="Male">Male</option>
        <option value="Female">Female</option>
        <option value="Other">Other</option>
      </select>

      <Button
        type="submit"
        disabled={loading}
      >
        {loading ? "Creating..." : "Create Account"}
      </Button>
    </form>
  );
}