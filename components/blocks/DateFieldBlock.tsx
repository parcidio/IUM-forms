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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { ChevronDown, Calendar } from "lucide-react";
import {
  FormBlockInstance,
  FormBlockType,
  FormCategoryType,
  HandleBlurFunc,
  ObjectBlockType,
} from "@/@types/form-block.type";
import { useBuilder } from "@/context/builder-provider";

const blockCategory: FormCategoryType = "Field";
const blockType: FormBlockType = "DateField";

type attributesType = {
  label: string;
  helperText?: string;
  required: boolean;
  dateRange: "all" | "past" | "future";
};

const propertiesValidateSchema = z.object({
  label: z.string().trim().min(2).max(255),
  helperText: z.string().trim().max(255).optional(),
  required: z.boolean().default(false),
  dateRange: z.enum(["all", "past", "future"]).default("all"),
});

type propertiesValidateSchemaType = z.infer<typeof propertiesValidateSchema>;

export const DateFieldBlock: ObjectBlockType = {
  blockCategory,
  blockType,
  createInstance: (id: string) => ({
    id,
    blockType,
    attributes: {
      label: "Date",
      helperText: "",
      required: false,
      dateRange: "all",
    },
  }),
  blockBtnElement: {
    icon: Calendar,
    label: "Date",
  },
  canvasComponent: DateFieldCanvasComponent,
  formComponent: DateFieldFormComponent,
  propertiesComponent: DateFieldPropertiesComponent,
};

type NewInstance = FormBlockInstance & { attributes: attributesType };

function DateFieldCanvasComponent({ blockInstance }: { blockInstance: FormBlockInstance }) {
  const block = blockInstance as NewInstance;
  const { label, helperText, required } = block.attributes;

  return (
    <div className="flex flex-col gap-2 w-full">
      <Label className="text-base !font-normal mb-1">
        {label}
        {required && <span className="text-red-500">*</span>}
      </Label>

      <Input readOnly type="date" className="!pointer-events-none cursor-default h-10" />

      {helperText && <p className="text-muted-foreground text-[0.8rem]">{helperText}</p>}
    </div>
  );
}

function DateFieldFormComponent({
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
  const { label, helperText, required, dateRange } = block.attributes;

  const [value, setValue] = useState("");
  const [isError, setIsError] = useState(false);

  const validateField = (val: string) => {
    if (required && (!val || val.trim() === "")) return false;
    if (!val) return true;

    const picked = new Date(val);
    const today = new Date();
    // normalize to date-only
    today.setHours(0, 0, 0, 0);

    if (dateRange === "future") return picked.getTime() > today.getTime();
    if (dateRange === "past") return picked.getTime() < today.getTime();
    return true;
  };

  const onChange = (val: string) => {
    setValue(val);
    const valid = validateField(val);
    setIsError(!valid);
    if (handleBlur) handleBlur(block.id, val);
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <Label className={`text-base !font-normal mb-1 ${isError || isSubmitError ? "text-red-500" : ""}`}>
        {label}
        {required && <span className="text-red-500">*</span>}
      </Label>

      <Input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${isError || isSubmitError ? "!border-red-500" : ""}`}
      />

      {isError || isSubmitError ? (
        <p className="text-red-500 text-[0.8rem]">
          {required && !value ? "This field is required." : "Invalid date for selected range."}
        </p>
      ) : (
        errorMessage && <p className="text-red-500 text-[0.8rem]">{errorMessage}</p>
      )}

      {helperText && <p className="text-muted-foreground text-[0.8rem]">{helperText}</p>}
    </div>
  );
}

function DateFieldPropertiesComponent({
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
      dateRange: block.attributes.dateRange || "all",
    },
  });

  useEffect(() => {
    form.reset({
      label: block.attributes.label,
      helperText: block.attributes.helperText || "",
      required: block.attributes.required,
      dateRange: block.attributes.dateRange || "all",
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
        <span className="text-sm font-medium text-gray-600 tracking-wider">Date {positionIndex}</span>
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
            name="dateRange"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-baseline justify-between w-full gap-2">
                  <FormLabel className="text-[13px] font-normal">Allowed Dates</FormLabel>
                  <div className="w-full max-w-[187px]">
                    <Select
                      {...field}
                      onValueChange={(value: "all" | "past" | "future") => {
                        field.onChange(value);
                        setChanges({ ...form.getValues(), dateRange: value });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All dates</SelectItem>
                        <SelectItem value="future">In the future</SelectItem>
                        <SelectItem value="past">In the past</SelectItem>
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
