export function streamUrl(url: string, start: number, end: number) {
  const [base, queryString] = url.split("?");
  const params = queryString.split("&");

  const idIndex = params.findIndex((p) => p.startsWith("id="));
  const idParam = params.splice(idIndex, 1)[0];

  params.push(`start=${encodeURIComponent(start)}`);
  params.push(`end=${encodeURIComponent(end)}`);

  params.push(idParam);

  return `${base}?${params.join("&")}`;
}
