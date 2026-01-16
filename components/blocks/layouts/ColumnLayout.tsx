import {
    FormBlockInstance,
    FormBlockType,
    FormCategoryType,
    FormErrorsType,
    HandleBlurFunc,
    ObjectBlockType,
} from "@/@types/form-block.type";
import ChildCanvasComponentWrapper from "@/components/ChildCanvasComponentWrapper";
import ChildFormComponentWrapper from "@/components/ChildFormComponentWrapper";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useBuilder } from "@/context/builder-provider";
import { FormBlocks } from "@/lib/form-blocks";
import { generateUniqueId } from "@/lib/helper";
import { cn } from "@/lib/utils";
import {
    useDndMonitor,
    useDroppable,
    useDraggable,
    DragEndEvent,
    Active,
} from "@dnd-kit/core";
import { Columns2, Columns, PanelLeft, PanelRight, X, GripHorizontal, Copy, Trash2Icon } from "lucide-react";

import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import React from "react";
import ChildPropertiesComponentWrapper from "@/components/ChildPropertiesComponentWrapper";
import { allBlockLayouts } from "@/constant";

const blockCategory: FormCategoryType = "Layout";

const blockType: FormBlockType = "ColumnLayout";

export const ColumnLayoutBlock: ObjectBlockType = {
    blockCategory,
    blockType,
    createInstance: (id: string) => ({
        id: `2col-${id}`,
        blockType,
        isLocked: false,
        attributes: {
            gridSplit: "50-50",
        },
        childblocks: [],
    }),
    blockBtnElement: {
        icon: Columns2,
        label: "2 Columns",
    },
    canvasComponent: TwoColumnCanvasComponent,
    formComponent: TwoColumnFormComponent,
    propertiesComponent: TwoColumnPropertiesComponent,
};

function TwoColumnCanvasComponent({ blockInstance }: { blockInstance: FormBlockInstance }) {
    const {
        updateBlockLayout,
        selectedBlockLayout,
        handleSeletedLayout,
        duplicateBlockLayout,
        removeBlockLayout,
    } = useBuilder();


    const leftDroppable = useDroppable({
        id: `${blockInstance.id}-left`,
        data: { isLayoutDropArea: true, slot: "left", parentId: blockInstance.id },
    });

    const rightDroppable = useDroppable({
        id: `${blockInstance.id}-right`,
        data: { isLayoutDropArea: true, slot: "right", parentId: blockInstance.id },
    });

    const outerDroppable = useDroppable({
        id: blockInstance.id,
        disabled: blockInstance.isLocked,
        data: { isLayoutDropArea: true, parentId: blockInstance.id },
    });

    const draggable = useDraggable({
        id: blockInstance.id + "_drag-area",
        disabled: blockInstance.isLocked,
        data: {
            blockType: blockInstance.blockType,
            blockId: blockInstance.id,
            isCanvasLayout: true,
        },
    });

    useDndMonitor({
        onDragStart: (event) => {
        },
        onDragEnd: (event: DragEndEvent) => {
            const { active, over } = event;

            if (!over || !active) return;

            console.log(over, "over");
            console.log(active, "active");

            const overData = over.data.current;
            // ensure drop belongs to this layout instance
            if (overData?.parentId !== blockInstance.id) return;

            const type = active.data?.current?.blockType as FormBlockType;
            const isBlockBtnElement = active?.data?.current?.isBlockBtnElement;
            const isLayout = active.data?.current?.blockType;

            const overBlockId = over?.id;
            // if coming from palette / block btn
            if (isBlockBtnElement &&
                !allBlockLayouts.includes(isLayout)) {
                const newBlock = FormBlocks[type].createInstance(generateUniqueId());
                newBlock.attributes = { ...newBlock.attributes, slot: overData.slot };
                const updatedChildren = [...(blockInstance.childblocks || []), newBlock];
                updateBlockLayout(blockInstance.id, updatedChildren);
                return;
            }

            // if dragging existing block between slots inside this layout (optional)
            // skipping intra-layout reorder for now
        },
    });

    const childBlocks = blockInstance.childblocks || [];
    const leftChildren = childBlocks.filter((b) => b.attributes?.slot === "left");
    const rightChildren = childBlocks.filter((b) => b.attributes?.slot === "right");

    const isSelected = selectedBlockLayout?.id === blockInstance.id;

    function removeChildBlock(e: { stopPropagation: () => void }, id: string) {
        e.stopPropagation();
        const filtered = childBlocks.filter((c) => c.id !== id);
        updateBlockLayout(blockInstance.id, filtered);
    }

    if (draggable.isDragging) return null;

    const gridClass =
        blockInstance.attributes?.gridSplit === "30-70"
            ? "grid-cols-[3fr_7fr]"
            : blockInstance.attributes?.gridSplit === "70-30"
                ? "grid-cols-[7fr_3fr]"
                : "grid-cols-2";

    return (
        <div ref={draggable.setNodeRef} className="max-w-full">
            {blockInstance.isLocked && <div className="w-full rounded-t-md min-h-[8px] bg-primary" />}

            <Card
                ref={outerDroppable.setNodeRef}
                className={cn(
                    `!w-full bg-white relative border shadow-sm min-h-[120px] max-w-[768px] rounded-md !p-0`,
                    blockInstance.isLocked && "!rounded-t-none"
                )}
                onClick={() => handleSeletedLayout(blockInstance)}
            >
                {!blockInstance.isLocked && (
                    <div
                        {...draggable.listeners}
                        {...draggable.attributes}
                        role="button"
                        className="flex items-center w-full h-[24px] cursor-move justify-center"
                    >
                        <GripHorizontal size="20px" className="text-muted-foreground" />
                    </div>
                )}

                <CardContent className="px-2 pb-2">
                    {isSelected && !blockInstance.isLocked && (
                        <div className="w-[5px] absolute left-0 top-0 rounded-l-md h-full bg-primary" />
                    )}

                    <div className={cn("grid gap-4 min-h-[100px] p-2", gridClass)}>
                        <div
                            ref={leftDroppable.setNodeRef}
                            className="w-full flex flex-wrap gap-2"
                        >
                            {leftChildren.map((child) => (
                                <div key={child.id} className="w-full h-auto flex items-center justify-center gap-1">
                                    <ChildCanvasComponentWrapper blockInstance={child} />
                                    {isSelected && !blockInstance.isLocked && (
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="!bg-transparent"
                                            onClick={(e) => removeChildBlock(e, child.id)}
                                        >
                                            <X />
                                        </Button>
                                    )}
                                </div>
                            ))}
                            {leftChildren.length === 0 && PlaceHolder("Drag and drop a block here to get started")}
                        </div>

                        <div
                            ref={rightDroppable.setNodeRef}
                            className="w-full flex flex-wrap gap-2"
                        >

                            {rightChildren.map((child) => (
                                <div key={child.id} className="w-full h-auto flex items-center justify-center gap-1">
                                    <ChildCanvasComponentWrapper blockInstance={child} />
                                    {isSelected && !blockInstance.isLocked && (
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="!bg-transparent"
                                            onClick={(e) => removeChildBlock(e, child.id)}
                                        >
                                            <X />
                                        </Button>
                                    )}
                                </div>
                            ))}
                            {rightChildren.length === 0 && PlaceHolder("Drag and drop a block here to get started")}
                        </div>
                    </div>
                </CardContent>

                {isSelected && !blockInstance.isLocked && (
                    <CardFooter className="flex items-center gap-3 justify-end border-t py-3">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={(e) => {
                                e.stopPropagation();
                                duplicateBlockLayout(blockInstance.id);
                            }}
                        >
                            <Copy />
                        </Button>

                        <Button
                            variant="outline"
                            size="icon"
                            onClick={(e) => {
                                e.stopPropagation();
                                removeBlockLayout(blockInstance.id);
                            }}
                        >
                            <Trash2Icon />
                        </Button>
                    </CardFooter>
                )}
            </Card>
        </div>
    );
}

function TwoColumnFormComponent({ blockInstance }: { blockInstance: FormBlockInstance }) {
    const leftChildren = blockInstance.childblocks?.filter((b) => b.attributes?.slot === "left") || [];
    const rightChildren = blockInstance.childblocks?.filter((b) => b.attributes?.slot === "right") || [];

    const gridClass =
        blockInstance?.attributes?.gridSplit === "30-70"
            ? "md:grid-cols-[30%_70%]"
            : blockInstance?.attributes?.gridSplit === "70-30"
                ? "md:grid-cols-[70%_30%]"
                : "md:grid-cols-2";

    return (
        <div className="max-w-full">
            {blockInstance.isLocked && <Border />}

            <Card
                className={cn(
                    `!w-full bg-white relative border
                  shadow-sm
                    min-h-[120px]
                    max-w-[768px]
                        rounded-md !p-0
                        `,
                    blockInstance.isLocked && "!rounded-t-none"
                )}
            >
                <CardContent className="px-2 pb-2">
                    <div className="flex flex-wrap gap-2">
                        <div
                            className="
                     flex w-full flex-col
                     justify-center gap-4 py-4 px-3
                    "
                        >

                            <div className={cn("grid grid-cols-1 gap-4", gridClass)}>
                                <div className="flex flex-col gap-2">
                                    {leftChildren.map((child) => <ChildFormComponentWrapper key={child.id} blockInstance={child} />)}
                                </div>
                                <div className="flex flex-col gap-2">
                                    {rightChildren.map((child) => <ChildFormComponentWrapper key={child.id} blockInstance={child} />)}
                                </div>
                            </div>
                        </div>

                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function TwoColumnPropertiesComponent({
    blockInstance,
}: {
    blockInstance: FormBlockInstance;
}) {
    const { updateBlockLayoutInstance } = useBuilder();

    const updateGridSplit = (value: string) => {
        const updatedInstance = {
            ...blockInstance,
            attributes: {
                ...blockInstance.attributes,
                gridSplit: value,
            },
        };
        updateBlockLayoutInstance(blockInstance.id, updatedInstance);
    };

    const childblocks = blockInstance.childblocks || [];

    return (
        <div className="flex flex-col gap-4 p-4">
            <div className="space-y-1">
                <Label className="text-sm font-semibold">Layout Configuration</Label>
                <p className="text-xs text-muted-foreground">
                    Choose the width distribution for the two columns.
                </p>
            </div>

            <Separator />

            <div className="flex flex-col gap-3">
                <Label htmlFor="gridSplit" className="text-xs font-medium">
                    Column Ratio
                </Label>
                <Select
                    defaultValue={blockInstance.attributes?.gridSplit || "50-50"}
                    onValueChange={updateGridSplit}
                >
                    <SelectTrigger id="gridSplit" className="w-full">
                        <SelectValue placeholder="Select ratio" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="50-50">
                            <div className="flex items-center gap-2">
                                <Columns className="h-4 w-4 text-blue-500" />
                                <span>Equal (50 / 50)</span>
                            </div>
                        </SelectItem>
                        <SelectItem value="30-70">
                            <div className="flex items-center gap-2">
                                <PanelLeft className="h-4 w-4 text-blue-500" />
                                <span>Small Left (30 / 70)</span>
                            </div>
                        </SelectItem>
                        <SelectItem value="70-30">
                            <div className="flex items-center gap-2">
                                <PanelRight className="h-4 w-4 text-blue-500" />
                                <span>Small Right (70 / 30)</span>
                            </div>
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="mt-2 space-y-2">
                <Label className="text-[10px] uppercase text-muted-foreground">Preview</Label>
                <div className="flex h-8 w-full gap-1 rounded border border-dashed p-1 opacity-60">
                    <div
                        className="rounded bg-primary/20 transition-all duration-300"
                        style={{
                            width:
                                blockInstance.attributes?.gridSplit === "30-70"
                                    ? "30%"
                                    : blockInstance.attributes?.gridSplit === "70-30"
                                        ? "70%"
                                        : "50%",
                        }}
                    />
                    <div
                        className="rounded bg-primary/10 transition-all duration-300"
                        style={{
                            width:
                                blockInstance.attributes?.gridSplit === "30-70"
                                    ? "70%"
                                    : blockInstance.attributes?.gridSplit === "70-30"
                                        ? "30%"
                                        : "50%",
                        }}
                    />
                </div>
            </div>

            <div className="pt-3 w-full">
                <div
                    className="flex w-full flex-col 
    items-center
     justify-start gap-0 py-0 px-0
    "
                >
                    {childblocks?.map((childblock, index) => (
                        <div
                            key={childblock.id}
                            className="w-full flex items-center
          justify-center gap-1 h-auto
          "
                        >
                            <ChildPropertiesComponentWrapper
                                index={index + 1}
                                parentId={blockInstance.id}
                                blockInstance={childblock}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function PlaceHolder(PlaceHolderText: String) {
    return (
        <div
            className="flex flex-col items-center
        justify-center border border-dotted
        border-primary
        bg-primary/10
        hover:bg-primary/5
        w-full h-28
        text-primary font-medium
        text-base
        gap-1
        "
        >
            <p
                className="
          text-center text-primary/80
          "
            >
                {PlaceHolderText || "Drag blocks here"}
            </p>
        </div>
    );
}

function Border() {
    return (
        <div
            className="w-full rounded-t-md
  min-h-[8px] bg-primary
    "
        />
    );
}