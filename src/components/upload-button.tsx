"use client";
import { useRef, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useToast } from "@/hooks/use-toast";
import { UploadCloud } from "lucide-react";

export function UploadButton({ onUploaded }: { onUploaded: (file: { name:string; url:string; key:string }) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const { toast } = useToast();

  async function pick() {
    inputRef.current?.click();
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const sign = await fetch("/api/uploads/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, contentType: file.type || "application/octet-stream" }),
      }).then(r=>r.json());

      if (!sign.url) throw new Error("Failed to get signed URL");

      const put = await fetch(sign.url, { method: "PUT", headers: { "Content-Type": file.type || "application/octet-stream" }, body: file });
      if (!put.ok) throw new Error("Upload to storage failed");
      
      onUploaded({ name: file.name, url: sign.publicUrl, key: sign.key });

      toast({
        title: "Upload Successful",
        description: `${file.name} has been uploaded.`,
      });

    } catch (err:any) {
      toast({
        title: "Upload Failed",
        description: err.message || "An unknown error occurred.",
        variant: "destructive",
      });
    } finally {
      setBusy(false);
      if(inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <>
      <Button disabled={busy} onClick={pick} variant="outline">
        <UploadCloud className="mr-2 h-4 w-4" />
        {busy ? "Uploading…" : "Upload Document"}
      </Button>
      <Input ref={inputRef} type="file" className="hidden" onChange={onFile} />
    </>
  );
}
