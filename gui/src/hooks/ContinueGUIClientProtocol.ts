import { ContextItem, ContextItemId } from "../schema/FullState";
import AbstractContinueGUIClientProtocol from "./AbstractContinueGUIClientProtocol";
import { Messenger, SocketIOMessenger, WebsocketMessenger } from "./messenger";
import { VscodeMessenger } from "./vscodeMessenger";

class ContinueGUIClientProtocol extends AbstractContinueGUIClientProtocol {
  messenger?: Messenger;
  serverUrl: string;
  useVscodeMessagePassing: boolean;

  onStateUpdateCallbacks: ((state: any) => void)[] = [];

  constructor(serverUrl: string, useVscodeMessagePassing: boolean) {
    super();
    this.serverUrl = serverUrl;
    this.useVscodeMessagePassing = useVscodeMessagePassing;

    this.serverUrl = serverUrl;
    this.useVscodeMessagePassing = useVscodeMessagePassing;
    this.messenger = useVscodeMessagePassing
      ? new VscodeMessenger(serverUrl)
      : new SocketIOMessenger(serverUrl);

    this.messenger.onClose(() => {
      console.log("GUI Connection closed: ", serverUrl);
    });
    this.messenger.onError((error) => {
      console.log("GUI Connection error: ", error);
    });
    this.messenger.onOpen(() => {
      console.log("GUI Connection opened: ", serverUrl);
    });

    this.messenger.onMessage((messageType, data) => {
      this.handleMessage(messageType, data);
    });
  }

  onConnected(callback: () => void) {
    this.messenger?.onOpen(callback);
  }

  handleMessage(messageType: string, data: any) {
    switch (messageType) {
      case "state_update":
        if (data.state) {
          for (const callback of this.onStateUpdateCallbacks) {
            callback(data.state);
          }
        }
        break;
      default:
        console.log("Unknown message type: ", messageType);
    }
  }

  loadSession(session_id?: string): void {
    this.messenger?.send("load_session", { session_id });
  }

  sendMainInput(input: string) {
    this.messenger?.send("main_input", { input });
  }

  reverseToIndex(index: number) {
    this.messenger?.send("reverse_to_index", { index });
  }

  sendRefinementInput(input: string, index: number) {
    this.messenger?.send("refinement_input", { input, index });
  }

  sendStepUserInput(input: string, index: number) {
    this.messenger?.send("step_user_input", { input, index });
  }

  onStateUpdate(callback: (state: any) => void) {
    this.messenger?.onMessageType("state_update", (data: any) => {
      if (data.state) {
        callback(data.state);
      }
    });
    this.onStateUpdateCallbacks.push(callback);
  }

  onStepUpdate(callback: (update: SessionUpdate) => void) {
    this.messenger?.onMessageType("step_update", (data: SessionUpdate) => {
      if (data.update) {
        callback(data.update);
      }
    });
  }

  onAvailableSlashCommands(
    callback: (commands: { name: string; description: string }[]) => void
  ) {
    this.messenger?.onMessageType("available_slash_commands", (data: any) => {
      if (data.commands) {
        callback(data.commands);
      }
    });
  }

  sendClear() {
    this.messenger?.send("clear_history", {});
  }

  retryAtIndex(index: number) {
    this.messenger?.send("retry_at_index", { index });
  }

  deleteAtIndex(index: number) {
    this.messenger?.send("delete_at_index", { index });
  }

  deleteContextWithIds(ids: ContextItemId[], index?: number) {
    this.messenger?.send("delete_context_with_ids", {
      ids: ids.map((id) => `${id.provider_title}-${id.item_id}`),
      index,
    });
  }

  setEditingAtIds(ids: string[]) {
    this.messenger?.send("set_editing_at_ids", { ids });
  }

  toggleAddingHighlightedCode(): void {
    this.messenger?.send("toggle_adding_highlighted_code", {});
  }

  showLogsAtIndex(index: number): void {
    this.messenger?.send("show_logs_at_index", { index });
  }

  showContextVirtualFile(index?: number): void {
    this.messenger?.send("show_context_virtual_file", { index });
  }

  selectContextItem(id: string, query: string): void {
    this.messenger?.send("select_context_item", { id, query });
  }

  selectContextItemAtIndex(id: string, query: string, index: number): void {
    this.messenger?.send("select_context_item_at_index", {
      id,
      query,
      index,
    });
  }

  editStepAtIndex(userInput: string, index: number): void {
    this.messenger?.send("edit_step_at_index", {
      user_input: userInput,
      index,
    });
  }

  setSystemMessage(message: string): void {
    this.messenger?.send("set_system_message", { message });
  }

  setTemperature(temperature: number): void {
    this.messenger?.send("set_temperature", { temperature });
  }

  addModelForRole(role: string, model_class: string, model: any): void {
    this.messenger?.send("add_model_for_role", { role, model, model_class });
  }

  setModelForRoleFromIndex(role: string, index: number): void {
    this.messenger?.send("set_model_for_role_from_index", { role, index });
  }

  saveContextGroup(title: string, contextItems: ContextItem[]): void {
    this.messenger?.send("save_context_group", {
      context_items: contextItems,
      title,
    });
  }

  selectContextGroup(id: string): void {
    this.messenger?.send("select_context_group", { id });
  }

  deleteContextGroup(id: string): void {
    this.messenger?.send("delete_context_group", { id });
  }

  setCurrentSessionTitle(title: string): void {
    this.messenger?.send("set_current_session_title", { title });
  }

  previewContextItem(id: string): void {
    this.messenger?.send("preview_context_item", { id });
  }
}

export default ContinueGUIClientProtocol;
