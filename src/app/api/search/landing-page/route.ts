import { fail, ok } from "@/server/api/response";
import { enforceSearchRateLimit } from "@/server/search/rate-limit";
import { getLandingPageSearch, getSearchParamsFromRequest } from "@/server/search/service";
import { landingPageQuerySchema } from "@/server/search/validators";

export async function GET(request: Request) {
  try {
    await enforceSearchRateLimit(request, "landing-page");
    const query = landingPageQuerySchema.parse(getSearchParamsFromRequest(request));
    const data = await getLandingPageSearch(query);

    return ok(data);
  } catch (error) {
    return fail(error);
  }
}
