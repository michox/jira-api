import { PageBean } from "atlassian-request";
import { AtlassianRequest } from "atlassian-request";
import { JiraCrudType } from "./JiraCrudType";
import { ScreenTab } from "./ScreenTab";

export interface ScreenCreateRequest {
  name: string;
  description?: string;
  fieldIds?: string[]; // fields on the default screen tab
  screenTabs?: Array<{ name: string; fieldIds: string[]; previousNames?: string[] }>; //use name:'default' for default screen configuration. Use previousNames to change the name of an existing tab without issuing a new ID for the tab.
}

export interface ScreenDetails {
  id: string | number;
  name: string;
  description?: string;
  screenTabs: Array<ScreenTab>;
  screenSchemes?: any;
  workflowTransitions?: any;
}

export class Screen extends JiraCrudType<ScreenDetails, ScreenCreateRequest> {
  constructor() {
    super("/rest/api/3/screens");
    this.body.screenTabs = Array<ScreenTab>();
  }
  defaultTabId?: string | number;

  async createOrUpdate(requestBody: ScreenCreateRequest, previousNames?: string[]) {
    if (previousNames?.length) {
      for (let c = 0; c < previousNames.length; c++) {
        await this.readByName(previousNames[c]);
        console.log(this);
        if (this.body?.id) {
          return this.update(requestBody);
        }
      }
    }
    // else {
    //   await this.readByName(requestBody.name);
    //   if (this.body?.id) {
    //     return this.update(requestBody);
    //   }
    // }
    return this.create(requestBody);
  }

  async create(requestBody: ScreenCreateRequest) {
    let { screenTabs, fieldIds, ...parameters } = requestBody;
    await super.create(parameters);
    if (this.error?.errorMessages?.find((m) => m === "The name is used by another screen.")) {
      await this.readByName(requestBody.name);
      return this.update(requestBody);
    }
    await this.createTabs(fieldIds, screenTabs);
    return this;
  }

  async update(requestBody: ScreenCreateRequest) {
    let { screenTabs, fieldIds, ...parameters } = requestBody;
    //@ts-ignore override automated type creation for parameters
    if (this.body.name === parameters.name) delete parameters.name;
    if (this.body.description === parameters.description) delete parameters.description;
    Object.keys(parameters)?.length && (await super.update(parameters));
    await this.updateTabs(fieldIds, screenTabs);
    return this;
  }

  private async createTabs(
    fieldIds: (string | number)[] | undefined,
    screenTabs: { name: string; fieldIds: string[] }[] | undefined
  ) {
    let promises = Array<Promise<ScreenTab>>();
    if (fieldIds?.length) {
      promises.push(this.addFields(fieldIds));
    }
    screenTabs?.forEach(async (screenTab) => {
      if (screenTab.fieldIds?.length) {
        if (screenTab.name === "default") {
          promises.push(this.addFields(screenTab.fieldIds));
        } else {
          promises.push(
            new ScreenTab(this.body.id).create({
              name: screenTab.name,
              fieldIds: screenTab.fieldIds,
            })
          );
        }
      }
    });
    this.body.screenTabs = await Promise.all(promises);
  }
  private async updateTabs(
    fieldIds: string[] | undefined,
    screenTabs: { name: string; fieldIds: string[]; previousNames?: string[] }[] | undefined
  ) {
    let promises = Array<Promise<any>>();
    if (fieldIds?.length) {
      await this.guaranteeDefaultTabId();
      promises.push(new ScreenTab(this.body.id).WithId(this.defaultTabId!).updateFields(fieldIds));
    }
    screenTabs?.forEach(async ({ previousNames, ...screenTab }) => {
      if (screenTab.fieldIds?.length) {
        if (screenTab.name === "default") {
          await this.guaranteeDefaultTabId();
          promises.push(new ScreenTab(this.body.id).WithId(this.defaultTabId!).updateFields(screenTab.fieldIds));
        } else {
          promises.push(new ScreenTab(this.body.id).createOrUpdate(screenTab, previousNames));
        }
      }
    });

    this.body.screenTabs = await Promise.all(promises);
    this.body.screenTabs?.length > 1 && (await Promise.all(this.body.screenTabs.map((tab, index) => tab.move(index))));
  }

  private async guaranteeDefaultTabId() {
    this.defaultTabId = this.defaultTabId || (await this.readDefaultTabId());
  }

  async read() {
    await super.read(this._defaultRestAddress + `?id=` + this.body.id);
    return this;
  }

  async readByName(name: string) {
    this.status = "pending";
    let getPage = (startAt = 0) =>
      AtlassianRequest<PageBean<ScreenDetails>>(this._defaultRestAddress + `?startAt=${startAt}`).then(({ body }) => body);
    let page = await getPage();
    let screen = page.values.find((v) => v.name === name);
    while (!screen && !page.isLast) {
      page = await getPage(page.maxResults + page.startAt);
      screen = page.values.find((v) => v.name === name);
    }
    if (screen) {
      this.body = screen;
      this.status = "ok";
    } else {
      this.state.error = { errorMessages: [`screen with name ${name} not found`] };
      this.status = "error";
      console.error(this.state.error.errorMessages);
    }
    return this;
  }

  static async deleteAllUnused() {
    let page = await AtlassianRequest<PageBean<ScreenDetails>>(`/rest/api/3/screens?expand=screenScheme`).then(
      ({ body }) => body
    );
    let promises: Promise<any>[] = [];

    console.log(page);
    page.values.map(
      (screen) =>
        screen.screenSchemes ||
        screen.workflowTransitions?.total ||
        promises.push(new Screen().WithId(screen.id).delete())
    );
    while (page.nextPage) {
      console.log(page);
      page = await AtlassianRequest<PageBean<ScreenDetails>>(page.nextPage).then(({ body }) => body);
      page.values.map(
        (screen) =>
          screen.screenSchemes ||
          screen.workflowTransitions?.total ||
          promises.push(new Screen().WithId(screen.id).delete())
      );
    }
    await Promise.all(promises);
  }

  async addFields(fieldIds: (string | number)[], tabId?: string | number) {
    if (!this.body.id) {
      console.error("please define an ID for this screen before adding fields to it");
    }
    tabId = tabId || (await this.readDefaultTabId());
    return new ScreenTab(this.body.id).WithId(tabId).addFields(fieldIds);
  }

  private async readDefaultTabId(): Promise<string | number> {
    return await ScreenTab.readAll(this.body.id).then((tabs) => tabs.find((tab) => tab.name === "Field Tab")!.id);
  }
}
