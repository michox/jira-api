import { PageBean } from "./CrudType";
import {JiraApi} from "./JiraApi";
import {JiraCrudType} from "./JiraCrudType";

export interface CustomFieldOptionsCreateRequest {
  options: {
    value: string;
    disabled?: boolean;
    optionId?: string; //only cascading options. The ID of the custom field object containing the cascading option.
  }[];
}

export interface CustomFieldOptionsDetails {
  options: CustomFieldOptionDetails[];
}

export interface CustomFieldOptionDetails {
  id: string;
  value: string;
  disabled?: boolean;
  optionId?: string;
}

export type CustomFieldOptionsReorderRequest =
  | {
      customFieldOptionIds: string[]; //the ordered list of options
      position?: "First" | "Last";
    }
  | {
      customFieldOptionIds: string[]; //the ordered list of options
      after: string; //id of the option to place the moved options after
    };

export class CustomFieldOption extends JiraCrudType<CustomFieldOptionsDetails, CustomFieldOptionsCreateRequest> {
  constructor(fieldId: string, appContextId: string) {
    super(`/rest/api/3/field/${fieldId}/context/${appContextId}/option`);
  }

  async read() {
    return super.read(this._defaultRestAddress);
  }

  async update(options: CustomFieldOptionsCreateRequest) {
    super.update(options, this._defaultRestAddress);
    return this;
  }

  async reorder(props: CustomFieldOptionsReorderRequest) {
    if (!props.hasOwnProperty("after") && !props.hasOwnProperty("position")) {
      props = {
        customFieldOptionIds: props.customFieldOptionIds,
        position: "Last",
      };
    }
    JiraApi(this._defaultRestAddress + "/move", props, "PUT");
  }
}
export async function createOrUpdateOptions(
  options: (string | { value: string; oldValue: string })[],
  id: string,
  contextId: string | undefined,
  defaultRestAddress: string
) {
  let { optionsToCreate, optionsToUpdate, optionsNotToTouch, remainingOptions } = await sortOptionsByExistence(
    options,
    `${defaultRestAddress}/${id}/context/${contextId}/option`
  );

  let finalOptions = [optionsNotToTouch];
  let optionsToDelete = remainingOptions.map((option) =>
    new CustomFieldOption(id, contextId!).WithId(option.id).delete()
  );
  await Promise.all([
    optionsToCreate.options?.length
      ? new CustomFieldOption(id, contextId!)
          .create(optionsToCreate)
          .then(({ body }) => finalOptions.push(body.options))
      : Promise.resolve(),
    optionsToUpdate.options?.length
      ? new CustomFieldOption(id, contextId!)
          .update(optionsToUpdate)
          .then(({ body }) => finalOptions.push(body.options))
      : Promise.resolve(),
  ]);
  let customFieldOptionIds = getOptionIds(options, finalOptions.flat());
  await Promise.all([...optionsToDelete, new CustomFieldOption(id, contextId!).reorder({ customFieldOptionIds })]);
}

async function sortOptionsByExistence(
  optionsInput: (string | { value: string; oldValue: string })[],
  defaultRestAddress: string
) {
  let existingOptions = await JiraApi<PageBean<CustomFieldOptionDetails>>(defaultRestAddress + "?maxResults=1000").then(
    ({ body }) => body.values
  );

  let optionsToCreate: CustomFieldOptionsCreateRequest = { options: [] };
  let optionsNotToTouch: CustomFieldOptionDetails[] = [];
  let optionsToUpdate: CustomFieldOptionsCreateRequest = { options: [] };

  optionsInput.forEach((option) => {
    if (typeof option == "object") {
      // option specifies an old value and therefor needs to be updated
      let i = existingOptions?.findIndex((existingOption) => existingOption.value == option.oldValue);
      if (i >= 0) {
        optionsToUpdate.options.push(existingOptions.splice(i, 1)[0]);
      } else console.error("can't find existing option to update. Ignoring input");
    } else {
      let i = existingOptions?.findIndex((existingOption) => existingOption.value == option);
      if (i >= 0) {
        //option exists and has not changed
        optionsNotToTouch.push(existingOptions.splice(i, 1)[0]);
      } else optionsToCreate.options.push({ value: option });
    }
  });
  let remainingOptions = existingOptions;
  return { optionsToCreate, optionsToUpdate, optionsNotToTouch, remainingOptions };
}

function getOptionIds(
  options: (string | { value: string; oldValue: string })[],
  finalOptions: CustomFieldOptionDetails[]
) {
  return options
    .map(
      (option) =>
        finalOptions.find((optionsObject) =>
          typeof option === "string" ? option === optionsObject.value : option.value === optionsObject?.value
        )?.id
    )
    .filter((option) => {
      if (option === undefined) {
        console.error("An error occured, the option was created or updated but could not be found. Please try again.");
        return false;
      } else return true;
    }) as string[];
}
