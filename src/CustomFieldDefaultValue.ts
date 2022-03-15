export type DefaultCustomFieldValue =
  | CustomFieldContextDefaultValueCascadingOption
  | CustomFieldContextDefaultValueMultipleOption
  | CustomFieldContextDefaultValueSingleOption
  | CustomFieldContextSingleUserPickerDefaults
  | CustomFieldContextDefaultValueMultiUserPicker
  | CustomFieldContextDefaultValueDate
  | CustomFieldContextDefaultValueDateTime
  | CustomFieldContextDefaultValueURL
  | CustomFieldContextDefaultValueProject
  | CustomFieldContextDefaultValueFloat
  | CustomFieldContextDefaultValueLabels
  | CustomFieldContextDefaultValueTextField
  | CustomFieldContextDefaultValueTextArea
  | CustomFieldContextDefaultValueReadOnly
  | CustomFieldContextDefaultValueSingleVersionPicker
  | CustomFieldContextDefaultValueMultipleVersionPicker;
  
interface CustomFieldContextDefaultValueCascadingOption {
  contextId?: string;
  optionId: string;
  cascadingOptionId?: string;
  type: "option.cascading";
}
interface CustomFieldContextDefaultValueMultipleOption {
  contextId?: string;
  optionIds: string[];
  type: "option.multiple";
}
interface CustomFieldContextDefaultValueSingleOption {
  contextId?: string;
  optionId: string;
  type: "option.single";
}
interface CustomFieldContextSingleUserPickerDefaults {
  contextId?: string;
  accountId: string;
  userFilter: {
    enabled: boolean;
    groups: string[];
    roleIds: number[];
  };
  type: "single.user.select";
}
interface CustomFieldContextDefaultValueMultiUserPicker {
  contextId?: string;
  accountIds: string[];
  type: "multi.user.select";
}
type CustomFieldContextDefaultValueDate =
  | {
      contextId?: string;
      useCurrent: boolean; // default false
      type: "datepicker";
    }
  | {
      contextId?: string;
      date: string; //ignored if useCurrent = true
      useCurrent?: boolean; // default false
      type: "datepicker";
    };
type CustomFieldContextDefaultValueDateTime =
  | {
      contextId?: string;
      useCurrent: boolean; // default false
      type: "datetimepicker";
    }
  | {
      contextId?: string;
      date: string; //ignored if useCurrent = true
      useCurrent?: boolean; // default false
      type: "datetimepicker";
    };
interface CustomFieldContextDefaultValueURL {
  contextId?: string;
  url: string;
  type: "url";
}
interface CustomFieldContextDefaultValueProject {
  contextId?: string;
  projectId: string;
  type: "project";
}
interface CustomFieldContextDefaultValueFloat {
  contextId?: string;
  number: number;
  type: "float";
}
interface CustomFieldContextDefaultValueLabels {
  contextId?: string;
  labels: string[];
  type: "labels";
}
interface CustomFieldContextDefaultValueTextField {
  contextId?: string;
  text: string;
  type: "textfield";
}
interface CustomFieldContextDefaultValueTextArea {
  contextId?: string;
  text: string;
  type: "textarea";
}
interface CustomFieldContextDefaultValueReadOnly {
  contextId?: string;
  text: string;
  type: "readonly";
}
interface CustomFieldContextDefaultValueSingleVersionPicker {
  contextId?: string;
  versionId: string;
  versionOrder?: "releasedFirst" | "unreleasedFirst";
  type: "version.single";
}
interface CustomFieldContextDefaultValueMultipleVersionPicker {
  contextId?: string;
  versionId: string[];
  versionOrder?: "releasedFirst" | "unreleasedFirst";
  type: "version.multiple";
}
