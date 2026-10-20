// 홈(index.html)과 프로젝트 페이지(project.html?p=<id>)를 projects.json으로 그린다.
(function () {
  var page = document.body.getAttribute("data-page");
  // 이벤트는 공통 추적(assets/track.js)의 jjTrack으로 남긴다. 링크 클릭은 track.js가 알아서 남김.
  function track(name, params) { if (window.jjTrack) window.jjTrack(name, params); }
  function el(tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; }
  function statusCls(s) { return /운영/.test(s) ? "live" : /완료/.test(s) ? "done" : "wip"; }
  function fmt(d) { return d.length === 10 ? d.replace(/-/g, ".") : d.replace("-", "."); }
  function find(data, id) { return data.projects.find(function (p) { return p.id === id; }); }

  function archiveRows(entries, withProject) {
    return entries.map(function (e) {
      var li = el("li");
      li.append(el("span", "d", fmt(e.date)));
      if (withProject) { var p = el("span", "p"), a = el("a", null, e.project.title); a.href = "project.html?p=" + e.project.id; p.append(a); li.append(p); }
      var body = el("span"); body.append(el("b", null, e.title)); if (e.text) body.append(el("span", "t", e.text));
      li.append(body);
      return li;
    });
  }

  function home(d) {
    var pf = d.profile;
    var hl = document.getElementById("headline"); hl.replaceChildren();
    pf.headline.split(/(\[[^\]]+\])/).forEach(function (s) { if (/^\[/.test(s)) hl.append(el("mark", null, s.slice(1, -1))); else if (s) hl.append(s); });
    document.getElementById("intro-text").textContent = pf.intro;
    var links = document.getElementById("links");
    pf.links.forEach(function (l) { var a = el("a"); a.href = l.url; if (/^http/.test(l.url) && l.url.indexOf("jemmajeon.github.io") < 0) { a.target = "_blank"; a.rel = "noopener"; } a.append(el("b", null, l.label + " →"), el("span", null, l.note)); links.append(a); });
    var th = document.getElementById("themes");
    th.append(el("div", "th-hd", "제가 좋아하는 개발은요"));
    d.themes.forEach(function (t) { var row = el("div", "theme"); row.append(el("span", "n", "👉"), el("b", null, t.title), el("p", null, t.text)); th.append(row); });

    var state = {cat: "전체", shown: 8};
    var f = document.getElementById("filters");
    ["전체"].concat(d.categories).forEach(function (c) {
      var b = el("button", null, c); b.type = "button"; b.setAttribute("aria-pressed", c === state.cat);
      b.onclick = function () { track("filter_projects", {category: c}); state.cat = c; f.querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-pressed", x === b); }); grid(); };
      f.append(b);
    });
    function grid() {
      var g = document.getElementById("projects-grid"); g.replaceChildren();
      d.projects.filter(function (p) { return state.cat === "전체" || p.category === state.cat; }).forEach(function (p) {
        var a = el("a", "pcard"); a.href = "project.html?p=" + p.id; a.setAttribute("data-notrack", "");
        a.addEventListener("click", function () { track("select_project", {project_id: p.id, project_category: p.category, filter: state.cat}); });
        var shot = el("div", "shot" + (p.shots && p.shots.length ? "" : " blank"));
        if (p.shots && p.shots.length) { var img = el("img"); img.src = p.shots[0].src; img.alt = p.shots[0].caption; img.loading = "lazy"; shot.append(img); }
        else shot.append(el("span", null, p.private ? "비공개 화면" : p.category));
        var body = el("div", "body");
        var row = el("div", "row"); row.append(el("span", null, p.category), el("span", null, (p.since || "") + " ~"));
        body.append(row, el("h3", null, p.title), el("p", null, p.oneliner));
        var foot = el("div", "foot"); foot.append(el("span", "status " + statusCls(p.status), p.status));
        if (p.archive.length) foot.append(el("span", "tag", "기록 " + p.archive.length));
        (p.stack || []).slice(0, 3).forEach(function (s) { foot.append(el("span", "tag", s)); });
        body.append(foot); a.append(shot, body); g.append(a);
      });
    }
    grid();

    var all = [];
    d.projects.forEach(function (p) { p.archive.forEach(function (e) { all.push(Object.assign({project: p}, e)); }); });
    all.sort(function (a, b) { return a.date < b.date ? 1 : -1; });
    document.getElementById("archive-count").textContent = "프로젝트 " + d.projects.length + "개 · 기록 " + all.length + "개";
    var tl = document.getElementById("timeline"), more = document.getElementById("more");
    function tlRender() { tl.replaceChildren.apply(tl, archiveRows(all.slice(0, state.shown), true)); more.hidden = all.length <= state.shown; }
    more.onclick = function () { track("archive_more", {shown: state.shown}); state.shown += 20; tlRender(); };
    tlRender();
    document.getElementById("updated").textContent = "갱신 " + fmt(d.updated);
    if (pf.signoff) document.getElementById("bye").textContent = pf.signoff;
  }

  function project(d) {
    var id = new URLSearchParams(location.search).get("p"), p = find(d, id), root = document.getElementById("project");
    if (!p) { root.append(el("p", "note", "프로젝트를 찾지 못했어요.")); return; }
    document.title = p.title + " — jemmajeon";
    track("view_project", {project_id: p.id, project_category: p.category, referrer_host: document.referrer ? new URL(document.referrer).host : "(direct)"});
    var head = el("header", "p-head");
    var back = el("a", "back", "← 전체 프로젝트"); back.href = "./#projects"; head.append(back);
    head.append(el("span", "cat", p.category + (p.since ? " · " + p.since + " ~" : "")), el("h1", null, p.title), el("p", "one", p.oneliner));
    var meta = el("div", "meta"); meta.append(el("span", "status " + statusCls(p.status), p.status));
    (p.stack || []).forEach(function (s) { meta.append(el("span", "tag", s)); });
    if (p.link) { var a = el("a", null, p.link.label + " →"); a.href = p.link.url; meta.append(a); }
    head.append(meta); root.append(head);

    var grid = el("div", "p-grid"), desc = el("div", "p-desc");
    p.description.forEach(function (t) { desc.append(el("p", null, t)); });
    grid.append(desc);
    if (p.how && p.how.length) {
      var how = el("aside", "how"); how.append(el("h3", null, "어떻게 돌아가나"));
      var ol = el("ol"); p.how.forEach(function (s) { ol.append(el("li", null, s)); }); how.append(ol); grid.append(how);
    }
    root.append(grid);

    var sec = el("section", "sec"), hd = el("div", "sec-hd"); hd.append(el("h2", null, "화면"));
    sec.append(hd);
    if (p.shots && p.shots.length) {
      var gal = el("div", "gallery");
      p.shots.forEach(function (s) { var fig = el("figure"), img = el("img"); img.src = s.src; img.alt = s.caption; img.loading = "lazy"; fig.append(img, el("figcaption", null, s.caption)); gal.append(fig); });
      sec.append(gal);
    } else sec.append(el("p", "note", p.private ? "개인 정보가 많아 화면은 공개하지 않아요." : "공개할 화면을 정리하고 있어요."));
    root.append(sec);

    var ar = el("section", "sec"), ah = el("div", "sec-hd"); ah.append(el("h2", null, "아카이브"), el("span", "sub", p.archive.length ? "기록 " + p.archive.length + "개 · 최신순" : ""));
    ar.append(ah);
    if (p.archive.length) {
      var entries = p.archive.slice().sort(function (a, b) { return a.date < b.date ? 1 : -1; });
      var tl = el("ol", "timeline solo"); archiveRows(entries, false).forEach(function (li) { tl.append(li); }); ar.append(tl);
    } else ar.append(el("p", "note", "아직 기록이 없어요."));
    root.append(ar);
  }

  fetch("projects.json", {cache: "no-cache"}).then(function (r) { return r.json(); })
    .then(function (d) { (page === "project" ? project : home)(d); })
    .catch(function () { document.querySelector("main").append(el("p", "note", "내용을 불러오지 못했어요. 새로고침해 주세요.")); });
})();
