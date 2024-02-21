//index-local.js
"use strict";

import { imageResize } from "./index.js";
import eventJson from "./OriginResponseEvent.json" assert { type: "json" }; //json을 가져오려면 assert를 붙여주어야한다.
import fs from "fs";

export const imageResizeToFile = async (event, context) => {
  event = eventJson;

  const response = await imageResize(event, context);

  const buf = Buffer.from(response.body, "base64");
  fs.writeFile(`output.webp`, buf, function (err) { // Remove the unused 'result' parameter
    if (err) {
      console.log("error", err);
    }
  });
};
