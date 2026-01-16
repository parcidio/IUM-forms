import React from "react";
import { useQRCode } from "next-qrcode";
import { Button } from "@/components/ui/button";

type QRCodeProps = {
  formId?: string;
  formLink?: string;
};

function QRCode({ formId, formLink }: QRCodeProps) {
  const { SVG } = useQRCode();
  const link =
    formLink ??
    (typeof window !== "undefined"
      ? `${window.location.origin}/submit-form/${new URLSearchParams(
          window.location.search
        ).get("formId")}`
      : "");



  return (
    <div className="flex flex-col items-start gap-2">
    <div id={formId}>
      <SVG
        text={link}
        options={{
          margin: 2,
          width: 200,
          color: {
            dark: "#010599FF",
            light: "#8e0b0d1a",
          },
        }}
      />
    </div>
      
    </div>
  );
}

export default QRCode;