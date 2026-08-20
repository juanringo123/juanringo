const header = document.querySelector("#siteHeader");
const menuToggle = document.querySelector("#menuToggle");
const mobileMenu = document.querySelector("#mobileMenu");
const menuIcon = menuToggle?.querySelector("i");

function configureYouTubeEmbeds() {
  const pageOrigin = window.location.origin && window.location.origin !== "null" ? window.location.origin : "";

  document.querySelectorAll("iframe[data-youtube-id]").forEach((iframe) => {
    const videoId = iframe.dataset.youtubeId;
    if (!videoId) return;

    const embedUrl = new URL(`https://www.youtube.com/embed/${videoId}`);
    embedUrl.searchParams.set("rel", "0");
    embedUrl.searchParams.set("modestbranding", "1");
    embedUrl.searchParams.set("playsinline", "1");

    if (pageOrigin) {
      embedUrl.searchParams.set("origin", pageOrigin);
    }

    iframe.referrerPolicy = "strict-origin-when-cross-origin";
    iframe.src = embedUrl.toString();
  });
}

configureYouTubeEmbeds();

function syncHeader() {
  header?.classList.toggle("is-scrolled", window.scrollY > 12);
}

function closeMobileMenu() {
  mobileMenu?.classList.remove("is-open");
  menuToggle?.setAttribute("aria-expanded", "false");
  menuToggle?.setAttribute("aria-label", "Open navigation menu");
  menuIcon?.classList.remove("fa-xmark");
  menuIcon?.classList.add("fa-bars");
}

menuToggle?.addEventListener("click", () => {
  const isOpen = mobileMenu?.classList.toggle("is-open");
  menuToggle.setAttribute("aria-expanded", String(Boolean(isOpen)));
  menuToggle.setAttribute("aria-label", isOpen ? "Close navigation menu" : "Open navigation menu");
  menuIcon?.classList.toggle("fa-bars", !isOpen);
  menuIcon?.classList.toggle("fa-xmark", Boolean(isOpen));
});

window.addEventListener("scroll", syncHeader, { passive: true });
syncHeader();

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const targetId = link.getAttribute("href");
    if (!targetId || targetId === "#") return;

    const target = document.querySelector(targetId);
    if (!target) return;

    event.preventDefault();
    closeMobileMenu();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

const musicCards = document.querySelectorAll(".music-card");
let activeAudio = null;
let activeButton = null;

function updateButton(button, isPlaying) {
  const icon = button?.querySelector("i");
  const text = button?.querySelector(".button-text");
  const title = button?.closest(".music-card")?.dataset.title || "track";

  icon?.classList.toggle("fa-play", !isPlaying);
  icon?.classList.toggle("fa-pause", isPlaying);
  if (text) text.textContent = isPlaying ? "Pause" : "Play";
  button?.setAttribute("aria-label", `${isPlaying ? "Pause" : "Play"} ${title}`);
  button?.closest(".music-card")?.classList.toggle("is-playing", isPlaying);
}

function pauseCurrent(exceptAudio = null) {
  if (activeAudio && activeAudio !== exceptAudio) {
    activeAudio.pause();
    activeAudio.currentTime = 0;
  }
  if (activeButton && activeAudio !== exceptAudio) {
    updateButton(activeButton, false);
  }
}

musicCards.forEach((card) => {
  const audio = card.querySelector("audio");
  const button = card.querySelector(".play-button");

  button?.addEventListener("click", async () => {
    if (!audio) return;

    if (!audio.paused) {
      audio.pause();
      updateButton(button, false);
      activeAudio = null;
      activeButton = null;
      return;
    }

    pauseCurrent(audio);
    activeAudio = audio;
    activeButton = button;

    try {
      await audio.play();
      updateButton(button, true);
    } catch (error) {
      updateButton(button, false);
      activeAudio = null;
      activeButton = null;
      console.warn("Audio playback was blocked or unavailable.", error);
    }
  });

  audio?.addEventListener("ended", () => {
    updateButton(button, false);
    if (activeAudio === audio) {
      activeAudio = null;
      activeButton = null;
    }
  });

  audio?.addEventListener("pause", () => {
    if (activeAudio === audio && audio.currentTime < audio.duration) {
      updateButton(button, false);
    }
  });
});

const revealItems = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18 }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}
