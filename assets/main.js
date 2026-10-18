(function () {
  var lang = document.documentElement.lang === "en" ? "en" : "da";
  var EMAIL = "is@implement-ai.dk";
  // Indsæt dit bookinglink her (fx Microsoft Bookings). Tomt = knappen vises ikke.
  var BOOKING_URL = "";
  if (BOOKING_URL) {
    document.querySelectorAll("[data-book]").forEach(function (a) {
      a.href = BOOKING_URL; a.target = "_blank"; a.rel = "noopener"; a.classList.add("on");
    });
  }

  // Mobilmenu
  var btn = document.querySelector(".menu-btn");
  var nav = document.getElementById("mobile-nav");
  if (btn && nav) {
    btn.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        nav.classList.remove("open");
        btn.setAttribute("aria-expanded", "false");
      });
    });
  }

  // Kontaktformular: åbner en færdigskrevet mail. Ingen data sendes via siden.
  var form = document.getElementById("contact-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var d = new FormData(form);
      var subject = (lang === "en" ? "Enquiry: " : "Henvendelse: ") + (d.get("topic") || "");
      var body =
        (lang === "en" ? "Name: " : "Navn: ") + (d.get("name") || "") + "\n" +
        (lang === "en" ? "Company: " : "Virksomhed: ") + (d.get("company") || "") + "\n" +
        (lang === "en" ? "Phone: " : "Telefon: ") + (d.get("phone") || "") + "\n\n" +
        (d.get("message") || "");
      window.location.href = "mailto:" + EMAIL + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
      // Kvittering med reserve: åbner mailprogrammet ikke (fx ved webmail), kan beskeden kopieres
      var en = lang === "en";
      var full = (en ? "To: " : "Til: ") + EMAIL + "\n" + (en ? "Subject: " : "Emne: ") + subject + "\n\n" + body;
      var done = document.getElementById("form-done");
      if (!done) {
        done = document.createElement("div"); done.id = "form-done"; done.className = "form-done"; done.setAttribute("role", "status");
        form.appendChild(done);
      }
      done.innerHTML =
        "<p>" + (en ? "Your email program should now open with the message ready. Press send there." : "Nu skulle dit mailprogram åbne med beskeden klar. Tryk send derinde.") + "</p>" +
        "<p><strong>" + (en ? "Nothing happened?" : "Skete der ikke noget?") + "</strong> " +
        (en ? "Copy the message and send it from your own email to " : "Kopiér beskeden, og send den fra din egen mail til ") +
        "<a href=\"mailto:" + EMAIL + "\">" + EMAIL + "</a>.</p>" +
        "<button type=\"button\" class=\"btn btn-small copy-msg\">" + (en ? "Copy the message" : "Kopiér beskeden") + "</button> <span class=\"copy-status\" aria-live=\"polite\"></span>";
      var status = done.querySelector(".copy-status");
      done.querySelector(".copy-msg").addEventListener("click", function () {
        var ok = function () { status.textContent = en ? "Copied. Paste it into a new email." : "Kopieret. Indsæt den i en ny mail."; };
        var fallback = function () {
          var ta = document.createElement("textarea"); ta.value = full; ta.setAttribute("readonly", ""); ta.style.position = "absolute"; ta.style.left = "-9999px";
          document.body.appendChild(ta); ta.select();
          try { document.execCommand("copy"); ok(); } catch (err) { status.textContent = en ? "Copying failed. Select the text in the form and copy it yourself." : "Kopieringen mislykkedes. Markér teksten i formularen, og kopiér den selv."; }
          document.body.removeChild(ta);
        };
        if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(full).then(ok, fallback); else fallback();
      });
    });
    // Fejlbeskeder i egen stemme i stedet for browserens standardtekst
    var msgs = lang === "en"
      ? { name: "Add your name, so we know who to reply to.", message: "Write a line or two about what it concerns." }
      : { name: "Skriv dit navn, så vi ved, hvem vi svarer.", message: "Skriv en linje eller to om, hvad det handler om." };
    ["name", "message"].forEach(function (n) {
      var f = form.elements[n]; if (!f) return;
      f.addEventListener("invalid", function () { f.setCustomValidity(f.value.trim() ? "" : msgs[n]); });
      f.addEventListener("input", function () { f.setCustomValidity(""); });
    });
  }

  // Knapper med data-topic vælger emnet i kontaktformularen
  document.querySelectorAll("[data-topic]").forEach(function (a) {
    a.addEventListener("click", function () {
      var sel = document.querySelector('#contact-form select[name="topic"]');
      if (sel) sel.value = a.getAttribute("data-topic");
    });
  });

  // Diagram: søjlerne tegnes, når diagrammet kommer i syne
  var stall = document.querySelector(".stall");
  if (stall && "IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    stall.classList.add("pre");
    var so = new IntersectionObserver(function (es) {
      if (es[0].isIntersecting) { stall.classList.add("play"); so.disconnect(); }
    }, { threshold: 0.25 });
    so.observe(stall);
  }
  // Forløb: sporet tegnes trin for trin første gang, listen kommer i syne. Teksten står fast.
  var track = document.querySelector(".steps.track");
  if (track && "IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    track.classList.add("pre");
    var to = new IntersectionObserver(function (es) {
      if (es[0].isIntersecting) { track.classList.replace("pre", "play"); to.disconnect(); }
    }, { threshold: 0.3 });
    to.observe(track);
  }
  document.querySelectorAll('a[href^="#kilde-"]').forEach(function (a) {
    a.addEventListener("click", function () { var d = document.querySelector("details.sources"); if (d) d.open = true; });
  });

  // Mobil: fast bookingknap, når hero er scrollet væk og kontaktsektionen ikke er synlig
  var hcta = document.querySelector(".header-cta");
  var hero = document.querySelector(".hero");
  if (hcta && hero && "IntersectionObserver" in window) {
    var prev = document.querySelector(".m-cta"); if (prev) prev.remove();
    var m = document.createElement("a");
    m.className = "btn btn-primary m-cta"; m.href = hcta.getAttribute("href"); m.textContent = hcta.textContent;
    document.body.appendChild(m);
    var heroOut = false, contactIn = false;
    var sync = function () { m.classList.toggle("show", heroOut && !contactIn); m.tabIndex = heroOut && !contactIn ? 0 : -1; };
    new IntersectionObserver(function (e) { heroOut = !e[0].isIntersecting; sync(); }).observe(hero);
    // Skjul knappen, mens kontaktsektionen eller footeren er synlig
    var ends = document.querySelectorAll(".contact, .site-footer"), seen = new Set();
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) seen.add(e.target); else seen.delete(e.target); });
      contactIn = seen.size > 0; sync();
    });
    ends.forEach(function (el) { io.observe(el); });
    sync();
  }

  // Hero-faner: skift eksempel på workflow
  var flows = {
    da: {
      mail:    [["En kunde skriver til jer","Mailen lander i den fælles indbakke."],["Agenten læser og sorterer","Den finder kunden og ordren i jeres system."],["Et svarudkast er klar","Skrevet i jeres tone, med de rigtige oplysninger."],["Du godkender og sender","Et menneske har altid sidste ord."]],
      quote:   [["En forespørgsel kommer ind","Fra mail, hjemmeside eller telefonnotat."],["Agenten finder pris og lignende sager","Ud fra jeres prisliste og tidligere tilbud."],["Et tilbudsudkast er klar","Med de rigtige poster og jeres betingelser."],["Du retter, godkender og sender","Prisen er altid dit ansvar."]],
      invoice: [["En faktura lander i indbakken","Fra en leverandør, som PDF eller billede."],["Agenten aflæser beløb, dato og leverandør","Og matcher mod ordren, hvis der er en."],["Posteringen er forberedt","Klar i økonomisystemet med det rigtige bilag."],["Bogholderen godkender","Afvigelser sendes til en person."]],
      meeting: [["Mødet slutter i Teams","Optagelse og transskription er klar."],["Agenten skriver referat","Og finder beslutninger og aftaler."],["Opgaver og opfølgningsmail er klar","Med ansvarlig og frist på hver opgave."],["Du tjekker og sender","Intet sendes, før du har set det."]]
    },
    en: {
      mail:    [["A customer emails you","The email lands in the shared inbox."],["The agent reads and sorts it","It finds the customer and the order in your system."],["A draft reply is ready","Written in your tone, with the right details."],["You approve and send","A person always has the final say."]],
      quote:   [["An enquiry comes in","From email, website or a phone note."],["The agent finds prices and similar jobs","From your price list and previous quotes."],["A draft quote is ready","With the right items and your terms."],["You edit, approve and send","The price is always your responsibility."]],
      invoice: [["An invoice lands in the inbox","From a supplier, as PDF or image."],["The agent reads amount, date and supplier","And matches it to the order, if there is one."],["The entry is prepared","Ready in the accounting system with the right attachment."],["The bookkeeper approves","Exceptions go to a person."]],
      meeting: [["The meeting ends in Teams","Recording and transcript are ready."],["The agent writes the minutes","And finds decisions and agreements."],["Tasks and follow-up email are ready","With an owner and deadline on each task."],["You check and send","Nothing goes out before you have seen it."]]
    }
  }[lang];
  var flowOl = document.getElementById("flow-steps");
  if (flowOl) {
    document.querySelectorAll(".flow-tabs button").forEach(function (b) {
      b.addEventListener("click", function () {
        var steps = flows[b.getAttribute("data-flow")];
        document.querySelectorAll(".flow-tabs button").forEach(function (x) { x.setAttribute("aria-selected", x === b ? "true" : "false"); });
        flowOl.classList.remove("swap"); void flowOl.offsetWidth;
        flowOl.innerHTML = steps.map(function (s, i) {
          return "<li" + (i === 3 ? ' class="human"' : "") + "><strong></strong><span></span></li>";
        }).join("");
        flowOl.querySelectorAll("li").forEach(function (li, i) { li.querySelector("strong").textContent = steps[i][0]; li.querySelector("span").textContent = steps[i][1]; });
        flowOl.classList.add("swap");
        flowOl.classList.add("run");
      });
    });
    // Eksemplerne skifter af sig selv, indtil nogen rører panelet, og kun mens det er i syne
    var fig = flowOl.closest(".flow");
    if (fig && "IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      var order = Array.prototype.slice.call(document.querySelectorAll(".flow-tabs button")), timer = null, stopped = false;
      var next = function () {
        if (document.hidden) return;
        var i = order.findIndex(function (b) { return b.getAttribute("aria-selected") === "true"; });
        order[(i + 1) % order.length].click();
      };
      var stop = function () { stopped = true; if (timer) { clearInterval(timer); timer = null; } };
      ["pointerdown", "keydown", "focusin"].forEach(function (ev) { fig.addEventListener(ev, stop); });
      new IntersectionObserver(function (es) {
        if (stopped) return;
        if (es[0].isIntersecting) { if (!timer) timer = setInterval(next, 6000); }
        else if (timer) { clearInterval(timer); timer = null; }
      }, { threshold: .6 }).observe(fig);
    }
    // Tastatur: piletaster flytter mellem fanerne
    var tabs = Array.prototype.slice.call(document.querySelectorAll(".flow-tabs button"));
    tabs.forEach(function (b, i) {
      b.addEventListener("click", function () { tabs.forEach(function (x) { x.tabIndex = x === b ? 0 : -1; }); });
      b.addEventListener("keydown", function (e) {
        var j = e.key === "ArrowRight" ? i + 1 : e.key === "ArrowLeft" ? i - 1 : e.key === "Home" ? 0 : e.key === "End" ? tabs.length - 1 : null;
        if (j === null) return;
        e.preventDefault();
        var t = tabs[(j + tabs.length) % tabs.length]; t.focus(); t.click();
      });
    });
    flowOl.classList.add("run");
  }

  // Guide: hvad passer til jer
  var guide = document.getElementById("guide-form");
  if (guide) {
    var G = lang === "en" ? {
      start: ["AI clarity session","A 90-minute session where we find the two or three tasks that save the most time and choose the tool. You get a written plan.","2,200 DKK excl. VAT","/en/#services"],
      lead:  ["AI decision meeting for leadership","Half a day where owners and leadership choose the first two AI tasks, with owner, goal, budget and timeline.","from 23,750 DKK excl. VAT","/en/decision-meeting/"],
      task_ms: ["AI agent or workflow setup","We build it in Copilot Studio or Power Automate, so it uses the permissions you already have in Microsoft 365. Live in 2 to 4 weeks.","from 14,250 DKK excl. VAT","/en/ai-agents/"],
      task_no: ["AI agent or workflow setup","We build it in n8n or Make with ChatGPT or Claude, so it works with Google Workspace and other systems. Live in 2 to 4 weeks.","from 14,250 DKK excl. VAT","/en/ai-agents/"],
      secure_ms: ["Secure Copilot setup","We review access and sharing in SharePoint and Teams, write your AI policy and switch Copilot on for the first group.","from 23,750 DKK excl. VAT","/en/copilot/"],
      secure_no: ["Secure AI setup","We set up ChatGPT Business, Claude Team or Gemini with access, data rules and an AI policy in place.","from 23,750 DKK excl. VAT","/en/copilot/"],
      grant: "With at least 2 full-time equivalents, the analysis and plan can be an SMV:Digital programme with a 50 % grant.",
      solo: "As a sole trader or private individual, you always get the price incl. VAT in the offer.",
      mid: "With 10 or more staff, a decision meeting for leadership is often the best first step, so the direction is decided before anything is built."
    } : {
      start: ["AI-afklaring","90 minutter, hvor vi finder de to eller tre opgaver, der sparer mest tid, og vælger værktøj. Du får en skriftlig plan.","2.200 kr. ekskl. moms","/#ydelser"],
      lead:  ["AI-beslutningsmøde for ledelsen","En halv dag, hvor ejere og ledelse vælger de første to AI-opgaver, med ejer, mål, budget og tidsplan.","fra 23.750 kr. ekskl. moms","/beslutningsmoede/"],
      task_ms: ["Opsætning af agent eller workflow","Vi bygger i Copilot Studio eller Power Automate, så løsningen bruger de rettigheder, I allerede har i Microsoft 365. I drift på 2 til 4 uger.","fra 14.250 kr. ekskl. moms","/ai-agenter/"],
      task_no: ["Opsætning af agent eller workflow","Vi bygger i n8n eller Make med ChatGPT eller Claude, så det virker med Google Workspace og andre systemer. I drift på 2 til 4 uger.","fra 14.250 kr. ekskl. moms","/ai-agenter/"],
      secure_ms: ["Sikker Copilot-opsætning","Vi gennemgår adgang og deling i SharePoint og Teams, skriver jeres AI-politik og tænder for Copilot til den første gruppe.","fra 23.750 kr. ekskl. moms","/copilot/"],
      secure_no: ["Sikker AI-opsætning","Vi sætter ChatGPT Business, Claude Team eller Gemini op med styr på adgang, dataregler og en AI-politik.","fra 23.750 kr. ekskl. moms","/copilot/"],
      grant: "Med mindst 2 årsværk kan analysen og planen laves som et SMV:Digital-forløb med 50 % tilskud.",
      solo: "Som selvstændig eller privat får du altid prisen inkl. moms i tilbuddet.",
      mid: "Med 10 eller flere ansatte er et beslutningsmøde for ledelsen ofte det bedste første skridt, så retningen er besluttet, før noget bygges."
    };
    var setG = function () {
      var goal = guide.goal.value, size = guide.size.value, ms = guide.ms.value !== "no";
      var key = goal === "task" ? (ms ? "task_ms" : "task_no") : goal === "secure" ? (ms ? "secure_ms" : "secure_no") : goal;
      if (goal === "start" && size === "mid") key = "lead";
      var r = G[key];
      document.getElementById("g-title").textContent = r[0];
      document.getElementById("g-text").textContent = r[1];
      document.getElementById("g-price").textContent = r[2];
      var note = size === "1" ? G.solo : (goal === "start" && size === "mid") ? G.mid : G.grant;
      document.getElementById("g-note").textContent = note;
      var link = document.getElementById("g-link");
      var more = lang === "en" ? "Read more" : "Læs mere";
      link.href = r[3]; link.textContent = r[3].indexOf("#") >= 0 ? (lang === "en" ? "See services" : "Se ydelser") : more + ": " + r[0];
    };
    guide.addEventListener("change", function () {
      setG();
      var out = document.querySelector(".guide-out");
      if (window.innerWidth < 900 && out.getBoundingClientRect().top > window.innerHeight - 120) {
        out.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    });
    setG();
  }

  // Beregner
  var calc = document.getElementById("calc");
  if (calc) {
    var fmt = new Intl.NumberFormat(lang === "en" ? "en-GB" : "da-DK");
    var L = lang === "en"
      ? { kr: " DKK", pay: function (m) { return m === null ? "over 3 years" : "approx. " + m + (m === 1 ? " month" : " months"); } }
      : { kr: " kr.", pay: function (m) { return m === null ? "over 3 år" : "ca. " + m + " mdr."; } };
    var update = function () {
      var h = Math.max(0, parseFloat(calc.hours.value) || 0);
      var r = Math.max(0, parseFloat(calc.rate.value) || 0);
      var s = parseFloat(calc.share.value) / 100;
      var sol = calc.solution.value.split("|");
      var once = parseFloat(sol[0]), monthly = parseFloat(sol[1]);
      calc.shareOut.value = Math.round(s * 100) + " %";
      var hoursYear = Math.round(h * s * 46);
      var valueYear = hoursYear * r;
      var netMonth = valueYear / 12 - monthly;
      var months = netMonth > 0 ? Math.max(1, Math.ceil(once / netMonth)) : null;
      if (months !== null && months > 36) months = null;
      document.getElementById("c-hours").textContent = fmt.format(hoursYear);
      document.getElementById("c-value").textContent = fmt.format(valueYear) + L.kr;
      document.getElementById("c-payback").textContent = L.pay(months);
    };
    calc.addEventListener("input", update);
    update();
  }

  // Ansøgningsrunde: ret kun datoen her. Efter datoen skiftes teksten automatisk.
  var ROUND_END = "2026-11-16T23:55:00+01:00";
  if (new Date() > new Date(ROUND_END)) {
    document.querySelectorAll("[data-round-closed]").forEach(function (el) {
      el.textContent = el.getAttribute("data-round-closed");
    });
  }

  // Afsnit under folden toner ind, første gang de rulles i syne. Det, der allerede er i syne, står fast.
  if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var rvEls = Array.prototype.slice.call(document.querySelectorAll(".section-head, .example, .price-row, .price-box, .tailored, .principles-list li, .quote-card, .photo, .faq details, .tl li, .deliv .example"));
    var fold = window.innerHeight * .85;
    rvEls = rvEls.filter(function (el) { return el.getBoundingClientRect().top > fold; });
    if (rvEls.length) {
      var rio = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); rio.unobserve(e.target); } });
      }, { threshold: .15, rootMargin: "0px 0px -6% 0px" });
      rvEls.forEach(function (el) { el.classList.add("rv"); rio.observe(el); });
      // Reserve: skulle noget aldrig blive observeret, vises det efter et øjeblik
      setTimeout(function () { rvEls.forEach(function (el) { if (!el.classList.contains("in") && el.getBoundingClientRect().top < window.innerHeight) el.classList.add("in"); }); }, 2500);
    }
  }

  // Diagrammer i undersidernes hero: samme tændings-animation som forsidens panel
  document.querySelectorAll(".flow ol").forEach(function (ol) { if (ol.id !== "flow-steps") ol.classList.add("run"); });

  // Kopiér tekst med reserve for browsere uden Clipboard API
  function copyText(text, status, okMsg, failMsg) {
    var ok = function () { status.textContent = okMsg; };
    var fallback = function () {
      var ta = document.createElement("textarea"); ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "absolute"; ta.style.left = "-9999px";
      document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); ok(); } catch (err) { status.textContent = failMsg; }
      document.body.removeChild(ta);
    };
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(ok, fallback); else fallback();
  }

  // Skabelonen: kopiér hele teksten som ren tekst uden forklaringerne
  var tpl = document.getElementById("template");
  if (tpl) {
    tpl.querySelector(".copy-template").addEventListener("click", function () {
      var parts = [];
      tpl.querySelectorAll("h3, ul, p:not(.note):not(.template-tools)").forEach(function (el) {
        if (el.tagName === "UL") { el.querySelectorAll("li").forEach(function (li) { parts.push("- " + li.textContent.trim()); }); parts.push(""); }
        else if (el.tagName === "H3") { parts.push(el.textContent.trim().toUpperCase()); }
        else { parts.push(el.textContent.trim()); parts.push(""); }
      });
      copyText(parts.join("\n"), tpl.querySelector(".copy-status"), lang === "en" ? "Copied. Paste it into your own document." : "Kopieret. Indsæt den i jeres eget dokument.", lang === "en" ? "Copying failed. Select the text and copy it yourself." : "Kopieringen mislykkedes. Markér teksten, og kopiér den selv.");
    });
  }

  // På denne side: vises, når heroen er rullet ud af syne, og følger læsningen
  var toc = document.querySelector(".toc");
  if (toc) {
    var heroEl = document.querySelector(".hero");
    var links = [].slice.call(toc.querySelectorAll("a"));
    var heads = links.map(function (a) { return document.getElementById(a.getAttribute("href").slice(1)); });
    var updToc = function () {
      var y = window.scrollY + 140, cur = -1;
      heads.forEach(function (h, i) { if (h && h.offsetTop <= y) cur = i; });
      links.forEach(function (a, i) { a.classList.toggle("is-current", i === cur); });
      toc.classList.toggle("show", !heroEl || window.scrollY > heroEl.offsetTop + heroEl.offsetHeight - 80);
    };
    window.addEventListener("scroll", updToc, { passive: true }); window.addEventListener("resize", updToc); updToc();
  }

  // SMV:Digital-kampagne: bånd, delt regning, tidslinje og tjek (runden 9. til 16. november 2026)
  (function () {
    var en = document.documentElement.lang === "en";
    var OPENS = new Date("2026-10-26T00:00:00+01:00"), START = new Date("2026-11-09T09:00:00+01:00"), END = new Date(ROUND_END);
    var now = new Date(), reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var days = function (a, b) { return Math.max(0, Math.ceil((b - a) / 864e5)); };
    var sameDay = function (a, b) { return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate(); };
    var om = function (target) { return sameDay(now, target) ? (en ? "today" : "i dag") : (en ? "in <span class=\"days\">" + dd(days(now, target)) + "</span>" : "om <span class=\"days\">" + dd(days(now, target)) + "</span>"); };
    var dd = function (n) { return n === 1 ? (en ? "1 day" : "1 dag") : n + (en ? " days" : " dage"); };
    var fmt = function (n) { return en ? n.toLocaleString("en-GB") + " DKK" : n.toLocaleString("da-DK") + " kr."; };

    var bar = document.getElementById("cbar"), bt = document.getElementById("cbar-text");
    if (bar) {
      if (now > END) bar.hidden = true;
      else if (bt) {
        var tag = "<strong>SMV:Digital:</strong> ";
        if (now < OPENS) bt.innerHTML = tag + (en ? "The draft opens " + om(OPENS) + ", and applications run 9 to 16 November. The grant is up to 150,000 DKK."
                                             : "Kladden åbner " + om(OPENS) + ", og der søges 9. til 16. november. Tilskuddet er op til 150.000 kr.");
        else if (now < START) bt.innerHTML = tag + (en ? "The draft is open. The application window opens " + om(START) + ", 9 November at 9:00. The grant is up to 150,000 DKK."
                                                       : "Kladden er åben. Ansøgningsvinduet åbner " + om(START) + ", 9. november kl. 9. Tilskuddet er op til 150.000 kr.");
        else bt.innerHTML = tag + (en ? "The application window is open and closes " + om(END) + ", 16 November at 23:55."
                                      : "Ansøgningsvinduet er åbent og lukker " + om(END) + ", 16. november kl. 23.55.");
      }
    }

    var split = document.getElementById("split"), spend = document.getElementById("spend");
    if (split && spend) {
      var upd = function () {
        var v = +spend.value, g = Math.min(v / 2, 150000);
        document.getElementById("s-spend").textContent = fmt(v);
        document.getElementById("s-grant").textContent = fmt(g);
        document.getElementById("s-you").textContent = fmt(v - g);
        split.style.setProperty("--state", (g / v * 100) + "%");
      };
      spend.addEventListener("input", upd); upd();
    }

    var tl = document.getElementById("tl");
    var placeTl = function () {
      if (!tl) return;
      var items = [].slice.call(tl.querySelectorAll("li")), idx = 0;
      items.forEach(function (li, i) { if (now >= new Date(li.getAttribute("data-from"))) idx = i; });
      items.forEach(function (li, i) {
        li.classList.toggle("done", i < idx); li.classList.toggle("now", i === idx);
        var h = li.querySelector(".here"); if (h) h.parentNode.removeChild(h);
        if (i === idx) li.insertAdjacentHTML("beforeend", "<span class=\"here\">" + (en ? "You are here" : "I er her") + "</span>");
      });
      var t = items[idx];
      tl.setAttribute("data-pos", t.offsetTop + "px");
      if (tl.getAttribute("data-shown")) tl.style.setProperty("--fill", tl.getAttribute("data-pos"));
      var lead = document.getElementById("tl-lead");
      if (lead && now <= END) lead.textContent = sameDay(now, END)
        ? (en ? "The deadline is today, 16 November at 23:55." : "Fristen er i dag, 16. november kl. 23.55.")
        : (en ? "There are " + dd(days(now, END)) + " until the deadline on 16 November. A good project description takes time, so start with the assessment now."
              : "Der er " + dd(days(now, END)) + " til ansøgningsfristen 16. november. En god projektbeskrivelse tager tid, så start med afklaringen nu.");
    };
    placeTl(); window.addEventListener("resize", placeTl);

    var boxes = [].slice.call(document.querySelectorAll("#check input"));
    if (boxes.length) {
      var chk = function () {
        var n = boxes.filter(function (b) { return b.checked; }).length, v = document.getElementById("verdict"), x = document.getElementById("verdict-text");
        document.getElementById("meter").style.setProperty("--m", (n / boxes.length * 100) + "%");
        if (n === boxes.length) { v.textContent = en ? "You look eligible to apply." : "I ser ud til at kunne søge."; x.textContent = en ? "The next step is a free call where we assess whether the project has a good chance and what the application should say." : "Næste skridt er en gratis samtale, hvor vi vurderer, om projektet har en god chance, og hvad der skal stå i ansøgningen."; }
        else if (n === 0) { v.textContent = en ? "Tick the boxes to see if you can apply." : "Sæt flueben for at se, om I kan søge."; x.textContent = ""; }
        else { v.textContent = en ? n + " of " + boxes.length + " requirements met." : n + " af " + boxes.length + " krav er opfyldt."; x.textContent = en ? "If you are missing a requirement, you can still start with an AI clarity session for 2,200 DKK and apply in a later round." : "Mangler I et eller flere krav, kan I stadig starte med en AI-afklaring til 2.200 kr. og søge i en senere runde."; }
      };
      boxes.forEach(function (b) { b.addEventListener("change", chk); }); chk();
    }

    if (split && !reduce && "IntersectionObserver" in window) split.classList.add("pre");
    var show = function (el) {
      if (el.id === "split") el.classList.remove("pre");
      if (el.id === "tl") { el.setAttribute("data-shown", "1"); el.style.setProperty("--fill", el.getAttribute("data-pos")); }
    };
    var targets = [split, tl].filter(Boolean);
    if ("IntersectionObserver" in window && !reduce) {
      var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { show(e.target); io.unobserve(e.target); } }); }, { threshold: .35 });
      targets.forEach(function (el) { io.observe(el); });
      // Reserve: vis modulet, når det er i synsfeltet, også hvis observeren ikke melder
      var seen = function () { targets.forEach(function (el) { var r = el.getBoundingClientRect(); if (r.top < innerHeight * .85 && r.bottom > 0) show(el); }); };
      window.addEventListener("scroll", seen, { passive: true }); setTimeout(seen, 1500);
    } else targets.forEach(show);
  })();

  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
})();
