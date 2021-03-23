import Events from "events";

import TerminalController from "./src/terminalContrller.js";

const componentEmitter = new Events()

const controller = new TerminalController()
await controller.initializeTable(componentEmitter)
