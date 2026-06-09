// app/invite/[token]/page.tsx
// Accepts a community invite token and redirects to the community chat.

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, CheckCircle, XCircle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAcceptInviteMutation } from "@/lib/api/communityApiSlice";

export default function AcceptInvitePage() {
    const { token } = useParams<{ token: string }>();
    const router = useRouter();

    const [acceptInvite] = useAcceptInviteMutation();
    const [state, setState] = useState<"loading" | "success" | "error">("loading");
    const [message, setMessage] = useState("");
    const [communityId, setCommunityId] = useState<string | null>(null);

    useEffect(() => {
        if (!token) return;

        // If the user is not logged in, redirect to login and come back
        const accessToken = localStorage.getItem("access_token");
        if (!accessToken) {
            router.push(`/login?next=/invite/${token}`);
            return;
        }

        acceptInvite(token)
            .unwrap()
            .then((res) => {
                setMessage(res.detail);
                setCommunityId(res.community_id);
                setState("success");
                // Auto-redirect after 2 s
                setTimeout(() => {
                    router.push(`/dashboard/community?group=${res.community_id}`);
                }, 2000);
            })
            .catch((err) => {
                setMessage(err?.data?.detail || "This invite link is invalid or has expired.");
                setState("error");
            });
    }, [token]);

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-sm w-full p-8 text-center">

                {state === "loading" && (
                    <>
                        <div className="h-16 w-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-5">
                            <Loader2 size={32} className="text-blue-600 animate-spin" />
                        </div>
                        <h2 className="text-lg font-semibold text-slate-800">Joining community…</h2>
                        <p className="text-sm text-slate-500 mt-2">Please wait while we verify your invite.</p>
                    </>
                )}

                {state === "success" && (
                    <>
                        <div className="h-16 w-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5">
                            <CheckCircle size={32} className="text-green-500" />
                        </div>
                        <h2 className="text-lg font-semibold text-slate-800">You&apos;re in!</h2>
                        <p className="text-sm text-slate-500 mt-2">{message}</p>
                        <p className="text-xs text-slate-400 mt-3">Redirecting you to the community…</p>
                        {communityId && (
                            <Button
                                className="mt-5 w-full bg-blue-600 hover:bg-blue-700 text-white gap-2"
                                onClick={() => router.push(`/dashboard/community?group=${communityId}`)}
                            >
                                <Users size={16} />
                                Go to Community
                            </Button>
                        )}
                    </>
                )}

                {state === "error" && (
                    <>
                        <div className="h-16 w-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5">
                            <XCircle size={32} className="text-red-500" />
                        </div>
                        <h2 className="text-lg font-semibold text-slate-800">Invite Invalid</h2>
                        <p className="text-sm text-slate-500 mt-2">{message}</p>
                        <Button
                            variant="outline"
                            className="mt-5 w-full"
                            onClick={() => router.push("/dashboard/community")}
                        >
                            Browse Communities
                        </Button>
                    </>
                )}

            </div>
        </div>
    );
}