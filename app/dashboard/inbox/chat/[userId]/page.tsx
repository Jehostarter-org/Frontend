import { use } from "react";
import ChatClient from "./chat_client";


interface PageProps {
  params: Promise<{ userId: string }>;
}

export default async function Page({ params }: PageProps) {
  const { userId } = await params;

  const chatUser = {
    id: userId,
    name: "Michael", 
    avatar: "/images/photo1.png"
  };

  return <ChatClient chatUser={chatUser} />;
}