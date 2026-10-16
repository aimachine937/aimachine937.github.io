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

  // Priser: virksomhed (ekskl. moms) eller privat (inkl. moms)
  var fmt = new Intl.NumberFormat(lang === "en" ? "en-GB" : "da-DK", { maximumFractionDigits: 0 });
  var labels = {
    da: { ex: "ekskl. moms", inc: "inkl. moms", from: "fra ", kr: " kr.", month: " kr./md.", hour: " kr./time" },
    en: { ex: "excl. VAT", inc: "incl. VAT", from: "from ", kr: " DKK", month: " DKK/month", hour: " DKK/hour" }
  }[lang];

  function render(mode) {
    document.querySelectorAll("[data-ex]").forEach(function (el) {
      var ex = parseFloat(el.getAttribute("data-ex"));
      var val = mode === "inc" ? Math.round(ex * 1.25) : ex;
      var unit = el.getAttribute("data-unit");
      var suffix = unit === "month" ? labels.month : unit === "hour" ? labels.hour : labels.kr;
      var from = el.hasAttribute("data-from") ? labels.from : "";
      el.textContent = from + fmt.format(val) + suffix;
    });
    document.querySelectorAll("[data-vat]").forEach(function (el) {
      el.textContent = mode === "inc" ? labels.inc : labels.ex;
    });
    document.querySelectorAll(".price-toggle button").forEach(function (b) {
      b.setAttribute("aria-pressed", b.getAttribute("data-mode") === mode ? "true" : "false");
    });
  }
  document.querySelectorAll(".price-toggle button").forEach(function (b) {
    b.addEventListener("click", function () { render(b.getAttribute("data-mode")); });
  });

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
      var done = document.getElementById("form-done");
      if (!done) {
        done = document.createElement("p"); done.id = "form-done"; done.className = "form-done"; done.setAttribute("role", "status");
        form.appendChild(done);
      }
      done.textContent = lang === "en"
        ? "Your email program should now open with the message ready. Press send there. Nothing happened? Write to " + EMAIL + "."
        : "Nu skulle dit mailprogram åbne med beskeden klar. Tryk send derinde. Skete der ikke noget? Skriv til " + EMAIL + ".";
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
      start: ["AI clarity session","90 minutes where we find the two or three tasks that save the most time and choose the tool. You get a written plan.","2,200 DKK excl. VAT","/en/#services"],
      lead:  ["Leadership workshop","Half a day where owners and leadership choose the first two AI tasks, with owner, goal, budget and timeline.","from 23,750 DKK excl. VAT","/en/leadership-workshop/"],
      task_ms: ["AI agent or workflow setup","We build it in Copilot Studio or Power Automate, so it uses the permissions you already have in Microsoft 365. Live in 2 to 4 weeks.","from 14,250 DKK excl. VAT","/en/ai-agents/"],
      task_no: ["AI agent or workflow setup","We build it in n8n or Make with ChatGPT or Claude, so it works with Google Workspace and other systems. Live in 2 to 4 weeks.","from 14,250 DKK excl. VAT","/en/ai-agents/"],
      secure_ms: ["Secure Copilot setup","We review access and sharing in SharePoint and Teams, write your AI policy and switch Copilot on for the first group.","from 23,750 DKK excl. VAT","/en/copilot/"],
      secure_no: ["Secure AI setup","We set up ChatGPT Business, Claude Team or Gemini with access, data rules and an AI policy in place.","from 23,750 DKK excl. VAT","/en/copilot/"],
      grant: "With at least 2 full time equivalents, the analysis and plan can be an SMV:Digital programme with a 50 % grant.",
      solo: "As a sole trader or private individual, you always get the price incl. VAT in the offer.",
      mid: "With 10 or more staff, a leadership workshop is often the best first step, so the direction is decided before anything is built."
    } : {
      start: ["AI-afklaring","90 minutter, hvor vi finder de to eller tre opgaver, der sparer mest tid, og vælger værktøj. Du får en skriftlig plan.","2.200 kr. ekskl. moms","/#ydelser"],
      lead:  ["Ledelsesworkshop","En halv dag, hvor ejere og ledelse vælger de første to AI-opgaver, med ejer, mål, budget og tidsplan.","fra 23.750 kr. ekskl. moms","/ledelsesworkshop/"],
      task_ms: ["Opsætning af agent eller workflow","Vi bygger i Copilot Studio eller Power Automate, så løsningen bruger de rettigheder, I allerede har i Microsoft 365. I drift på 2 til 4 uger.","fra 14.250 kr. ekskl. moms","/ai-agenter/"],
      task_no: ["Opsætning af agent eller workflow","Vi bygger i n8n eller Make med ChatGPT eller Claude, så det virker med Google Workspace og andre systemer. I drift på 2 til 4 uger.","fra 14.250 kr. ekskl. moms","/ai-agenter/"],
      secure_ms: ["Sikker Copilot-opsætning","Vi gennemgår adgang og deling i SharePoint og Teams, skriver jeres AI-politik og tænder for Copilot til den første gruppe.","fra 23.750 kr. ekskl. moms","/copilot/"],
      secure_no: ["Sikker AI-opsætning","Vi sætter ChatGPT Business, Claude Team eller Gemini op med styr på adgang, dataregler og en AI-politik.","fra 23.750 kr. ekskl. moms","/copilot/"],
      grant: "Med mindst 2 årsværk kan analysen og planen laves som et SMV:Digital-forløb med 50 % tilskud.",
      solo: "Som selvstændig eller privat får du altid prisen inkl. moms i tilbuddet.",
      mid: "Med 10 eller flere ansatte er en ledelsesworkshop ofte det bedste første skridt, så retningen er besluttet, før noget bygges."
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
  var ROUND_END = "2026-11-16T23:59:59+01:00";
  if (new Date() > new Date(ROUND_END)) {
    document.querySelectorAll("[data-round-closed]").forEach(function (el) {
      el.textContent = el.getAttribute("data-round-closed");
    });
  }

  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
})();
