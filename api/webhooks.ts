// api/webhooks.ts

import { VercelRequest, VercelResponse } from "@vercel/node";
import { Probot } from "probot";
import myApp from "../lib/index.js";   // or wherever your tsc puts it

// initialize Probot with your env vars
const probot = new Probot({
  appId:             parseInt(process.env.APP_ID!, 10),
  privateKey:        (process.env.PRIVATE_KEY! as string).replace(/\\n/g, "\n"),
  secret:            process.env.WEBHOOK_SECRET,
  githubToken:       process.env.GITHUB_TOKEN
});

// load your handlers
probot.load(myApp);

// the Vercel function handler
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    // show a friendly ping
    res.status(200).send("GitHub App running 👍");
    return;
  }

  // forward the GitHub webhook into Probot
  await (probot as any).receive({
    id:   req.headers["x-github-delivery"]    as string,
    name:   req.headers["x-github-event"]    as string,
    payload: req.body,
  });

  res.status(200).send("OK");
}
