/**
 * eSewa v2 requires a signed form POST (not a redirect URL) to initiate payment.
 * Builds a hidden form from the params the backend returns and submits it.
 */
export function submitEsewaForm(url: string, params: Record<string, string>) {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = url;

  for (const [key, value] of Object.entries(params)) {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = key;
    input.value = value;
    form.appendChild(input);
  }

  document.body.appendChild(form);
  form.submit();
}
