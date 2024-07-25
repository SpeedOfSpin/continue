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

  async getConnection() {
    const sql = require("mssql");
    return sql.connect(this.options.connectionString); 
  }

   private async getTableNames(): Promise<string[]> {
    const schema = this.options.schema ?? "dbo";
    const sql = await this.getConnection();
    let tablesInfoQuery = `
      SELECT
        *
      FROM
        INFORMATION_SCHEMA.TABLES`;

    if (schema !== null) {
      tablesInfoQuery += ` WHERE table_schema = '${schema}'`;
    }
    
    const { recordset: tablesInfo } = await sql.query(tablesInfoQuery);
    const retval = tablesInfo.map(
      (tableInfo: any) => `${tableInfo.TABLE_SCHEMA}.${tableInfo.TABLE_NAME}`,
    );
    return retval;
  }

  private async getFieldNames(tableName: string): Promise<string[]> {
    const sql = await this.getConnection();
    const schema = this.options.schema ?? "public";
    let fieldInfoQuery = `
      Select *
      FROM INFORMATION_SCHEMA.COLUMNS`;
    if (tableName !== null) {
      fieldInfoQuery += ` WHERE Table_Name = '${tableName}'`;
    }
    const { rows: fieldsInfo } = await sql.query(fieldInfoQuery);
    return fieldsInfo.map(
      (fieldInfo: any) => `${fieldInfo.table_schema}.${fieldInfo.table_name}`,
    );
  }

  async getContextItems(
    query: string,
    extras: ContextProviderExtras,
  ): Promise<ContextItem[]> {
    console.log("options", this.options);
    const result = await this.getTableNames();

    const content = result;
    return [
      {
        description: "The contents of the db",
        content: `${content}`,
        name: "MSSQL",
      },
    ];
  }
}

export default MSSQLContextProvider;
