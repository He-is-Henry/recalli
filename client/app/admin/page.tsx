"use client";
import { ApiError, getAdmins, makeAdmins } from "@/lib/api";
import { ChangeEvent, SubmitEventHandler, useEffect, useState } from "react";

export default function AdminPage() {
  const [admins, setAdmins] = useState<
    { email: string; role: string; _id: string }[] | []
  >([]);
  const [email, setEmail] = useState<string>("");
  const [error, setError] = useState<string>();

  const onEmailChange = (
    e: ChangeEvent<HTMLInputElement, HTMLInputElement>,
  ) => {
    setEmail(e.target.value);
  };
  const onEmailSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    await makeAdmins(email);
  };
  useEffect(() => {
    console.log(admins);
  }, [admins]);

  useEffect(() => {
    getAdmins()
      .then(setAdmins)
      .catch((err) =>
        setError(
          err instanceof ApiError ? err.message : "Failed to load levels",
        ),
      );
  }, []);

  return (
    <main>
      {error && <p>{error}</p>}
      <ul>
        {admins.length > 0 ? (
          admins.map((a) => (
            <li style={{ color: "white" }} key={a._id}>
              {a.email}
            </li>
          ))
        ) : (
          <li style={{ color: "white" }}>No admins</li>
        )}
      </ul>

      <form onSubmit={onEmailSubmit}>
        <input type="text" value={email} onChange={onEmailChange} />
        <button>Make admin</button>
      </form>
    </main>
  );
}
