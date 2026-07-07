import { serve } from "inngest/edge";

import { inngest } from "@/inngest/client";
import { functions } from "@/inngest/functions";

// Expo Router API routes use the Web Request/Response API, so we use Inngest's
// edge serve handler (a `(Request) => Promise<Response>` function) and expose
// the methods the dev server / Inngest use to sync and invoke functions.
const handler = serve({ client: inngest, functions });

export function GET(request: Request) {
  return handler(request);
}

export function POST(request: Request) {
  return handler(request);
}

export function PUT(request: Request) {
  return handler(request);
}
