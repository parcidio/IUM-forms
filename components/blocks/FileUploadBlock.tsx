import React, { useEffect, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { ChevronDown, UploadCloud } from "lucide-react";
import {
  FormBlockInstance,
  FormBlockType,
  FormCategoryType,
  HandleBlurFunc,
  ObjectBlockType,
} from "@/@types/form-block.type";
import { useBuilder } from "@/context/builder-provider";

const blockCategory: FormCategoryType = "Field";
const blockType: FormBlockType = "FileUpload";

type attributesType = {
  label: string;
  helperText?: string;
  required: boolean;
  sizeLimitMB: number; // max size per file in MB
  accept: "all" | "images" | "pdf";
  quantity: "single" | "multiple";
};

const propertiesValidateSchema = z.object({
  label: z.string().trim().min(2).max(255),
  helperText: z.string().trim().max(255).optional(),
  required: z.boolean().default(false),
  sizeLimitMB: z.number().min(0).default(5),
  accept: z.enum(["all", "images", "pdf"]).default("all"),
  quantity: z.enum(["single", "multiple"]).default("single"),
});

type propertiesValidateSchemaType = z.infer<typeof propertiesValidateSchema>;

export const FileUploadBlock: ObjectBlockType = {
  blockCategory,
  blockType,
  createInstance: (id: string) => ({
    id,
    blockType,
    attributes: {
      label: "File Upload",
      helperText: "",
      required: false,
      sizeLimitMB: 5,
      accept: "all",
      quantity: "single",
    },
  }),
  blockBtnElement: {
    icon: UploadCloud,
    label: "File Upload",
  },
  canvasComponent: FileUploadCanvasComponent,
  formComponent: FileUploadFormComponent,
  propertiesComponent: FileUploadPropertiesComponent,
};

type NewInstance = FormBlockInstance & { attributes: attributesType };

function mapAcceptToAttr(accept: attributesType["accept"]) {
  if (accept === "images") return "image/*";
  if (accept === "pdf") return ".pdf";
  return undefined;
}

function FileUploadCanvasComponent({ blockInstance }: { blockInstance: FormBlockInstance }) {
  const block = blockInstance as NewInstance;
  const { label, helperText, required, quantity, accept } = block.attributes;

  return (
    <div className="flex flex-col gap-2 w-full">
      <Label className="text-base !font-normal mb-1">
        {label}
        {required && <span className="text-red-500">*</span>}
      </Label>

      <div className="border border-dashed rounded p-4 flex flex-col items-center justify-center gap-2">
        <UploadCloud className="w-6 h-6 text-muted-foreground" />
        <div className="text-sm">{quantity === "multiple" ? "Multiple files" : "Single file"}</div>
        <div className="text-xs text-muted-foreground">{accept === "images" ? "Images only" : accept === "pdf" ? "PDF only" : "Any file type"}</div>
      </div>

      {helperText && <p className="text-muted-foreground text-[0.8rem]">{helperText}</p>}
    </div>
  );
}

function FileUploadFormComponent({
  blockInstance,
  handleBlur,
  isError: isSubmitError,
  errorMessage,
}: {
  blockInstance: FormBlockInstance;
  handleBlur?: HandleBlurFunc;
  isError?: boolean;
  errorMessage?: string;
}) {
  const block = blockInstance as NewInstance;
  const { label, helperText, required, sizeLimitMB, accept, quantity } = block.attributes;

  const [files, setFiles] = useState<FileList | null>(null);
  const [isError, setIsError] = useState(false);

  const validateFiles = (list: FileList | null) => {
    if (required && (!list || list.length === 0)) return false;
    if (!list || list.length === 0) return true;

    const maxBytes = sizeLimitMB * 1024 * 1024;
    for (let i = 0; i < list.length; i++) {
      const f = list[i];
      if (f.size > maxBytes) return false;
      if (accept === "images" && !f.type.startsWith("image/")) return false;
      if (accept === "pdf" && f.type !== "application/pdf") return false;
    }
    return true;
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files;
    setFiles(list);
    const valid = validateFiles(list);
    setIsError(!valid);
    if (handleBlur) {
      if (!list) handleBlur(block.id, "");
      else handleBlur(block.id, JSON.stringify(Array.from(list).map((f) => f.name)));
    }
  };

  const acceptAttr = mapAcceptToAttr(accept);

  return (
    <div className="flex flex-col gap-2 w-full">
      <Label className={`text-base !font-normal mb-1 ${isError || isSubmitError ? "text-red-500" : ""}`}>
        {label}
        {required && <span className="text-red-500">*</span>}
      </Label>

      <Input type="file" onChange={onChange} accept={acceptAttr} multiple={quantity === "multiple"} />

      {isError || isSubmitError ? (
        <p className="text-red-500 text-[0.8rem]">{required && (!files || files.length === 0) ? "This field is required." : "One or more files are invalid (size/type)."}</p>
      ) : (
        errorMessage && <p className="text-red-500 text-[0.8rem]">{errorMessage}</p>
      )}

      {helperText && <p className="text-muted-foreground text-[0.8rem]">{helperText}</p>}
    </div>
  );
}

function FileUploadPropertiesComponent({
  positionIndex,
  parentId,
  blockInstance,
}: {
  positionIndex?: number;
  parentId?: string;
  blockInstance: FormBlockInstance;
}) {
  const block = blockInstance as NewInstance;
  const { updateChildBlock } = useBuilder();

  const form = useForm<propertiesValidateSchemaType>({
    resolver: zodResolver(propertiesValidateSchema),
    mode: "onBlur",
    defaultValues: {
      label: block.attributes.label,
      helperText: block.attributes.helperText || "",
      required: block.attributes.required,
      sizeLimitMB: block.attributes.sizeLimitMB || 5,
      accept: block.attributes.accept || "all",
      quantity: block.attributes.quantity || "single",
    },
  });

  useEffect(() => {
    form.reset({
      label: block.attributes.label,
      helperText: block.attributes.helperText || "",
      required: block.attributes.required,
      sizeLimitMB: block.attributes.sizeLimitMB || 5,
      accept: block.attributes.accept || "all",
      quantity: block.attributes.quantity || "single",
    });
  }, [block.attributes, form]);

  function setChanges(values: propertiesValidateSchemaType) {
    if (!parentId) return null;
    updateChildBlock(parentId, block.id, {
      ...block,
      attributes: {
        ...block.attributes,
        ...values,
      },
    });
  }

  return (
    <div className="w-full pb-4">
      <div className="w-full flex flex-row items-center justify-between gap-1 bg-gray-100 h-auto p-1 px-2 mb-[10px]">
        <span className="text-sm font-medium text-gray-600 tracking-wider">File Upload {positionIndex}</span>
        <ChevronDown className="w-4 h-4" />
      </div>

      <Form {...form}>
        <form onSubmit={(e) => e.preventDefault()} className="w-full space-y-3 px-4">
          <FormField
            control={form.control}
            name="label"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-baseline justify-between w-full gap-2">
                  <FormLabel className="text-[13px] font-normal">Label</FormLabel>
                  <div className="w-full max-w-[187px]">
                    <FormControl>
                      <Input
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          setChanges({ ...form.getValues(), label: e.target.value });
                        }}
                      />
                    </FormControl>
                  </div>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="helperText"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-baseline justify-between w-full gap-2">
                  <FormLabel className="text-[13px] font-normal">Note</FormLabel>
                  <div className="w-full max-w-[320px]">
                    <FormControl>
                      <Input
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          setChanges({ ...form.getValues(), helperText: e.target.value });
                        }}
                      />
                    </FormControl>
                    <div className="text-xs text-muted-foreground mt-1">Optional helper text</div>
                  </div>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sizeLimitMB"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-baseline justify-between w-full gap-2">
                  <FormLabel className="text-[13px] font-normal">Size limit (MB)</FormLabel>
                  <div className="w-full max-w-[187px]">
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => {
                          const v = Number(e.target.value || 0);
                          field.onChange(v);
                          setChanges({ ...form.getValues(), sizeLimitMB: v });
                        }}
                      />
                    </FormControl>
                  </div>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="accept"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-baseline justify-between w-full gap-2">
                  <FormLabel className="text-[13px] font-normal">Allowed types</FormLabel>
                  <div className="w-full max-w-[187px]">
                    <Select
                      {...field}
                      onValueChange={(value: "all" | "images" | "pdf") => {
                        field.onChange(value);
                        setChanges({ ...form.getValues(), accept: value });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All files</SelectItem>
                        <SelectItem value="images">Images</SelectItem>
                        <SelectItem value="pdf">PDF</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-baseline justify-between w-full gap-2">
                  <FormLabel className="text-[13px] font-normal">Quantity</FormLabel>
                  <div className="w-full max-w-[187px]">
                    <Select
                      {...field}
                      onValueChange={(value: "single" | "multiple") => {
                        field.onChange(value);
                        setChanges({ ...form.getValues(), quantity: value });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select quantity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single">Single</SelectItem>
                        <SelectItem value="multiple">Multiple</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="required"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between w-full gap-2">
                  <FormLabel className="text-[13px] font-normal">Required</FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={(value) => {
                        field.onChange(value);
                        setChanges({ ...form.getValues(), required: value });
                      }}
                    />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </div>
  );
}
