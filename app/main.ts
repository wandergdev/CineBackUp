require("dotenv").config();

import { log } from "@/libraries/Log";
import { setupServer } from "@/server";
import EventService from "@/services/EventService";
import JanitorService from "@/services/JanitorService";

process.env.TZ = "UTC"; // IMPORTANT For correct timezone management with DB, Tasks etc.

async function main(): Promise<void> {
  try {
    //await setupDB(); //Commented for compatibility with manual migrations
    JanitorService.init();
    EventService.init();
    setupServer();
  } catch (err) {
    log.error(err);
  }
}

main();
