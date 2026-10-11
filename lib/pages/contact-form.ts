/**
 * The contact page's enquiry form, in the browser. Enquiries go to the office
 * inbox through FormSubmit (https://formsubmit.co), as before: no server or
 * key needed; the first submission sends a one-time activation email to the
 * office address. WhatsApp is offered alongside, with the details filled in.
 *
 * /contact?service=Interiors picks the project type (a waterproofing service
 * such as "Terrace waterproofing" picks Waterproofing and starts the message
 * with it); /contact?project=Name starts the message with that project.
 */
export function mountContactForm(root: HTMLElement): () => void {
  const form = root.querySelector<HTMLFormElement>("form[data-enquiry]");
  const done = root.querySelector<HTMLElement>(".ct-done");
  if (!form || !done) return () => {};
  const send = form.querySelector<HTMLButtonElement>("[data-send]");
  const label = form.querySelector<HTMLElement>("[data-label]");
  const alert = form.querySelector<HTMLElement>(".ct-alert");
  const wa = form.querySelector<HTMLButtonElement>("[data-wa]");
  const again = done.querySelector<HTMLButtonElement>("[data-again]");
  // the kind of project: a row of radio buttons (or, in older markup, a select)
  const type = form.elements.namedItem("type") as RadioNodeList | HTMLSelectElement | null;
  const message = form.elements.namedItem("message") as HTMLTextAreaElement | null;
  const typeValues = !type ? [] : type instanceof HTMLSelectElement ? Array.from(type.options, (o) => o.value) : Array.from(type, (r) => (r as HTMLInputElement).value);

  const q = new URLSearchParams(window.location.search);
  const service = q.get("service");
  if (service && type) {
    if (typeValues.includes(service)) type.value = service;
    else if (/waterproof|leak|crack|damp/i.test(service) && typeValues[0]) {
      // one of the eight waterproofing services: choose waterproofing and name the service in the message
      type.value = typeValues[0];
      if (message && !message.value) message.value = `About ${service.toLowerCase()}: `;
    }
  }
  const project = q.get("project");
  if (project && message && !message.value) message.value = `About a project like ${project}: `;

  const val = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
  /** the fields the form has, by their names in the message (a field left empty, or not on the form, is left out) */
  const FIELDS = [
    ["Name", "name"],
    ["Phone", "phone"],
    ["Email", "email"],
    ["Site location", "location"],
    ["Project type", "type"],
    ["Budget", "budget"],
  ] as const;
  const filled = (f: FormData) => FIELDS.filter(([, k]) => val(f, k)).map(([label, k]) => [label, val(f, k)] as const);
  const summary = (f: FormData) =>
    [`Project enquiry — ${val(f, "type")}`, ...filled(f).filter(([l]) => l !== "Project type").map(([l, v]) => `${l}: ${v}`), "", val(f, "message")]
      .join("\n")
      .trim();

  const busy = (on: boolean) => {
    if (send) send.disabled = on;
    if (label) label.textContent = on ? "Sending…" : "Send enquiry";
  };

  const onSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    const f = new FormData(form);
    if (val(f, "_honey")) return; // a bot filled the hidden field
    if (alert) alert.hidden = true;
    busy(true);
    try {
      const res = await fetch(form.dataset.endpoint!, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          _subject: `New project enquiry — ${val(f, "type")} (${val(f, "location")})`,
          _template: "table",
          _captcha: "false",
          ...(val(f, "email") ? { _replyto: val(f, "email") } : {}),
          ...Object.fromEntries(filled(f)),
          Message: val(f, "message"),
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { success?: string | boolean };
      if (!res.ok || String(data.success) === "false") throw new Error("send failed");
      const first = val(f, "name").split(/\s+/)[0] ?? "";
      const name = done.querySelector<HTMLElement>("[data-name]");
      if (name) name.textContent = first ? `, ${first}` : "";
      form.reset();
      form.hidden = true;
      done.hidden = false;
      done.focus();
    } catch {
      if (alert) alert.hidden = false;
    } finally {
      busy(false);
    }
  };

  const onWhatsApp = () => {
    const text = summary(new FormData(form));
    window.open(`${form.dataset.whatsapp}?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  };
  const onAgain = () => {
    done.hidden = true;
    form.hidden = false;
    form.querySelector<HTMLElement>("input[name=name]")?.focus();
  };

  form.addEventListener("submit", onSubmit);
  wa?.addEventListener("click", onWhatsApp);
  again?.addEventListener("click", onAgain);
  return () => {
    form.removeEventListener("submit", onSubmit);
    wa?.removeEventListener("click", onWhatsApp);
    again?.removeEventListener("click", onAgain);
  };
}
