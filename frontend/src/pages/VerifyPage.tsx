import Header from "../components/Header";
import { useState } from "react";
import type { VerifiedCredential } from "../types";
import { AxiosError } from "axios";
import apiClient from "../api/client";
import Modal from "../components/Modal";
import { Link } from "react-router";
import { FiExternalLink as ExternalLinkIcon } from "react-icons/fi";

type ModalData = {
  status: "success" | "error";
  message: string;
  credential?: VerifiedCredential;
};

const VerifyPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState<ModalData | null>(null);

  const handleVerification = async () => {
    setIsLoading(true);

    try {
      const response = await apiClient.post("/verify", { username, password });

      setModalData({
        status: "success",
        message: response.data.message,
        credential: response.data.data.credential,
      });
    } catch (err) {
      let errorText = "An unexpected error occurred. Please try again.";
      if (err instanceof AxiosError && err.response) {
        errorText = err.response.data?.message || "Error response from server.";
      }

      setModalData({
        status: "error",
        message: errorText,
      });
    } finally {
      setIsLoading(false);
      setUsername("");
      setPassword("");
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
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
            onClick={handleVerification}
            className="w-full py-3 px-4 bg-stone-600 rounded-md font-semibold text-white hover:bg-stone-500 hover:cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-700 focus:ring-stone-500 transition-colors duration-200 disabled:bg-neutral-600 disabled:cursor-not-allowed"
            disabled={!username || !password || isLoading}
          >
            {isLoading ? "Verifying..." : "Verify"}
          </button>
        </div>
      </section>

      {modalData && (
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          status={modalData.status}
          message={modalData.message}
          footer={
            modalData.status === "success" ? (
              <Link
                to="/"
                onClick={handleCloseModal}
                className="w-full flex justify-center items-center gap-4 text-center py-3 px-4 bg-stone-600 rounded-md font-semibold text-white hover:bg-stone-500 transition-colors duration-200"
              >
                Go to generation page
                <ExternalLinkIcon />
              </Link>
            ) : (
              <button
                onClick={handleCloseModal}
                className="w-full py-3 px-4 bg-neutral-600 rounded-md font-semibold text-white hover:bg-neutral-500 transition-colors cursor-pointer"
              >
                Try Again
              </button>
            )
          }
        >
          {modalData.status === "success" && modalData.credential && (
            <div className="bg-neutral-800 p-4 rounded-md space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="font-semibold text-neutral-400">Id:</span>
                <span className="text-white">{modalData.credential.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-neutral-400">
                  Username:
                </span>
                <span className="text-white">
                  {modalData.credential.username}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-neutral-400">
                  Password:
                </span>
                <span className="text-white">
                  {modalData.credential.password}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="font-semibold text-neutral-400">
                  Issued At:
                </span>
                <span className="text-white">
                  {new Date(modalData.credential.issuedAt).toLocaleString(
                    "en-IN"
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-neutral-400">Worker:</span>
                <span className="text-white">
                  {modalData.credential.worker}
                </span>
              </div>
            </div>
          )}
        </Modal>
      )}
    </main>
  );
};

export default VerifyPage;
