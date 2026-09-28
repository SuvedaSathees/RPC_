import type { Metadata } from "next";
import { ArrowUpRight, Briefcase, Clock, Mail, MapPin, MessageCircle, Phone, Truck, Users } from "lucide-react";
import { ContactForm } from "@/components/contact/ContactForm";
import { ContactFAQ } from "@/components/contact/ContactFAQ";
import { Footer } from "@/components/contact/Footer";
import { contact, departments, faqs } from "@/lib/content";

export const metadata: Metadata = {
  title: "Contact — Construction Enquiries in Erode, Tamil Nadu",
  description:
    "Contact RPC Constructions, 142 Perundurai Road, Erode. Call +91 94428 95907 or email contact@rpcconstructions.com to discuss your project, waterproofing or leakage problem.",
  alternates: { canonical: "/contact" },
  openGraph: { url: "/contact" },
};

const tel = `tel:${contact.phone.replace(/[^0-9+]/g, "")}`;
const mapLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contact.mapQuery)}`;

const faqLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })),
};

export default function ContactPage() {
  const channels = [
    { icon: Phone, label: "Call", value: contact.phone, href: tel },
    { icon: MessageCircle, label: "WhatsApp", value: "Chat with us", href: contact.whatsapp },
    { icon: Mail, label: "Email", value: contact.email, href: `mailto:${contact.email}` },
    { icon: MapPin, label: "Visit", value: "Perundurai Road, Erode", href: mapLink },
  ];

  return (
    <>
      <main id="main" className="bg-paper">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />

        {/* one screen: introduction + ways to reach us on the left, the enquiry form on the right */}
        <section aria-label="Contact RPC Constructions" className="gutter pb-12 pt-24 md:pb-16 md:pt-32 lg:min-h-[100svh]">
          <div className="grid gap-6 md:gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="flex flex-col lg:col-span-5">
              <p className="eyebrow flex items-center gap-3 text-mute">
                <span className="h-px w-8 bg-current" /> Contact
              </p>
              <h1 className="display mt-3 text-[2.6rem] leading-[0.95] md:mt-4 md:text-6xl">
                Start a <em>project.</em>
              </h1>
              <p className="mt-3 max-w-md text-[14px] leading-relaxed text-ink-2 md:mt-4 md:text-[15px]">
                Have a plot, approved drawings or just an idea? Send a few details and an engineer will call you back within one working day.
              </p>

              <ul className="mt-5 grid grid-cols-4 gap-2 sm:grid-cols-2 md:mt-7">
                {channels.map(({ icon: Icon, label, value, href }) => (
                  <li key={label}>
                    <a
                      href={href}
                      target={href.startsWith("http") ? "_blank" : undefined}
                      rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                      className="group flex flex-col items-center gap-1.5 rounded-2xl border border-ink/10 bg-paper-2 px-1 py-2.5 transition-colors sm:flex-row sm:gap-3 sm:rounded-full sm:py-1.5 sm:pl-1.5 sm:pr-4 duration-300 hover:border-ink hover:bg-ink hover:text-paper"
                    >
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ink text-paper transition-colors duration-300 group-hover:bg-rpc">
                        <Icon size={15} strokeWidth={1.7} />
                      </span>
                      <span className="min-w-0 text-center leading-tight sm:text-left">
                        <span className="block text-[10px] uppercase tracking-[0.12em] opacity-70 sm:tracking-[0.18em] sm:opacity-55">{label}</span>
                        <span className="hidden truncate text-[13px] font-medium sm:block">{value}</span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>

              {/* office */}
              <div className="mt-6 hidden overflow-hidden rounded-2xl border border-ink/10 md:block">
                <iframe
                  title="RPC Constructions office location on Google Maps"
                  src={`https://www.google.com/maps?q=${encodeURIComponent(contact.mapQuery)}&output=embed`}
                  className="h-44 w-full border-0 grayscale-[35%]"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
                <div className="flex flex-wrap items-start justify-between gap-4 p-5">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.18em] text-mute">Head office</p>
                    <address className="mt-1 text-sm font-medium not-italic leading-snug">{contact.address}</address>
                    <p className="mt-2 flex items-center gap-2 text-xs text-ink-2">
                      <Clock size={13} className="text-mute" /> {contact.hours}
                    </p>
                  </div>
                  <a href={mapLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-full bg-ink px-3.5 py-2 text-xs font-medium text-paper hover:bg-rpc">
                    Directions <ArrowUpRight size={13} />
                  </a>
                </div>
              </div>

              <div className="mt-5 hidden flex-wrap items-center gap-2 md:flex">
                <span className="mr-1 text-[10px] uppercase tracking-[0.18em] text-mute">We build in</span>
                {contact.regions.map((r) => (
                  <span key={r} className="rounded-full border border-ink/15 px-3 py-1 text-xs">{r}</span>
                ))}
              </div>
            </div>

            <section id="enquiry" aria-label="Project enquiry form" className="scroll-mt-28 rounded-2xl border border-ink/10 bg-white/50 p-5 md:p-8 lg:col-span-7">
              <div className="mb-6 flex items-end justify-between gap-4">
                <div>
                  <h2 className="display text-2xl md:text-4xl">Tell us about your project.</h2>
                  <p className="mt-1.5 text-sm text-ink-2">Takes under a minute. Fields marked * are required.</p>
                </div>
              </div>
              <ContactForm />
            </section>

            {/* phones: location after the form */}
            <div className="overflow-hidden rounded-2xl border border-ink/10 md:hidden">
              <iframe
                title="RPC Constructions office location on Google Maps"
                src={`https://www.google.com/maps?q=${encodeURIComponent(contact.mapQuery)}&output=embed`}
                className="h-44 w-full border-0 grayscale-[35%]"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <div className="flex items-start justify-between gap-3 p-4">
                <div>
                  <address className="text-[13px] font-medium not-italic leading-snug">{contact.address}</address>
                  <p className="mt-1.5 flex items-center gap-1.5 text-[11.5px] text-ink-2">
                    <Clock size={12} className="text-mute" /> {contact.hours}
                  </p>
                </div>
                <a href={mapLink} target="_blank" rel="noopener noreferrer" className="inline-flex shrink-0 items-center gap-1 rounded-full bg-ink px-3 py-1.5 text-[12px] font-medium text-paper">
                  Directions <ArrowUpRight size={12} />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* the right team */}
        <section aria-label="Departments" className="gutter hidden border-t border-ink/10 py-14 md:block md:py-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="display text-3xl md:text-4xl">Talk to the <em>right team.</em></h2>
            <p className="text-sm text-ink-2">Direct lines for tenders, suppliers and careers.</p>
          </div>
          <ul className="mt-8 grid gap-3 md:grid-cols-3">
            {departments.map((d, i) => {
              const Icon = [Briefcase, Truck, Users][i] ?? Briefcase;
              return (
                <li key={d.name}>
                  <a
                    href={`mailto:${d.email}`}
                    className="group flex items-center gap-4 rounded-2xl border border-ink/10 p-4 transition-colors duration-300 hover:border-ink hover:bg-ink hover:text-paper"
                  >
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-paper-2 text-ink transition-colors group-hover:bg-rpc group-hover:text-white">
                      <Icon size={18} strokeWidth={1.6} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[15px] font-medium">{d.name}</span>
                      <span className="block truncate text-[13px] opacity-60">{d.email}</span>
                    </span>
                    <ArrowUpRight size={16} className="shrink-0 opacity-40 transition-all group-hover:rotate-45 group-hover:opacity-100" />
                  </a>
                </li>
              );
            })}
          </ul>
        </section>

        {/* questions */}
        <section aria-label="Frequently asked questions" className="gutter hidden gap-8 border-t border-ink/10 py-14 md:grid md:py-16 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-4">
            <h2 className="display text-3xl md:text-4xl">Questions, <em>answered.</em></h2>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink-2">Anything else? Message us on WhatsApp and an engineer will reply.</p>
            <a href={contact.whatsapp} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center gap-2 rounded-full border border-ink/15 px-4 py-2 text-sm font-medium transition-colors hover:border-[#25D366] hover:bg-[#25D366] hover:text-white">
              <MessageCircle size={15} /> Ask on WhatsApp
            </a>
          </div>
          <div className="lg:col-span-8">
            <ContactFAQ />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
