"use client";
import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useBuilder } from "@/context/builder-provider";
import SaveFormBtn from "./SaveFormBtn";
import PublishFormBtn from "./PublishFormBtn";
import { toast } from "@/hooks/use-toast";
import QRCode from "./QRCode";

const FormSettings = () => {
  const { formData, setFormData, blockLayouts, updateChildBlock } = useBuilder();

  const lockedLayout = blockLayouts.find((b) => b.isLocked);

  const headingBlock = lockedLayout?.childblocks?.find(
    (c) => c.blockType === "Heading"
  );

  const paragraphBlock = lockedLayout?.childblocks?.find(
    (c) => c.blockType === "Paragraph"
  );

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // update heading block attributes
    if (lockedLayout && headingBlock) {
      updateChildBlock(lockedLayout.id, headingBlock.id, {
        ...headingBlock,
        attributes: {
          ...headingBlock.attributes,
          label: value,
        },
      });
    }
    if (formData) setFormData({ ...formData, name: value });
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (lockedLayout && paragraphBlock) {
      updateChildBlock(lockedLayout.id, paragraphBlock.id, {
        ...paragraphBlock,
        attributes: {
          ...paragraphBlock.attributes,
          text: value,
        },
      });
    }
    if (formData) setFormData({ ...formData, description: value });
  };

  const handleCopyLink = async () => {
    if (!formData?.formId) return;
    try {
      const url = `${window.location.origin}/public/submit-form/${formData.formId}`;
      await navigator.clipboard.writeText(url);
      toast({ title: "Link copied to clipboard" });
    } catch (err) {
      toast({ title: "Failed to copy link", variant: "destructive" });
    }
  };

  const handleOpenForm = () => {
    if (!formData?.formId) return;
    const url = `/submit-form/${formData.formId}`;
    window.open(url, "_blank");
  };

  const primaryColor = formData?.settings?.primaryColor || "";
  const backgroundColor = formData?.settings?.backgroundColor || "";

  const handlePrimaryColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (formData) setFormData({ ...formData, settings: { ...formData.settings, primaryColor: value } });
  };

  const handleBackgroundColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (formData) setFormData({ ...formData, settings: { ...formData.settings, backgroundColor: value } });
  };

  const formLink = formData?.formId ? `${window.location.origin}/public/submit-form/${formData.formId}` : "";

    const svgId = "qrcode-svg";

  const handleDownload = () => {
    const svgEl = document.getElementById(svgId) as SVGSVGElement | null;
    if (!svgEl) return;
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svgEl);
    const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "qrcode.svg";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };
  return (
    <div className="p-5">
      <div className="flex items-center justify-between gap-3 mb-4">
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleCopyLink}>
            Copy Link
          </Button>
<Button
        onClick={handleDownload}
        variant="outline"
      >
        Download QR
      </Button>
        </div>
      </div>

      <Separator className="!bg-gray-200 mb-4" />

      <div className="space-y-3">
        <div>
          <label className="text-sm text-gray-600">Form name</label>
          <Input
            value={headingBlock?.attributes?.label || formData?.name || ""}
            onChange={handleNameChange}
            className="mt-1"
            placeholder="Untitled form"
          />
        </div>

        <div>
          <label className="text-sm text-gray-600">Description</label>
          <Textarea
            value={paragraphBlock?.attributes?.text || formData?.description || ""}
            onChange={handleDescriptionChange}
            className="mt-1"
            rows={3}
            placeholder="Add a short description"
          />
        </div>

        <QRCode formLink={formLink} formId={svgId}/>

        {false && (<div className="flex flex-col gap-4 mt-2">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Primary color</label>
            <input
              type="color"
              value={primaryColor}
              onChange={handlePrimaryColorChange}
              className="w-10 h-8 p-0 border-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Background</label>
            <input
              type="color"
              value={backgroundColor}
              onChange={handleBackgroundColorChange}
              className="w-10 h-8 p-0 border-none"
            />
          </div>
        </div>)}
      </div>
    </div>
  );
};

export default FormSettings;
