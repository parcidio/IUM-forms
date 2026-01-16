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
import { Button } from "@/components/ui/button";
import { ChevronDown, CheckSquare, Square } from "lucide-react";
import {
  FormBlockInstance,
  FormBlockType,
  FormCategoryType,
  HandleBlurFunc,
  ObjectBlockType,
} from "@/@types/form-block.type";
import { useBuilder } from "@/context/builder-provider";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { generateUniqueId } from "@/lib/helper";
import { Checkbox } from "@/components/ui/checkbox";

const blockCategory: FormCategoryType = "Field";
const blockType: FormBlockType = "CheckBox";

type attributesType = {
  label: string;
  options: string[];
  required: boolean;
};

type propertiesValidateSchemaType = z.infer<typeof propertiesValidateSchema>;

const propertiesValidateSchema = z.object({
  label: z.string().trim().min(2).max(255),
  required: z.boolean().default(false),
  options: z.array(z.string().min(1)),
});

export const CheckBoxBlock: ObjectBlockType = {
  blockCategory,
  blockType,
  createInstance: (id: string) => ({
    id,
    blockType,
    attributes: {
      label: "Checkbox",
      options: ["Option 1", "Option 2"],
      required: false,
    },
  }),
  blockBtnElement: {
    icon: CheckSquare,
    label: "Checkbox",
  },
  canvasComponent: CheckBoxCanvasComponent,
  formComponent: CheckBoxFormComponent,
  propertiesComponent: CheckBoxPropertiesComponent,
};

type NewInstance = FormBlockInstance & {
  attributes: attributesType;
};

function CheckBoxCanvasComponent({ blockInstance }: { blockInstance: FormBlockInstance }) {
  const block = blockInstance as NewInstance;
  const { label, options, required } = block.attributes;

  return (
    <div className="flex flex-col gap-3 w-full">
      <Label className="text-base !font-normal mb-1">
        {label}
        {required && <span className="text-red-500">*</span>}
      </Label>

      <div className="flex flex-col gap-2">
        {options?.map((option, idx) => (
          <label key={idx} className="flex items-center gap-2">
            <Checkbox id={`chk-${block.id}-${idx}`} checked  className="!pointer-events-none" />
            <span className="!font-normal">{option}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

function CheckBoxFormComponent
({
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
  const { label, options, required } = block.attributes;

  const [values, setValues] = useState<string[]>([]);
  const [isError, setIsError] = useState(false);

  const onChange = (option: string, checked: boolean) => {
    console.log("onChange", option, checked);
    console.log("Current values", values);
    const next = checked ? [...values, option] : values.filter((v) => v !== option);
    setValues(next);
    const valid = validateField(next);
    setIsError(!valid);
    if (handleBlur) handleBlur(block.id, JSON.stringify(next));
  };

  const validateField = (vals: string[]) => {
    if (required) return vals.length > 0;
    return true;
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <Label className={`text-base !font-normal mb-1 ${isError || isSubmitError ? "text-red-500" : ""}`}>
        {label}
        {required && <span className="text-red-500">*</span>}
      </Label>

      <div className="flex flex-col gap-2">
        {options?.map((option, idx) => (
          <label key={idx} className="flex items-center gap-2">
            <Checkbox
              id={`chk-${block.id}-${idx}`}
              
              checked={values.includes(option)}
              onCheckedChange={(checked) => onChange(option, !!checked)}
            />
            <span className="!font-normal">{option}</span>
          </label>
        ))}
      </div>

      {isError || isSubmitError ? (
        <p className="text-red-500 text-[0.8rem]">{required ? "This field is required." : ""}</p>
      ) : (
        errorMessage && <p className="text-red-500 text-[0.8rem]">{errorMessage}</p>
      )}
    </div>
  );
}

function CheckBoxPropertiesComponent({
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
      required: block.attributes.required,
      options: block.attributes.options || [],
    },
  });

  useEffect(() => {
    form.reset({
      label: block.attributes.label,
      required: block.attributes.required,
      options: block.attributes.options || [],
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
        <span className="text-sm font-medium text-gray-600 tracking-wider">Checkbox {positionIndex}</span>
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
            name="options"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-baseline justify-between w-full gap-2">
                  <FormLabel className="text-[13px] font-normal">Options</FormLabel>
                  <div className="flex flex-col gap-2 w-full max-w-[320px]">
                    {field.value?.map((option: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-2">
                        <Input
                          value={option}
                          onChange={(e) => {
                            const updated = [...(field.value || [])];
                            updated[idx] = e.target.value;
                            field.onChange(updated);
                            setChanges({ ...form.getValues(), options: updated });
                          }}
                          className="flex-1"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const updated = (field.value || []).filter((_, i) => i !== idx);
                            field.onChange(updated);
                            setChanges({ ...form.getValues(), options: updated });
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const current = field.value || [];
                        const next = [...current, `Option ${current.length + 1}`];
                        field.onChange(next);
                        setChanges({ ...form.getValues(), options: next });
                      }}
                    >
                      Add Option
                    </Button>
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
