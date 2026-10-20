// jemmajeon 공통 추적 (홈페이지 · 블로그가 함께 쓴다). 규칙은 /UTM.md.
// 1) 들어올 때 붙은 utm_* 를 세션 첫 유입으로 저장하고 주소창에서 지운다
//    (주소를 복사해 다시 공유해도 출처가 섞이지 않게).
// 2) 링크 클릭을 이벤트로 남긴다. 사이트 안 이동에는 UTM을 붙이지 않는다 — 붙이면 GA4가 유입 경로를 덮어쓴다.
// 3) 페이지는 window.jjTrack(name, params) 로 자기 이벤트를 남긴다. 모든 이벤트에 첫 유입 캠페인이 같이 붙는다.
(function () {
  var KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "l"];
  var STORE = "jj_first_touch";
  var first = null;
  try { first = JSON.parse(sessionStorage.getItem(STORE) || "null"); } catch (e) { first = null; }

  var url = new URL(location.href), got = {}, any = false;
  KEYS.forEach(function (k) { var v = url.searchParams.get(k); if (v && k !== "l") { got[k] = v.slice(0, 100); any = true; } });
  if (any) {
    if (!first) { first = got; first.landing = location.pathname; try { sessionStorage.setItem(STORE, JSON.stringify(first)); } catch (e) {} }
    // GA4가 page_view에서 UTM을 읽을 시간을 준 뒤 주소창 정리
    setTimeout(function () {
      KEYS.forEach(function (k) { if (k !== "l") url.searchParams.delete(k); });
      try { history.replaceState(history.state, "", url.pathname + (url.search || "") + url.hash); } catch (e) {}
    }, 1500);
  }

  function ctx() {
    var c = {page_type: document.body.getAttribute("data-page") || "page", site_section: location.pathname.indexOf("/blog/") === 0 ? "blog" : "home"};
    if (first) { c.ft_source = first.utm_source || ""; c.ft_medium = first.utm_medium || ""; c.ft_campaign = first.utm_campaign || ""; }
    return c;
  }
  function send(name, params) {
    if (typeof window.gtag !== "function") return;
    var p = ctx(); for (var k in params || {}) p[k] = params[k];
    window.gtag("event", name, p);
  }
  window.jjTrack = send;

  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a[href]");
    if (!a || a.hasAttribute("data-notrack")) return;
    var href = a.href, zoneEl = a.closest("[data-zone]");
    var p = {link_text: (a.getAttribute("data-label") || a.textContent || "").trim().replace(/\s+/g, " ").slice(0, 80), link_url: href.slice(0, 200), zone: zoneEl ? zoneEl.getAttribute("data-zone") : "body"};
    if (a.hasAttribute("data-place")) p.place = a.getAttribute("data-place");
    send(href.indexOf(location.origin) === 0 ? "nav_click" : "outbound_click", p);
  }, true);
})();
