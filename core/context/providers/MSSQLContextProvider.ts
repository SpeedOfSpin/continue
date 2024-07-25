import {
  ContextItem,
  ContextProviderDescription,
  ContextProviderExtras,
} from "../../index.js";
import { BaseContextProvider } from "../index.js";

class MSSQLContextProvider extends BaseContextProvider {
  static description: ContextProviderDescription = {
    title: "mssql",
    displayTitle: "MSSQL",
    description: "Query a Microsoft SQL database",
    type: "normal",
  };

  async getContextItems(
    query: string,
    extras: ContextProviderExtras,
  ): Promise<ContextItem[]> {
    console.log(this.options);
    if ((await extras.ide.getIdeInfo()).ideType === "jetbrains") {
      throw new Error(
        "The terminal context provider is not currently supported in JetBrains IDEs",
      );
    }
    const content = await extras.ide.getTerminalContents();
    return [
      {
        description: "The contents of the terminal",
        content: `Current terminal contents:\n\n${content}`,
        name: "Terminal",
      },
    ];
  }
}

export default MSSQLContextProvider;
