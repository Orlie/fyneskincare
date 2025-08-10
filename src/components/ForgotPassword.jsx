import { useState } from "react";
import { requestPasswordReset } from "../utils/auth";


export default function ForgotPassword({ onBack }) {
    const [email, setEmail] = useState("");
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");

    const submit = async () => {
        setErr(""); setLoading(true);
        try {
            await requestPasswordReset(email);
            setSent(true);
        } catch (e) {
            setErr(e.message || "Failed to send reset email");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-sm mx-auto p-4">
            <h1 className="text-xl font-semibold mb-3">Forgot Password</h1>

            {sent ? (
                <>
                    <p className="mb-4">Reset email sent. Check your inbox and spam folder.</p>
                    <button className="px-3 py-2 rounded bg-white/10" onClick={onBack}>Back to login</button>
                </>
            ) : (
                <>
                    <input
                        className="w-full mb-3 px-3 py-2 rounded text-black"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Your account email"
                        type="email"
                    />
                    {err && <p className="text-red-400 text-sm mb-2">{err}</p>}
                    <div className="flex gap-2">
                        <button disabled={loading} className="px-3 py-2 rounded bg-white/10" onClick={submit}>
                            {loading ? "Sending..." : "Send reset email"}
                        </button>
                        <button className="px-3 py-2 rounded bg-white/5" onClick={onBack}>Back</button>
                    </div>
                </>
            )}
        </div>
    );
}
