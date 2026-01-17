import { FormBlocksType } from "@/@types/form-block.type";
import { HeadingBlock } from "@/components/blocks/HeadingBlock";
import { RowLayoutBlock } from "@/components/blocks/layouts/RowLayout";
import { ColumnLayoutBlock } from "@/components/blocks/layouts/ColumnLayout";
import { ParagraphBlock } from "@/components/blocks/ParagraphBlock";
import { RadioSelectBlock } from "@/components/blocks/RadioSelectBlock";
import { StarRatingBlock } from "@/components/blocks/StarRatingBlock";
import { TextAreaBlock } from "@/components/blocks/TextAreaBlock";
import { TextFieldBlock } from "@/components/blocks/TextField";
import { CheckBoxBlock } from "@/components/blocks/CheckBoxBlock";
import { DateFieldBlock } from "@/components/blocks/DateFieldBlock";
import { NumberFieldBlock } from "@/components/blocks/NumberField";
import { FileUploadBlock } from "@/components/blocks/FileUploadBlock";

export const FormBlocks: FormBlocksType = {
  RowLayout: RowLayoutBlock,
  ColumnLayout: ColumnLayoutBlock,
  Heading: HeadingBlock,
  Paragraph: ParagraphBlock,
  TextField: TextFieldBlock,
  TextArea: TextAreaBlock,
  RadioSelect: RadioSelectBlock,
  StarRating: StarRatingBlock,
  CheckBox: CheckBoxBlock,
 // FileUpload: FileUploadBlock,
  NumberField: NumberFieldBlock,
  DateField: DateFieldBlock,
};
