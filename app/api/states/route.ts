import { State } from "country-state-city";

export function GET(request: Request) {
  const country = (new URL(request.url).searchParams.get("country") ?? "").trim().toUpperCase();

  if (!/^[A-Z]{2}$/.test(country)) {
    return Response.json({ states: [] }, { status: 400 });
  }

  const states = State.getStatesOfCountry(country).map((state) => ({
    name: state.name,
    code: state.isoCode,
  }));

  return Response.json(
    { states },
    { headers: { "Cache-Control": "public, max-age=86400, s-maxage=86400" } },
  );
}
