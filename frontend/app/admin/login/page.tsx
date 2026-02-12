"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const login = async () => {
    const res = await fetch("http://127.0.0.1:8000/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (data.token) {
      localStorage.setItem("admin_token", data.token);
      router.push("/admin/dashboard");
    } else {
      setError("Login failed");
    }
  };

  return (
    <main className="p-10 text-white">
      <h1 className="text-2xl mb-4">Admin Login</h1>

      <input
        placeholder="Username"
        className="block mb-2 p-2 text-black"
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        className="block mb-2 p-2 text-black"
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        onClick={login}
        className="bg-green-500 px-4 py-2 text-black"
      >
        Login
      </button>

      {error && <p className="text-red-500 mt-2">{error}</p>}
    </main>
  );
}
