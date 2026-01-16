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
import { ChevronDown, Hash } from "lucide-react";
import {
  FormBlockInstance,
  FormBlockType,
  FormCategoryType,
  HandleBlurFunc,
  ObjectBlockType,
} from "@/@types/form-block.type";
import { useBuilder } from "@/context/builder-provider";

const blockCategory: FormCategoryType = "Field";
const blockType: FormBlockType = "NumberField";

type attributesType = {
  label: string;
  helperText?: string;
  required: boolean;
  numberType: "integer" | "decimal";
  sign: "any" | "positive" | "negative";
};

const propertiesValidateSchema = z.object({
  label: z.string().trim().min(2).max(255),
  helperText: z.string().trim().max(255).optional(),
  required: z.boolean().default(false),
  numberType: z.enum(["integer", "decimal"]).default("integer"),
  sign: z.enum(["any", "positive", "negative"]).default("any"),
});

type propertiesValidateSchemaType = z.infer<typeof propertiesValidateSchema>;

export const NumberFieldBlock: ObjectBlockType = {
  blockCategory,
  blockType,
  createInstance: (id: string) => ({
    id,
    blockType,
    attributes: {
      label: "Number",
      helperText: "",
      required: false,
      numberType: "integer",
      sign: "any",
    },
  }),
  blockBtnElement: {
    icon: Hash,
    label: "Number",
  },
  canvasComponent: NumberFieldCanvasComponent,
  formComponent: NumberFieldFormComponent,
  propertiesComponent: NumberFieldPropertiesComponent,
};

type NewInstance = FormBlockInstance & { attributes: attributesType };

function NumberFieldCanvasComponent({ blockInstance }: { blockInstance: FormBlockInstance }) {
  const block = blockInstance as NewInstance;
  const { label, helperText, required } = block.attributes;

  return (
    <div className="flex flex-col gap-2 w-full">
      <Label className="text-base !font-normal mb-1">
        {label}
        {required && <span className="text-red-500">*</span>}
      </Label>

      <Input readOnly type="number" className="!pointer-events-none cursor-default h-10" />

      {helperText && <p className="text-muted-foreground text-[0.8rem]">{helperText}</p>}
    </div>
  );
}

function NumberFieldFormComponent({
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
  const { label, helperText, required, numberType, sign } = block.attributes;

  const [value, setValue] = useState<string>("");
  const [isError, setIsError] = useState(false);

  const validateField = (val: string) => {
    if (required && (!val || val.trim() === "")) return false;
    if (!val) return true;

    const num = Number(val);
    if (Number.isNaN(num)) return false;

    if (numberType === "integer" && !Number.isInteger(num)) return false;
    if (sign === "positive" && num <= 0) return false;
    if (sign === "negative" && num >= 0) return false;
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
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${isError || isSubmitError ? "!border-red-500" : ""}`}
      />

      {isError || isSubmitError ? (
        <p className="text-red-500 text-[0.8rem]">{required && !value ? "This field is required." : "Invalid number for selected constraints."}</p>
      ) : (
        errorMessage && <p className="text-red-500 text-[0.8rem]">{errorMessage}</p>
      )}

      {helperText && <p className="text-muted-foreground text-[0.8rem]">{helperText}</p>}
    </div>
  );
}

function NumberFieldPropertiesComponent({
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
      numberType: block.attributes.numberType || "integer",
      sign: block.attributes.sign || "any",
    },
  });

  useEffect(() => {
    form.reset({
      label: block.attributes.label,
      helperText: block.attributes.helperText || "",
      required: block.attributes.required,
      numberType: block.attributes.numberType || "integer",
      sign: block.attributes.sign || "any",
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
        <span className="text-sm font-medium text-gray-600 tracking-wider">Number {positionIndex}</span>
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
            name="numberType"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-baseline justify-between w-full gap-2">
                  <FormLabel className="text-[13px] font-normal">Type</FormLabel>
                  <div className="w-full max-w-[187px]">
                    <Select
                      {...field}
                      onValueChange={(value: "integer" | "decimal") => {
                        field.onChange(value);
                        setChanges({ ...form.getValues(), numberType: value });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="integer">Integer</SelectItem>
                        <SelectItem value="decimal">Decimal</SelectItem>
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
            name="sign"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-baseline justify-between w-full gap-2">
                  <FormLabel className="text-[13px] font-normal">Sign</FormLabel>
                  <div className="w-full max-w-[187px]">
                    <Select
                      {...field}
                      onValueChange={(value: "any" | "positive" | "negative") => {
                        field.onChange(value);
                        setChanges({ ...form.getValues(), sign: value });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select sign" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any</SelectItem>
                        <SelectItem value="positive">Positive</SelectItem>
                        <SelectItem value="negative">Negative</SelectItem>
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
