import Header from "../components/Header";
import { useState } from "react";

const VerifyPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleVerify = () => {
    console.log("Verifying credential for:", username, password);
  };

  return (
    <main className="min-h-screen bg-neutral-800 text-white">
      <Header />
      <section className="w-full max-w-4xl mx-auto flex justify-center items-center md:min-h-[calc(100vh-60px)] min-h-[calc(100vh-40px)] p-4">
        <div className="flex flex-col w-full max-w-md p-8 gap-6 bg-neutral-700 rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold text-center text-white">
            Verify credential
          </h1>

          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoFocus
            className="w-full px-4 py-3 bg-neutral-800 border-2 border-neutral-600 rounded-md text-neutral-200 placeholder-neutral-500 outline-none focus:ring-2 focus:ring-stone-500 focus:border-stone-500 transition-all duration-200"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-neutral-800 border-2 border-neutral-600 rounded-md text-neutral-200 placeholder-neutral-500 outline-none focus:ring-2 focus:ring-stone-500 focus:border-stone-500 transition-all duration-200"
          />

          <button
            onClick={handleVerify}
            className="w-full py-3 px-4 bg-stone-600 rounded-md font-semibold text-white hover:bg-stone-500 hover:cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-700 focus:ring-stone-500 transition-colors duration-200 disabled:bg-neutral-600 disabled:cursor-not-allowed"
            disabled={!username || !password}
          >
            Verify
          </button>
        </div>
      </section>
    </main>
  );
};

export default VerifyPage;
