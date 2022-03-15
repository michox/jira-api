import { JiraApi } from "./JiraApi";
import { JiraCrudType } from "./JiraCrudType";
import { ScreenTabField, ScreenTabFieldDetails } from "./ScreenTabField";

export interface ScreenTabCreateRequest {
  name: string;
  fieldIds?: Array<string>;
}

export interface ScreenTabDetails extends ScreenTabCreateRequest {
  id: string | number;
  screenId: string | number;
  fields: Array<ScreenTabField>;
}

export class ScreenTab extends JiraCrudType<ScreenTabDetails, ScreenTabCreateRequest> {
  constructor(screenId: string | number) {
    super(`/rest/api/3/screens/${screenId}/tabs`);
    this.body.screenId = screenId;
    this.body.fields = Array<ScreenTabField>();
  }

  /**
   * @brief create fields and ensure they are in the order as passed in the parameter.
   * @param fieldIds array of the fields to add
   * @returns the ScreenTab object
   */

  async addFields(fieldIds: Array<string | number>) {
    this.body.fields = await Promise.all(
      fieldIds.map((fieldId) => new ScreenTabField(this.body.screenId, this.body.id).create({ fieldId: fieldId }))
    );
    this.reorderFields(); // don't await reordering
    return this;
  }

  async create({ name, fieldIds }: ScreenTabCreateRequest): Promise<this> {
    await super.create({ name });
    if (fieldIds?.length) {
      await this.addFields(fieldIds);
    }
    return this;
  }

  async update({ name, fieldIds }: ScreenTabCreateRequest): Promise<this> {
    await super.update({ name });
    if (fieldIds?.length) await this.updateFields(fieldIds);
    return this;
  }

  async createOrUpdate(requestBody: ScreenTabCreateRequest, previousNames?: string[]): Promise<this> {
    if (previousNames?.length) {
      for (let c = 0; c < previousNames.length; c++) {
        await this.readByName(previousNames[c]);
        if (this.body?.id) {
          return this.update(requestBody);
        }
      }
    }
    return this.create(requestBody);
  }

  async move(pos: number): Promise<this> {
    await JiraApi(this._defaultRestAddress + "/move/" + pos, {}, "POST");
    return this;
  }

  static async readAll(screenId: string | number): Promise<{ id: number; name: string }[]> {
    return (await JiraApi<{ id: number; name: string }[]>(`/rest/api/3/screens/${screenId}/tabs`)).body;
  }

  async readByName(name: string) {
    let allTabs = (await JiraApi<{ id: number; name: string }[]>(this._defaultRestAddress)).body;
    let thisTab = allTabs.find((t) => t.name === name);
    if (thisTab) this.body = { ...this.body, ...thisTab };
    return this;
  }

  async removeAllFields() {
    if (!this.body.fields?.length) {
      let fields = (await this.getAllFields()).body;
      await Promise.all(
        fields?.map((field) => new ScreenTabField(this.body.screenId, this.body.id).WithId(field.id).delete())
      );
      return Promise.resolve();
    }
    await Promise.all(
      this.body?.fields?.map((field) =>
        new ScreenTabField(this.body.screenId, this.body.id).WithId(field.body.id).delete()
      )
    );
    return Promise.resolve();
  }

  async updateFields(fieldIds: string[]) {
    let existingFields = (await this.getAllFields()).body;
    let fieldsToDelete = existingFields.map((f) => f.id);
    let fieldsToCreate = fieldIds;
    let fieldsNotToTouch: string[] = [];
    let correctFieldCount = 0; //each time we delete a field we need to adjust for the change in index

    for (const [fieldIndex, fieldId] of fieldIds.entries()) {
      existingFields.find((existingField, existingFieldIndex) => {
        if (existingField.id === fieldId) {
          fieldsNotToTouch.push(fieldId);
          fieldsToDelete.splice(existingFieldIndex - correctFieldCount, 1);
          fieldsToCreate.splice(fieldIndex - correctFieldCount, 1);
          correctFieldCount++;
          return true;
        }
        return false;
      });
    }

    let fields = (
      await Promise.all([
        ...fieldsToDelete.map((fieldId) =>
          new ScreenTabField(this.body.screenId, this.body.id).WithId(fieldId).delete()
        ),
        ...fieldsToCreate.map((fieldId) => new ScreenTabField(this.body.screenId, this.body.id).create({ fieldId })),
        ...fieldsNotToTouch.map((fieldId) => new ScreenTabField(this.body.screenId, this.body.id).WithId(fieldId)),
      ])
    ).flat();
    this.body.fields = fieldIds.map((id) => fields.find((field) => field.body.id === id)!);
    if (fieldsToCreate.length || (fieldsToDelete.length && this.body.fields.length > 1)) {
      this.reorderFields(this.body.fields); //don't await reordering as we don't want it to slow down the process and it is not critical
    }
  }

  async getAllFields() {
    return JiraApi<ScreenTabFieldDetails[]>(`/rest/api/3/screens/${this.body.screenId}/tabs/${this.body.id}/fields`);
  }

  private async reorderFields(fields: ScreenTabField[] = this.body.fields) {
    // return Promise.all(
    //   fields.map((field, i) => (i ? field.move({ after: fields[i - 1].body.id }) : field.move({ position: "First" })))
    // );

    let moveNextField = (index: number) => {
      fields[index]
        .move({ position: "Last" })
        .then(() => (++index < fields.length ? moveNextField(index) : Promise.resolve()));
    };
    moveNextField(0);
  }
}
