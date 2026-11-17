"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { contact } from "@/lib/contact";
import { heroPhotos, type Photo } from "@/lib/portfolio";
import { IconFacebook, IconInstagram, IconMail, IconPhone } from "./Icons";

const HeroScene = dynamic(() => import("./HeroScene"), { ssr: false });

gsap.registerPlugin(ScrollTrigger);

const genres = [
  { t: "Documentary", d: "Everyday life, workers and the elderly. The stories most people scroll past." },
  { t: "Landscape", d: "Rivers, chars, forests and rice fields, and the people who live between them." },
  { t: "Portrait", d: "Children and old faces in natural light. Nothing staged." },
  { t: "Street", d: "Old Dhaka, railway platforms and rituals. Chaos with a pattern." },
  { t: "Architecture", d: "Geometry, shadow and symmetry, seen with an architect's eye." },
];

const services = [
  {
    t: "Commissions",
    d: "Editorial, documentary and travel assignments across Bangladesh.",
    subject: "Commission enquiry",
  },
  {
    t: "Workshops",
    d: "Learn to read light, build a story and photograph people with confidence.",
    subject: "Workshop enquiry",
  },
  {
    t: "Collaborations",
    d: "NGOs, magazines, brands and filmmakers with a story that deserves a careful eye.",
    subject: "Collaboration enquiry",
  },
];

const stories = [
  "Jadukata River, Sunamganj",
  "Buriganga, Old Dhaka",
  "Bangladesh Railway",
  "Saint Martin's Island",
  "Painted Childhood (Holi)",
  "Sreemangal and Lawachara",
  "Agriculture and birds",
];

const statement =
  "Most people see crowds when they look at Bangladesh. I wait for the one second when a river, a road or a face says something true.";

type Props = { photos: Photo[]; source: "pexels" | "local" };

const mailTo = (subject?: string) =>
  `mailto:${contact.email}${subject ? `?subject=${encodeURIComponent(subject)}` : ""}`;

export default function Site({ photos, source }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const [filter, setFilter] = useState("All");
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const tags = useMemo(() => ["All", ...Array.from(new Set(photos.map((p) => p.tag)))], [photos]);
  const shown = useMemo(() => (filter === "All" ? photos : photos.filter((p) => p.tag === filter)), [photos, filter]);
  const closeLb = useCallback(() => setLightbox(null), []);

  /* ------------------------------------------------ page animation */
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lenis = new Lenis({ lerp: reduce ? 1 : 0.09 });
    lenisRef.current = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    // on phones the contact dock steps out of the way while you scroll down and returns when you scroll up
    const dockEl = root.current?.querySelector(".dock");
    lenis.on("scroll", (l: Lenis) => dockEl?.classList.toggle("dock--hide", l.direction === 1 && l.scroll > 240));
    const raf = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    window.scrollTo(0, 0);

    const ctx = gsap.context(() => {
      lenis.stop();
      const nav = root.current!.querySelector<HTMLElement>(".nav")!;

      // loader, then the hero text arrives while the 3D field fades in
      const tl = gsap.timeline();
      tl.to(".loader__bar", { scaleX: 1, duration: reduce ? 0.2 : 1.5, ease: "power2.inOut" })
        .to(".loader__name", { opacity: 0, duration: 0.3 })
        .add(() => {
          (window as unknown as { __introStarted?: boolean }).__introStarted = true;
          window.dispatchEvent(new Event("intro:start"));
        })
        .to(".loader", { yPercent: -100, duration: reduce ? 0.2 : 1, ease: "expo.inOut" }, "<")
        .from(".hero__line > span", { yPercent: 110, duration: 1.2, ease: "expo.out", stagger: 0.1 }, "-=0.5")
        .from(".hero__lede, .hero__cta, .hero__strip, .nav, .dock", { opacity: 0, y: 12, duration: 0.8, stagger: 0.08 }, "-=0.7")
        .add(() => lenis.start());

      // hero copy fades out as the camera starts flying through the frames
      gsap.to(".hero__content", {
        opacity: 0,
        y: -50,
        ease: "none",
        scrollTrigger: { trigger: ".hero", start: "top top", end: () => "+=" + window.innerHeight * 0.65, scrub: true },
      });
      gsap.to(".hero__hint", {
        opacity: 0,
        ease: "none",
        scrollTrigger: { trigger: ".hero", start: "top top", end: () => "+=" + window.innerHeight * 0.3, scrub: true },
      });

      // navigation switches colour with the section underneath it
      gsap.utils.toArray<HTMLElement>("[data-theme]").forEach((sec) => {
        ScrollTrigger.create({
          trigger: sec,
          start: "top 48px",
          end: "bottom 48px",
          onToggle: (self) => {
            if (self.isActive) nav.classList.toggle("is-light", sec.dataset.theme === "light");
          },
        });
      });

      // the opening statement darkens word by word as you read
      gsap.fromTo(
        ".statement .word",
        { opacity: 0.18 },
        { opacity: 1, stagger: 0.1, ease: "none", scrollTrigger: { trigger: ".statement", start: "top 70%", end: "bottom 65%", scrub: true } }
      );

      // gentle parallax on the portrait
      gsap.fromTo(
        ".about__img img",
        { yPercent: -6 },
        { yPercent: 6, ease: "none", scrollTrigger: { trigger: ".about__img", start: "top bottom", end: "bottom top", scrub: true } }
      );
    }, root);

    // in-page links: smooth scroll, no #hash in the address bar
    const onAnchor = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
      if (!a) return;
      e.preventDefault();
      setMenuOpen(false);
      lenis.start();
      const id = a.getAttribute("href")!.slice(1);
      if (!id || id === "top") {
        lenis.scrollTo(0, { duration: 1.6 });
        return;
      }
      const el = document.getElementById(id);
      // on phones the fixed nav is taller than the section's top padding, so stop a little above the section
      if (el) lenis.scrollTo(el, { duration: 1.6, offset: window.innerWidth <= 800 ? -56 : 0 });
    };
    document.addEventListener("click", onAnchor);

    return () => {
      document.removeEventListener("click", onAnchor);
      ctx.revert();
      gsap.ticker.remove(raf);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  /* portfolio images ease in as they scroll into view; refresh scroll positions after filtering */
  useEffect(() => {
    const els = root.current?.querySelectorAll<HTMLElement>(".shot") ?? [];
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        }),
      { rootMargin: "0px 0px -8% 0px" }
    );
    els.forEach((el) => io.observe(el));
    const t = window.setTimeout(() => ScrollTrigger.refresh(), 120);
    return () => {
      io.disconnect();
      window.clearTimeout(t);
    };
  }, [shown]);

  /* lightbox + mobile menu: lock scrolling, keyboard support */
  useEffect(() => {
    const locked = lightbox !== null || menuOpen;
    if (!locked) return;
    lenisRef.current?.stop();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setLightbox(null);
        setMenuOpen(false);
      }
      if (lightbox !== null && e.key === "ArrowRight") setLightbox((i) => (i === null ? i : (i + 1) % shown.length));
      if (lightbox !== null && e.key === "ArrowLeft") setLightbox((i) => (i === null ? i : (i - 1 + shown.length) % shown.length));
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      lenisRef.current?.start();
    };
  }, [lightbox, menuOpen, shown.length]);

  const current = lightbox !== null ? shown[lightbox] : null;

  return (
    <div ref={root}>
      {/* loader */}
      <div className="loader theme-dark">
        <span className="loader__name">{contact.name}</span>
        <i className="loader__bar" />
      </div>

      {/* navigation */}
      <header className="nav">
        <a href="#top" className="nav__logo">{contact.name}</a>
        <nav className="nav__links" aria-label="Primary">
          <a href="#work">Portfolio</a>
          <a href="#about">About</a>
          <a href="#services">Services</a>
          <a href="#contact">Contact</a>
        </nav>
        <div className="nav__social">
          <a href={mailTo()} aria-label="Email"><IconMail /></a>
          <a href={`tel:${contact.phone}`} aria-label="Call"><IconPhone /></a>
          <a href={contact.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram"><IconInstagram /></a>
          <a href={contact.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook"><IconFacebook /></a>
        </div>
        <button className="nav__menu" aria-expanded={menuOpen} onClick={() => setMenuOpen((v) => !v)}>
          {menuOpen ? "Close" : "Menu"}
        </button>
      </header>

      {/* mobile menu */}
      <div className={`menu theme-dark${menuOpen ? " open" : ""}`} aria-hidden={!menuOpen} data-lenis-prevent>
        <nav aria-label="Mobile">
          {[
            ["#work", "Portfolio"],
            ["#about", "About"],
            ["#services", "Services"],
            ["#contact", "Contact"],
          ].map(([href, label], i) => (
            <a key={href} href={href} tabIndex={menuOpen ? 0 : -1} style={{ ["--i" as string]: i }}>
              {label}
            </a>
          ))}
        </nav>
        <div className="menu__foot" style={{ ["--i" as string]: 4 }}>
          <a className="menu__mail" href={mailTo("Hello Sahel")} tabIndex={menuOpen ? 0 : -1}>
            <span>
              <small>Email me</small>
              <b>{contact.email}</b>
            </span>
            <IconMail size={24} />
          </a>
          <ul className="menu__tiles">
            <li className="wide">
              <a href={`tel:${contact.phone}`} tabIndex={menuOpen ? 0 : -1}>
                <IconPhone />
                <small>Call</small>
                <b>{contact.phoneLabel}</b>
              </a>
            </li>
            <li>
              <a href={contact.instagram} target="_blank" rel="noopener noreferrer" tabIndex={menuOpen ? 0 : -1}>
                <IconInstagram />
                <small>Instagram</small>
                <b>{contact.instagramHandle}</b>
              </a>
            </li>
            <li>
              <a href={contact.facebook} target="_blank" rel="noopener noreferrer" tabIndex={menuOpen ? 0 : -1}>
                <IconFacebook />
                <small>Facebook</small>
                <b>Open profile</b>
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* floating contact dock */}
      <aside className="dock" aria-label="Contact">
        <a href={mailTo()} aria-label="Email Juber"><IconMail /></a>
        <a href={`tel:${contact.phone}`} aria-label="Call Juber"><IconPhone /></a>
        <a href={contact.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram"><IconInstagram /></a>
        <a href={contact.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook"><IconFacebook /></a>
      </aside>

      <main id="top">
        {/* ============================ Hero ============================ */}
        <section className="hero theme-dark" data-theme="dark">
          <div className="hero__stick">
            <HeroScene items={heroPhotos} />
            <div className="hero__shade" />
            <div className="hero__content">
              <h1 className="hero__title">
                <span className="hero__line"><span>Blink, and</span></span>
                <span className="hero__line"><span>you missed it.</span></span>
                <span className="hero__line"><span>I didn&rsquo;t.</span></span>
              </h1>
              <p className="hero__lede">
                I&rsquo;m Juber Ahmed Sahel, a documentary and landscape photographer from Bangladesh. I photograph rivers, rice
                fields, hill villages and the people who live in them.
              </p>
              <div className="hero__cta">
                <a className="btn btn--gold" href="#work">View portfolio</a>
                <a className="btn" href={mailTo("Hello Sahel")}>Email me</a>
              </div>
            </div>
            <div className="hero__strip">
              <a href={mailTo()}><IconMail size={16} />{contact.email}</a>
              <a href={`tel:${contact.phone}`}><IconPhone size={16} />{contact.phoneLabel}</a>
              <a href={contact.instagram} target="_blank" rel="noopener noreferrer"><IconInstagram size={16} />Instagram</a>
              <a href={contact.facebook} target="_blank" rel="noopener noreferrer"><IconFacebook size={16} />Facebook</a>
            </div>
            <p className="hero__hint">Scroll to fly through the frames</p>
          </div>
        </section>

        {/* ============================ Statement ============================ */}
        <section className="statement theme-light" data-theme="light">
          <p className="statement__text">
            {statement.split(" ").map((w, i) => (
              <span className="word" key={i}>{w} </span>
            ))}
          </p>
        </section>

        {/* ============================ Portfolio ============================ */}
        <section className="work theme-light" id="work" data-theme="light">
          <div className="wrap">
            <header className="work__head">
              <h2 className="h2">Selected work</h2>
              <p className="lede">
                {photos.length} photographs from the river banks, hill villages and rice fields of Bangladesh.
                {source === "pexels" && (
                  <span className="live"> Loaded live from the Pexels API.</span>
                )}
              </p>
            </header>

            <div className="filters" role="group" aria-label="Filter photographs">
              {tags.map((t) => (
                <button key={t} className={t === filter ? "on" : ""} aria-pressed={t === filter} onClick={() => setFilter(t)}>
                  {t}
                </button>
              ))}
            </div>

            <div className="grid">
              {shown.map((p, i) => (
                <figure className="shot" key={p.id}>
                  <button className="shot__btn" onClick={() => setLightbox(i)} aria-label={`Open ${p.title}`} style={{ background: p.color }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.grid} alt={p.alt} width={p.w} height={p.h} loading="lazy" decoding="async" />
                  </button>
                  <figcaption>
                    <b>{p.title}</b>
                    <span>{p.tag}</span>
                  </figcaption>
                </figure>
              ))}
            </div>

            <p className="credit">
              All photographs by {contact.name}, also on{" "}
              <a href={contact.pexels} target="_blank" rel="noopener noreferrer">Pexels</a>.
            </p>
          </div>
        </section>

        {/* ============================ About ============================ */}
        <section className="about theme-dark" id="about" data-theme="dark">
          <div className="wrap about__grid">
            <div className="about__img">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/photos/portrait.jpg" alt="Portrait of photographer Juber Ahmed Sahel" loading="lazy" decoding="async" />
            </div>
            <div className="about__body">
              <h2 className="h2">Hi, I&rsquo;m Sahel.</h2>
              <p className="body">
                I&rsquo;m a photographer, traveller and visual storyteller based in Bangladesh. My background in architecture
                taught me to see geometry and light; documentary work taught me patience.
              </p>
              <p className="body">
                In 2018 I bought a portrait lens, and it changed how I photograph people, especially children. Since then I
                have followed rivers, railways and forests, looking for ordinary moments that carry a whole story.
              </p>
              <dl className="facts">
                <div><dt>Based in</dt><dd>Bangladesh</dd></div>
                <div><dt>Photographs</dt><dd>Documentary, landscape, portrait, street and architecture</dd></div>
                <div>
                  <dt>Stories so far</dt>
                  <dd>
                    <ul>{stories.map((s) => <li key={s}>{s}</li>)}</ul>
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </section>

        {/* ============================ What I photograph + services ============================ */}
        <section className="craft theme-light" id="services" data-theme="light">
          <div className="wrap">
            <h2 className="h2">What I photograph</h2>
            <ul className="genres">
              {genres.map((g) => (
                <li key={g.t}>
                  <h3>{g.t}</h3>
                  <p>{g.d}</p>
                </li>
              ))}
            </ul>

            <h2 className="h2 h2--sub">Work with me</h2>
            <div className="services">
              {services.map((s) => (
                <article key={s.t}>
                  <h3>{s.t}</h3>
                  <p>{s.d}</p>
                  <a href={mailTo(s.subject)}>Ask about {s.t.toLowerCase()}</a>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ============================ Contact ============================ */}
        <section className="contact theme-dark" id="contact" data-theme="dark">
          <div className="wrap">
            <h2 className="contact__title">Have a story worth photographing?</h2>
            <a className="contact__mail" href={mailTo()}>{contact.email}</a>

            <ul className="contact__list">
              <li>
                <span>Phone</span>
                <a href={`tel:${contact.phone}`}>{contact.phoneLabel}</a>
              </li>
              <li>
                <span>Instagram</span>
                <a href={contact.instagram} target="_blank" rel="noopener noreferrer">{contact.instagramHandle}</a>
              </li>
              <li>
                <span>Facebook</span>
                <a href={contact.facebook} target="_blank" rel="noopener noreferrer">Juber Ahmed Sahel</a>
              </li>
              <li>
                <span>Pexels</span>
                <a href={contact.pexels} target="_blank" rel="noopener noreferrer">@jubersahel</a>
              </li>
            </ul>

            <footer className="footer">
              <span>&copy; {new Date().getFullYear()} {contact.name}</span>
              <a href="#top">Back to top</a>
            </footer>
          </div>
        </section>
      </main>

      {/* lightbox */}
      {current && (
        <div className="lb" role="dialog" aria-modal="true" aria-label={current.title} onClick={closeLb} data-lenis-prevent>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={current.full} alt={current.alt} onClick={(e) => e.stopPropagation()} />
          <div className="lb__cap" onClick={(e) => e.stopPropagation()}>
            <b>{current.title}</b>
            <span>{current.tag}</span>
          </div>
          <button className="lb__x" aria-label="Close" onClick={closeLb}>Close</button>
          <button className="lb__nav lb__nav--prev" aria-label="Previous photograph" onClick={(e) => { e.stopPropagation(); setLightbox((lightbox! - 1 + shown.length) % shown.length); }}>Previous</button>
          <button className="lb__nav lb__nav--next" aria-label="Next photograph" onClick={(e) => { e.stopPropagation(); setLightbox((lightbox! + 1) % shown.length); }}>Next</button>
        </div>
      )}
    </div>
  );
}
